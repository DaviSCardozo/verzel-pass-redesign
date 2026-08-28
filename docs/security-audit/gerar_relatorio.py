#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de Relatorio de Auditoria de Seguranca - Verzel Pass Redesign
"""

import os
import io
import datetime
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import Flowable

COR_CRITICA    = HexColor("#B91C1C")
COR_ALTA       = HexColor("#EA580C")
COR_MEDIA      = HexColor("#D97706")
COR_BAIXA      = HexColor("#2563EB")
COR_INFO       = HexColor("#6B7280")
COR_FORTE      = HexColor("#059669")

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm
PROJETO = "Verzel Pass Redesign"
DATA_AUDITORIA = datetime.date.today().strftime("%d/%m/%Y")

ACHADOS = [
    {
        "id": "F1", "categoria": "Chaves Expostas", "severidade": "Alta",
        "arquivo": "api/.env", "linha": "6-7",
        "titulo": "TMDB_API_KEY real e JWT_SECRET fraco em arquivo .env local",
        "descricao": "O arquivo api/.env contem a chave real da API TMDb (f7b09643311c852a39a9fdbc49c47f6e) e o JWT_SECRET com valor padrao 'chave-provisoria-trocar-em-producao'. O risco primario e um commit acidental que exporia as credenciais.",
        "trecho": "TMDB_API_KEY=f7b09643311c852a39a9fdbc49c47f6e\nJWT_SECRET=chave-provisoria-trocar-em-producao",
        "explorabilidade": "Se commitado, qualquer um pode usar a chave TMDb (abuso de cota) e assinar JWTs arbitrarios impersonando qualquer usuario.",
    },
    {
        "id": "F2", "categoria": "Chaves Expostas", "severidade": "Alta",
        "arquivo": "api/src/config/env.ts", "linha": "16",
        "titulo": "JWT_SECRET com default fraco no schema Zod — sem validacao anti-default",
        "descricao": "JWT_SECRET: z.string().min(10).default('chave-provisoria-trocar-em-producao'). Se a variavel nao for definida em producao, o app sobe silenciosamente com um segredo publico.",
        "trecho": "JWT_SECRET: z.string().min(10).default('chave-provisoria-trocar-em-producao'),",
        "explorabilidade": "Atacante pode forjar JWTs validos com qualquer sub/role usando o segredo publico. Desabilita toda autenticacao.",
    },
    {
        "id": "F3", "categoria": "Chaves Expostas", "severidade": "Media",
        "arquivo": "web/lib/user-context.tsx", "linha": "26,33,40,47",
        "titulo": "Senhas das contas seed hardcoded no bundle JS do frontend",
        "descricao": "PRESET_USERS contem password:'123456' para todas as contas (CUSTOMER x2, ORGANIZER, DOORMAN). Este codigo compila para o bundle JS servido ao navegador.",
        "trecho": "{ email: 'organizador@eventos.com', password: '123456', role: 'ORGANIZER' },",
        "explorabilidade": "Qualquer pessoa pode abrir DevTools, ler o bundle JS e obter login direto como ORGANIZER ou DOORMAN escalando privilegios.",
    },
    {
        "id": "F4", "categoria": "Chaves Expostas", "severidade": "Media",
        "arquivo": "api/src/config/env.ts", "linha": "11,15",
        "titulo": "CORS_ORIGIN=* e DATABASE_URL com credenciais padrao nos defaults",
        "descricao": "CORS_ORIGIN default '*' + credentials:true permite qualquer origem. DATABASE_URL default usa postgres:postgres.",
        "trecho": "CORS_ORIGIN: z.string().default('*'),\nDATABASE_URL: z.string().url().default('postgres://postgres:postgres@...')",
        "explorabilidade": "CORS aberto com credentials:true permite CSRF em qualquer dominio. Credenciais trivialmente adivinhaveis.",
    },
    {
        "id": "F5", "categoria": "Permissao no Navegador", "severidade": "Media",
        "arquivo": "web/app/page.tsx", "linha": "117-122",
        "titulo": "Link Publicar Evento visivel para todos sem gate de papel no frontend",
        "descricao": "O botao '+ Publicar Evento' na home nao verifica currentUser?.role === 'ORGANIZER'. O backend protege corretamente, mas a UI nao.",
        "trecho": "<Link href=\"/create-event\">\n  + Publicar Evento\n</Link>",
        "explorabilidade": "Impacto direto baixo (backend bloqueia). Expoe a existencia da rota e confunde usuarios com outros papeis.",
    },
    {
        "id": "F6", "categoria": "IDOR", "severidade": "Baixa",
        "arquivo": "api/src/routes/tickets.ts", "linha": "77-122",
        "titulo": "DOORMAN pode validar ingressos de qualquer evento (sem verificacao de posse)",
        "descricao": "POST /tickets/validate valida apenas role=DOORMAN, sem verificar se o porteiro esta atribuido ao eventId informado no corpo.",
        "trecho": "// Sem verificacao de posse do evento pelo DOORMAN\nconst ticket = await app.prisma.ticket.findUnique({ where: { code } })",
        "explorabilidade": "DOORMAN de evento A pode invalidar ingressos do evento B, causando negacao de acesso para portadores legitimos.",
    },
]

PONTOS_FORTES = [
    {"titulo": "Auth + RBAC no backend — jwtVerify() em todas as rotas protegidas", "evidencia": "api/src/plugins/auth.ts L51-76: authorize() verifica token e role. Rotas: POST /events (ORGANIZER), POST /orders (CUSTOMER), GET /tickets/me (CUSTOMER), POST /tickets/validate (DOORMAN), GET /tmdb/search (ORGANIZER)."},
    {"titulo": "Isolamento de dono nos ingressos — GET /tickets/me", "evidencia": "api/src/routes/tickets.ts L16: where: { ownerId: request.user.sub } — filtra apenas ingressos do usuario autenticado."},
    {"titulo": "customerId e organizerId extraidos do JWT, nunca do body", "evidencia": "orders.ts L29: customerId = request.user.sub | events.ts L60: organizerId: request.user.sub."},
    {"titulo": "Anti-double-booking com SELECT FOR UPDATE", "evidencia": "orders.ts L37: tx.$queryRaw`SELECT id FROM Event WHERE id=... FOR UPDATE` — lock de linha para race condition."},
    {"titulo": "Senha com bcrypt rounds=10 e erro generico no login", "evidencia": "users.ts L38 + sessions.ts L36: bcrypt.hash/compare. Mensagem 'E-mail ou senha invalidos' nao revela qual campo errou."},
    {"titulo": "QR Code assinado com JWT — forjamento impossivel sem o segredo", "evidencia": "tickets.ts L36: app.jwt.sign(ticketPayload). Validacao verifica payload.type !== 'ticket'."},
    {"titulo": "Cadastro sempre cria CUSTOMER — papeis privilegiados so via seed", "evidencia": "users.ts L45: role: Role.CUSTOMER hardcoded, nao lido do body."},
    {"titulo": "Cookie httpOnly + SameSite por ambiente", "evidencia": "sessions.ts L48-54: httpOnly:true, sameSite:'none'+secure:true em producao."},
    {"titulo": "Helmet + CORS + validacao Zod em todas as rotas", "evidencia": "app.ts L33-35: @fastify/helmet, @fastify/cors. Todas as rotas usam safeParse antes de processar."},
    {"titulo": "Zero innerHTML/dangerouslySetInnerHTML no frontend", "evidencia": "Busca em todo o frontend: nenhuma ocorrencia de XSS sink. Dados renderizados via JSX (auto-escape)."},
    {"titulo": "api/.env nunca commitado no historico git", "evidencia": "git log --all: apenas api/.env.example trackeado. .gitignore correto em cada subdiretorio."},
]

ISSUES_TEXT = [
    {
        "n": 1,
        "titulo": "[Seguranca] JWT_SECRET com default fraco e sem validacao anti-default na startup",
        "labels": "security, alta",
        "achados": "F1, F2",
        "descricao": "1. api/.env (L7): JWT_SECRET=chave-provisoria-trocar-em-producao\n2. api/src/config/env.ts (L16): .default('chave-provisoria-trocar-em-producao') — app sobe sem erro com segredo publico.",
        "impacto": "Atacante pode forjar JWTs com qualquer sub/role, impersonando qualquer usuario incluindo ORGANIZER e DOORMAN.",
        "correcao": "1. Remover .default() do JWT_SECRET no env schema\n2. Adicionar validacao que rejeite valores da lista negra\n3. Rotacionar o segredo em todos os ambientes\n4. Gerar segredo forte: openssl rand -base64 64",
        "criterios": "[ ] JWT_SECRET obrigatorio sem fallback\n[ ] Startup falha se valor igual ao default\n[ ] Segredo rotacionado em staging e producao\n[ ] Teste verifica que API recusa o default",
    },
    {
        "n": 2,
        "titulo": "[Seguranca] TMDB_API_KEY e credenciais padrao expostas em configs",
        "labels": "security, alta",
        "achados": "F1, F4",
        "descricao": "api/.env L6: TMDB_API_KEY real em arquivo commitavel.\nenv.ts L11,15: CORS_ORIGIN default '*' + DATABASE_URL com postgres:postgres.",
        "impacto": "Chave TMDb exposta: abuso de cota. CORS wildcard + credentials: CSRF. Credenciais DB adivinhaveis.",
        "correcao": "1. Revogar e rotacionar TMDB_API_KEY\n2. Remover defaults de DATABASE_URL e CORS_ORIGIN\n3. Configurar CORS_ORIGIN explicitamente por ambiente\n4. Adicionar secret scanning no CI",
        "criterios": "[ ] TMDB_API_KEY rotacionada\n[ ] Sem defaults de segredos no env schema\n[ ] CORS_ORIGIN configurado com lista de origens\n[ ] CI com trufflehog/gitleaks",
    },
    {
        "n": 3,
        "titulo": "[Seguranca] Senhas de contas seed no bundle JavaScript do frontend",
        "labels": "security, media",
        "achados": "F3",
        "descricao": "web/lib/user-context.tsx L26,33,40,47: PRESET_USERS com password:'123456' para todas as contas incluindo ORGANIZER e DOORMAN. Compilado no bundle publico.",
        "impacto": "Qualquer visitante obtem credenciais de contas privilegiadas via DevTools.",
        "correcao": "1. Remover senhas do array PRESET_USERS\n2. Feature de login rapido so em NODE_ENV=development\n3. Alterar senhas das contas seed em todos os ambientes",
        "criterios": "[ ] Senhas removidas do codigo-fonte frontend\n[ ] Contas seed com senhas fortes\n[ ] Login por preset desabilitado em producao\n[ ] Bundle nao contem strings de senha",
    },
    {
        "n": 4,
        "titulo": "[Seguranca] DOORMAN pode validar ingressos de qualquer evento (IDOR de acao)",
        "labels": "security, baixa",
        "achados": "F6",
        "descricao": "api/src/routes/tickets.ts L77-122: POST /tickets/validate valida apenas role=DOORMAN. Sem verificacao de que o porteiro esta atribuido ao eventId informado.",
        "impacto": "DOORMAN de evento A pode marcar como USED ingressos do evento B, negando acesso a portadores legitimos.",
        "correcao": "1. Criar campo assignedEventId no modelo User\n2. Verificar eventId === request.user.assignedEventId na rota\n3. Alternativa: incluir eventId no JWT do DOORMAN no login",
        "criterios": "[ ] DOORMAN so valida ingressos de seu evento\n[ ] Teste: DOORMAN de evento A recebe 403 para evento B\n[ ] Documentacao do fluxo de atribuicao",
    },
    {
        "n": 5,
        "titulo": "[Seguranca] Botao Publicar Evento sem gate de papel no frontend (home)",
        "labels": "security, media",
        "achados": "F5",
        "descricao": "web/app/page.tsx L117-122: link '+ Publicar Evento' visivel para todos sem verificar role === ORGANIZER.",
        "impacto": "Baixo impacto direto. Expoe rota e confunde usuarios com outros papeis.",
        "correcao": "Envolver o Link com {currentUser?.role === 'ORGANIZER' && ...}. Seguir padrao ja usado na Navbar.tsx L82-95.",
        "criterios": "[ ] Botao oculto para nao-ORGANIZER\n[ ] Teste: visitante e CUSTOMER nao veem o botao\n[ ] ORGANIZER continua vendo normalmente",
    },
]

def cor_sev(sev):
    return {"Alta": COR_ALTA, "Media": COR_MEDIA, "Baixa": COR_BAIXA}.get(sev, COR_INFO)

def gerar_grafico_rosca(contagens):
    labels, sizes, colors = [], [], []
    color_map = {"Alta": "#EA580C", "Media": "#D97706", "Baixa": "#2563EB"}
    for sev, n in contagens.items():
        if n > 0:
            labels.append(f"{sev} ({n})")
            sizes.append(n)
            colors.append(color_map.get(sev, "#6B7280"))
    fig, ax = plt.subplots(figsize=(4, 3.2), facecolor="white")
    wedges, _, autotexts = ax.pie(sizes, colors=colors, autopct="%1.0f%%",
        startangle=90, wedgeprops={"edgecolor": "white", "linewidth": 2}, pctdistance=0.75)
    for t in autotexts:
        t.set_fontsize(9); t.set_color("white"); t.set_fontweight("bold")
    ax.add_artist(plt.Circle((0,0), 0.55, fc="white"))
    patches = [mpatches.Patch(color=c, label=l) for c, l in zip(colors, labels)]
    ax.legend(handles=patches, loc="lower center", bbox_to_anchor=(0.5,-0.22), ncol=2, fontsize=7.5, framealpha=0)
    ax.set_title("Achados por Severidade", fontsize=10, fontweight="bold", pad=8)
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(); buf.seek(0)
    return buf

def gerar_grafico_barras(por_categoria):
    cats = list(por_categoria.keys())
    vals = list(por_categoria.values())
    cores = ["#EA580C", "#D97706", "#2563EB", "#6B7280"][:len(cats)]
    fig, ax = plt.subplots(figsize=(5, 3), facecolor="white")
    bars = ax.barh(cats, vals, color=cores, edgecolor="white", height=0.55)
    ax.set_xlabel("Qtd", fontsize=9)
    ax.set_title("Achados por Categoria", fontsize=10, fontweight="bold")
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.spines[["top","right"]].set_visible(False)
    for bar, v in zip(bars, vals):
        ax.text(bar.get_width()+0.05, bar.get_y()+bar.get_height()/2, str(v), va="center", fontsize=9, fontweight="bold")
    ax.set_xlim(0, max(vals)+1)
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(); buf.seek(0)
    return buf

def estilos():
    s = getSampleStyleSheet()
    def P(name, **kw): return ParagraphStyle(name, parent=s["Normal"], **kw)
    return {
        "titulo_capa": P("titulo_capa", fontSize=24, textColor=white, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=30, spaceAfter=6),
        "sub_capa": P("sub_capa", fontSize=12, textColor=HexColor("#84CC16"), fontName="Helvetica-Bold", alignment=TA_CENTER, leading=16),
        "detalhe_capa": P("detalhe_capa", fontSize=9, textColor=HexColor("#9CA3AF"), fontName="Helvetica", alignment=TA_CENTER, leading=14),
        "h1": P("h1", fontSize=15, textColor=HexColor("#111827"), fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6, leading=20),
        "h2": P("h2", fontSize=11, textColor=HexColor("#1F2937"), fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=3, leading=15),
        "h3": P("h3", fontSize=9, textColor=HexColor("#374151"), fontName="Helvetica-Bold", spaceBefore=6, spaceAfter=2, leading=13),
        "body": P("body", fontSize=8.5, textColor=HexColor("#374151"), fontName="Helvetica", spaceBefore=2, spaceAfter=2, leading=12, alignment=TA_JUSTIFY),
        "code": P("code", fontSize=7.5, textColor=HexColor("#1F2937"), fontName="Courier", spaceBefore=2, spaceAfter=2, leading=11),
        "strong": P("strong", fontSize=9, textColor=HexColor("#059669"), fontName="Helvetica-Bold", spaceBefore=2, spaceAfter=2, leading=13),
        "label_sev": P("label_sev", fontSize=7, textColor=white, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=10),
        "issue_h": P("issue_h", fontSize=9.5, textColor=HexColor("#1F2937"), fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=3),
        "issue_body": P("issue_body", fontSize=8, textColor=HexColor("#374151"), fontName="Courier", spaceBefore=2, spaceAfter=2, leading=11),
    }

def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(HexColor("#111827"))
    canvas.rect(0, h-1.1*cm, w, 1.1*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 7.5); canvas.setFillColor(HexColor("#84CC16"))
    canvas.drawString(MARGIN, h-0.7*cm, "VERZEL PASS — Relatorio de Auditoria de Seguranca")
    canvas.setFillColor(HexColor("#9CA3AF")); canvas.drawRightString(w-MARGIN, h-0.7*cm, DATA_AUDITORIA)
    canvas.setFillColor(HexColor("#F3F4F6")); canvas.rect(0, 0, w, 0.9*cm, fill=1, stroke=0)
    canvas.setStrokeColor(HexColor("#E5E7EB")); canvas.line(0, 0.9*cm, w, 0.9*cm)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(HexColor("#6B7280"))
    canvas.drawCentredString(w/2, 0.32*cm, f"Pagina {doc.page}")
    canvas.restoreState()

def build_pdf(output_path):
    doc = SimpleDocTemplate(output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN+0.4*cm, bottomMargin=MARGIN)
    st = estilos()
    story = []

    # CAPA
    story.append(Spacer(1, 2.5*cm))
    capa = Table([
        [Paragraph("Relatorio de Auditoria de Seguranca", st["titulo_capa"])],
        [Paragraph(f"— {PROJETO} —", st["sub_capa"])],
        [Spacer(1, 0.3*cm)],
        [Paragraph(f"Data: {DATA_AUDITORIA}  |  Auditoria de codigo-fonte estatica", st["detalhe_capa"])],
        [Paragraph("Escopo: API Fastify (TypeScript) + Frontend Next.js 16", st["detalhe_capa"])],
        [Spacer(1, 0.3*cm)],
        [Paragraph("Stack: Fastify 5 · Prisma ORM · PostgreSQL · JWT (cookie httpOnly) · Next.js 16 · TypeScript · Docker Compose", st["detalhe_capa"])],
        [Spacer(1, 0.3*cm)],
        [Paragraph("Metodologia: Revisao estatica de codigo-fonte, analise de configuracao, historico git e mapeamento sistematico de rotas vs. gates de autorizacao.", st["detalhe_capa"])],
    ], colWidths=[PAGE_W-2*MARGIN])
    capa.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),HexColor("#0F172A")),
        ("TOPPADDING",(0,0),(-1,0),28),("BOTTOMPADDING",(0,-1),(-1,-1),28),
        ("ROWPADDING",(0,0),(-1,-1),6),
    ]))
    story.append(capa)
    story.append(PageBreak())

    # RESUMO EXECUTIVO
    story.append(Paragraph("1. Resumo Executivo", st["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB"), spaceAfter=8))
    contagens = {}
    por_categoria = {}
    for a in ACHADOS:
        contagens[a["severidade"]] = contagens.get(a["severidade"], 0) + 1
        por_categoria[a["categoria"]] = por_categoria.get(a["categoria"], 0) + 1
    total = len(ACHADOS)
    story.append(Paragraph(
        f"A auditoria identificou {total} achados em 4 categorias de risco. Nenhuma vulnerabilidade critica foi encontrada. "
        "A camada de autenticacao e autorizacao do backend esta corretamente implementada na maioria dos casos. "
        "Os riscos principais concentram-se em configuracao e exposicao de credenciais.",
        st["body"]))
    story.append(Spacer(1, 0.3*cm))

    sev_order = ["Alta","Media","Baixa","Informativa"]
    cor_order = [COR_ALTA, COR_MEDIA, COR_BAIXA, COR_INFO]
    achado_por_sev = {s: [] for s in sev_order}
    for a in ACHADOS:
        achado_por_sev.get(a["severidade"], []).append(a["id"])

    header_row = [Paragraph("<b>Severidade</b>",st["h3"]), Paragraph("<b>Qtd</b>",st["h3"]), Paragraph("<b>IDs</b>",st["h3"])]
    sev_rows = [header_row]
    for sev, cor in zip(sev_order, cor_order):
        n = contagens.get(sev, 0)
        ids = ", ".join(achado_por_sev.get(sev, [])) or "—"
        sev_rows.append([sev, str(n), ids])
    sev_table = Table(sev_rows, colWidths=[3.5*cm, 1.5*cm, 11*cm])
    sev_style = [
        ("BACKGROUND",(0,0),(-1,0),HexColor("#111827")),("TEXTCOLOR",(0,0),(-1,0),white),
        ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),8.5),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[white,HexColor("#F9FAFB")]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#E5E7EB")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),("LEFTPADDING",(0,0),(-1,-1),8),
    ]
    for i, (sev, cor) in enumerate(zip(sev_order, cor_order), 1):
        if contagens.get(sev,0) > 0:
            sev_style.extend([("BACKGROUND",(0,i),(0,i),cor),("TEXTCOLOR",(0,i),(0,i),white),("FONTNAME",(0,i),(0,i),"Helvetica-Bold")])
    sev_table.setStyle(TableStyle(sev_style))
    story.append(sev_table)
    story.append(Spacer(1, 0.4*cm))

    buf_rosca = gerar_grafico_rosca(contagens)
    buf_barras = gerar_grafico_barras(por_categoria)
    img_rosca = Image(buf_rosca, width=7*cm, height=5.5*cm)
    img_barras = Image(buf_barras, width=8*cm, height=5.5*cm)
    graficos = Table([[img_rosca, img_barras]], colWidths=[7.5*cm, 8.5*cm])
    story.append(graficos)
    story.append(PageBreak())

    # PONTOS FORTES
    story.append(Paragraph("2. Pontos Fortes", st["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB"), spaceAfter=8))
    for pf in PONTOS_FORTES:
        row = Table([
            [Paragraph(f"OK  {pf['titulo']}", st["strong"])],
            [Paragraph(pf["evidencia"], st["body"])],
        ], colWidths=[PAGE_W-2*MARGIN-0.5*cm])
        row.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),HexColor("#F0FDF4")),
            ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),8),
            ("TOPPADDING",(0,0),(-1,0),5),("BOTTOMPADDING",(0,-1),(-1,-1),5),
            ("BOX",(0,0),(-1,-1),0.8,HexColor("#BBF7D0")),
        ]))
        story.append(row); story.append(Spacer(1,0.15*cm))
    story.append(PageBreak())

    # ACHADOS DETALHADOS
    story.append(Paragraph("3. Achados Detalhados", st["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB"), spaceAfter=8))
    hdr = [Paragraph("<b>Sev.</b>",st["h3"]), Paragraph("<b>ID</b>",st["h3"]), Paragraph("<b>Arquivo:Linha</b>",st["h3"]), Paragraph("<b>Descricao</b>",st["h3"])]
    trows = [hdr]
    for a in ACHADOS:
        cor = cor_sev(a["severidade"])
        chip = Table([[Paragraph(a["severidade"],st["label_sev"])]], colWidths=[1.8*cm])
        chip.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),cor),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
        trows.append([chip, Paragraph(f"<b>{a['id']}</b>",st["body"]),
            Paragraph(f"{a['arquivo']}\nL.{a['linha']}",st["code"]), Paragraph(a["titulo"],st["body"])])
    mt = Table(trows, colWidths=[2*cm, 0.8*cm, 4.5*cm, 8.7*cm])
    mt.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),HexColor("#111827")),("TEXTCOLOR",(0,0),(-1,0),white),
        ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),8.5),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[white,HexColor("#F9FAFB")]),
        ("GRID",(0,0),(-1,-1),0.5,HexColor("#E5E7EB")),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LEFTPADDING",(0,0),(-1,-1),6),
    ]))
    story.append(mt); story.append(Spacer(1,0.4*cm))
    for a in ACHADOS:
        story.append(KeepTogether([
            Paragraph(f"{a['id']} — {a['titulo']}", st["h2"]),
            Table([[Paragraph(f"Categoria: {a['categoria']}",st["body"]), Paragraph(f"Severidade: {a['severidade']}",st["body"]), Paragraph(f"Arquivo: {a['arquivo']} L.{a['linha']}",st["body"])]], colWidths=[5*cm,4*cm,7*cm]),
            Spacer(1,0.08*cm), Paragraph("<b>Descricao:</b>",st["h3"]), Paragraph(a["descricao"],st["body"]),
            Spacer(1,0.08*cm), Paragraph("<b>Trecho:</b>",st["h3"]), Paragraph(a["trecho"].replace("\n","<br/>"),st["code"]),
            Spacer(1,0.08*cm), Paragraph("<b>Explorabilidade:</b>",st["h3"]), Paragraph(a["explorabilidade"],st["body"]),
            HRFlowable(width="100%",thickness=0.5,color=HexColor("#E5E7EB"),spaceAfter=4,spaceBefore=8),
        ]))
    story.append(PageBreak())

    # RECOMENDACOES
    story.append(Paragraph("4. Recomendacoes Priorizadas", st["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB"), spaceAfter=8))
    recs = [
        ("P1","Alta","Tornar JWT_SECRET obrigatorio sem default e validar na startup","Qualquer default publico de segredo derruba toda a autenticacao."),
        ("P1","Alta","Revogar e rotacionar TMDB_API_KEY comprometida","Chave real esta no arquivo .env local — risco se commitada."),
        ("P2","Media","Remover senhas de PRESET_USERS do bundle JavaScript","Credenciais de contas privilegiadas expostas no codigo-fonte publico."),
        ("P2","Media","Eliminar CORS_ORIGIN=* e DATABASE_URL com defaults fracos","CORS wildcard + credentials=true permite CSRF de qualquer origem."),
        ("P2","Media","Adicionar gate de papel no link Publicar Evento da home","Inconsistencia de UI: nao-ORGANIZER ve botao que o backend recusara."),
        ("P3","Baixa","Vincular DOORMAN ao evento especifico na validacao","DOORMAN pode invalidar ingressos de eventos alheios."),
        ("P3","Info","Implementar secret scanning no CI (gitleaks/trufflehog)","Detecta automaticamente commits acidentais de segredos."),
    ]
    for pri, sev, titulo, just in recs:
        cor = COR_ALTA if sev=="Alta" else COR_MEDIA if sev=="Media" else COR_BAIXA if sev=="Baixa" else COR_INFO
        chip = Table([[Paragraph(pri,st["label_sev"])]],colWidths=[1.5*cm])
        chip.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),cor),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
        row = Table([[chip,[Paragraph(titulo,st["h3"]),Paragraph(just,st["body"])]]],colWidths=[1.8*cm,PAGE_W-2*MARGIN-1.8*cm])
        row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),("LEFTPADDING",(0,0),(-1,-1),5)]))
        story.append(row); story.append(Spacer(1,0.12*cm))
    story.append(PageBreak())

    # ISSUES GITHUB
    story.append(Paragraph("5. Issues para o GitHub", st["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB"), spaceAfter=8))
    story.append(Paragraph("Issues prontas para copiar e colar no repositorio GitHub.", st["body"]))
    story.append(Spacer(1,0.2*cm))
    for issue in ISSUES_TEXT:
        md = (
            f"--- ISSUE {issue['n']} ---\n\n"
            f"Titulo: {issue['titulo']}\n"
            f"Labels: {issue['labels']}\n"
            f"Achados: {issue['achados']}\n\n"
            f"## Descricao\n{issue['descricao']}\n\n"
            f"## Impacto\n{issue['impacto']}\n\n"
            f"## Correcao\n{issue['correcao']}\n\n"
            f"## Criterios de Aceite\n{issue['criterios']}\n\n"
            f"--- FIM ISSUE {issue['n']} ---"
        )
        bg = Table([[Paragraph(md.replace("\n","<br/>"),st["issue_body"])]],colWidths=[PAGE_W-2*MARGIN])
        bg.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),HexColor("#F8FAFC")),
            ("BOX",(0,0),(-1,-1),0.8,HexColor("#CBD5E1")),
            ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
            ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
        ]))
        story.append(KeepTogether([Paragraph(f"ISSUE {issue['n']}: {issue['titulo']}", st["issue_h"]), bg, Spacer(1,0.25*cm)]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF gerado: {output_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(script_dir, "relatorio-auditoria-seguranca.pdf")
    build_pdf(output)
