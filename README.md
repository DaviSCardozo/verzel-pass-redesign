# 🎫 Verzel Pass — Redesign Visual, Design System & Arquitetura Full Stack

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security Audited](https://img.shields.io/badge/Security_Audit-Aprovado_%E2%9C%93-84CC16?style=for-the-badge&logo=shield&logoColor=black)](docs/security-audit/relatorio-auditoria-seguranca.pdf)

> **Plataforma de alta fidelidade para venda, gestão e validação de ingressos em tempo real com leitura de QR Code, controle de concorrência e auditoria de segurança.**

---

## 📑 Sumário

- [🔗 Links do Projeto & Demonstração](#-links-do-projeto--demonstração)
- [🧪 Contas de Demonstração Pré-Cadastradas](#-contas-de-demonstração-pré-cadastradas)
- [🏛️ Arquitetura & Fluxo da Aplicação](#️-arquitetura--fluxo-da-aplicação)
- [🛡️ Auditoria de Segurança & Blindagem de Código](#️-auditoria-de-segurança--blindagem-de-código)
- [✨ Principais Funcionalidades](#-principais-funcionalidades)
- [🛠️ Tech Stack Completa](#️-tech-stack-completa)
- [🚀 Instalação e Execução Local](#-instalação-e-execução-local)
- [🌐 Guia de Deploy em Produção](#-guia-de-deploy-em-produção)
- [📂 Estrutura de Diretórios](#-estrutura-de-diretórios)
- [⚖️ Transparência Técnica & Decisões de Arquitetura](#️-transparência-técnica--decisões-de-arquitetura)

---

## 🔗 Links do Projeto & Demonstração

| Ambiente | Provedor | URL |
| :--- | :--- | :--- |
| **🌐 Front-end (Web App)** | **Vercel** | [verzel-pass-redesign.vercel.app](https://verzel-pass-redesign.vercel.app) |
| **⚡ API RESTful (Back-end)** | **Render** | `https://verzel-pass-api.onrender.com/api/v1` |
| **📄 Relatório de Segurança (PDF)** | **Repositório** | [relatorio-auditoria-seguranca.pdf](docs/security-audit/relatorio-auditoria-seguranca.pdf) |
| **📦 Repositório do Desafio Original** | **GitHub** | [DaviSCardozo/elite-events-platform](https://github.com/DaviSCardozo/elite-events-platform) |

---

## 🧪 Contas de Demonstração Pré-Cadastradas

O banco de dados é inicializado (`npx prisma db seed`) com 3 perfis e 4 contas para teste imediato de todas as jornadas do sistema:

| Perfil / Role | Nome | E-mail de Acesso | Senha Padrão | Capacidades & Ações |
| :--- | :--- | :--- | :--- | :--- |
| **👑 ORGANIZER** | Ana Organizadora | `organizador@eventos.com` | `123456` | Busca TMDb integrada, publicação de sessões/eventos e painel de criação |
| **🎟️ CUSTOMER** | Carlos Cliente | `cliente1@eventos.com` | `123456` | Mapa interativo de assentos, compra concorrente, carteira de ingressos |
| **🎟️ CUSTOMER** | Bia Cliente | `cliente2@eventos.com` | `123456` | Segundo cliente para simulação de vendas simultâneas |
| **🚪 DOORMAN** | Pedro Portaria | `portaria@eventos.com` | `123456` | Validador com câmera ao vivo (QR Scanner), entrada manual e 4 estados |

---

## 🏛️ Arquitetura & Fluxo da Aplicação

O sistema opera no modelo **BFF / Single Page Application com API desacoplada**, garantindo isolamento de dados e autenticação segura via cookies `httpOnly`.

```mermaid
graph TD
    subgraph Frontend ["Frontend (Next.js 16 - Vercel)"]
        UI[Interface & Design System]
        UserCtx[UserContext & Auth State]
        SeatMap[Mapa de Assentos Interativo]
        Scanner[QR Scanner Câmera & Input]
    end

    subgraph Backend ["Backend API (Fastify 5 - Render)"]
        AuthPlugin["Plugin Auth (JWT / Cookies httpOnly)"]
        RBAC["RBAC Decorator: authorize(['ROLE'])"]
        OrdersRoute["POST /orders (SELECT FOR UPDATE)"]
        TicketsRoute["GET /tickets/me & POST /validate"]
        EventsRoute["GET /events & POST /events"]
        TMDBService["Service TMDb (Search & Metadata)"]
    end

    subgraph Database ["PostgreSQL (Render / Docker)"]
        T_Users[(Users)]
        T_Events[(Events)]
        T_Orders[(Orders)]
        T_Tickets[(Tickets)]
    end

    UI --> UserCtx
    UserCtx --> AuthPlugin
    SeatMap --> OrdersRoute
    Scanner --> TicketsRoute
    UI --> EventsRoute
    EventsRoute --> TMDBService
    
    AuthPlugin --> T_Users
    OrdersRoute --> T_Events
    OrdersRoute --> T_Orders
    OrdersRoute --> T_Tickets
    TicketsRoute --> T_Tickets
```

### 🔒 Fluxo de Concorrência & Compra Segura
1. O cliente escolhe os assentos no mapa interativo e submete o pedido.
2. A rota `POST /orders` inicia uma **transação isolada (`tx`)**.
3. É executado `SELECT id FROM "Event" WHERE id = $1 FOR UPDATE` para travar a linha do evento.
4. O backend calcula o estoque em tempo real contando os `Ticket` já persistidos e compara com a `capacidadeTotal`.
5. Se houver capacidade suficiente, o pedido é aprovado, os ingressos são gerados com código único criptográfico (`code` UUID) e vinculados ao `ownerId = request.user.sub`.
6. O double-booking em requisições simultâneas é matematicamente impossível.

---

## 🛡️ Auditoria de Segurança & Blindagem de Código

O código-fonte passou por uma **auditoria de segurança estática e estrutural rigorosa**, analisando 5 categorias críticas de vulnerabilidades.

📄 **Relatório Técnico Completo em PDF:** [docs/security-audit/relatorio-auditoria-seguranca.pdf](docs/security-audit/relatorio-auditoria-seguranca.pdf) (10 páginas com gráficos de severidade, matriz de riscos e issues prontas para o GitHub).

### 📊 Resumo da Matriz de Auditoria

| Categoria Auditada | Status no Código | Ações & Blindagens Implementadas |
| :--- | :---: | :--- |
| **1. Banco Sem Tranca (Isolamento de Dono)** | 🟢 **100% Protegido** | Todas as rotas sensíveis (`GET /tickets/me`, `POST /orders`, `POST /events`) vinculam e filtram os dados estritamente pelo `request.user.sub` extraído do JWT verificado no backend. |
| **2. Permissão no Navegador (RBAC)** | 🟢 **Corrigido** | Além da proteção obrigatória do backend com `app.authorize([...])`, foi criado o componente `PublishEventButton` para garantir o gate estrito também na interface de usuário. |
| **3. IDOR (Insecure Direct Object Reference)** | 🟢 **100% Protegido** | Ingressos e pedidos não aceitam substituição de ID de proprietário pelo cliente. A rota pública de compartilhamento valida assinaturas digitais via JWT dedicado (`type: 'ticket'`). |
| **4. Gestão de Segredos & Variáveis** | 🟢 **Corrigido** | Removidos fallbacks fracos de `JWT_SECRET`, implementada validação anti-blacklist na inicialização da API, bloqueio de `CORS_ORIGIN=*` em produção e remoção de senhas do bundle JS. |
| **5. Tratamento de Inputs & XSS** | 🟢 **100% Protegido** | Zero uso de `dangerouslySetInnerHTML`, `innerHTML` ou `eval`. Toda renderização dinâmica passa pelo sistema seguro de escape automático do React 19 / JSX. |

---

## ✨ Principais Funcionalidades

### 🎨 1. Design System Neon Dark
- Estética inspirada na paleta oficial da Verzel com cores neon (Lime `#84CC16`, Cyan `#06B6D4`, Slate `#090D16`).
- Efeitos sutis de glassmorphism, micro-animações fluidas e contraste tipográfico calibrado.

### 💺 2. Mapa Interativo de Assentos
- Visualização de sala de cinema/teatro com indicação de assentos disponíveis, ocupados e selecionados.
- Cálculo de subtotal dinâmico com simulação de checkout e tratamento de erros.

### 🎬 3. Integração com Catálogo TMDb
- Organizadores podem pesquisar títulos de filmes diretamente na base do *The Movie Database*.
- Autocompletar inteligente com preenchimento automático de pôster em alta resolução, sinopse e metadados.

### 🎫 4. Carteira de Ingressos & Voucher Digital
- Renderização de voucher estilizado com molduras neon.
- Geração instantânea de QR Code vetorial assinado criptograficamente.
- Exportação em **PDF A4** com `html2canvas` + `jspdf` e compartilhamento por link público seguro (`/v/[code]`).

### 📱 5. Central de Validação da Portaria (QR Scanner)
- Leitura em tempo real por câmera do celular/notebook via `html5-qrcode` ou digitação manual de código.
- Retorno visual instantâneo em 4 estados operacionais:
  1. ✅ **VÁLIDO:** Ingresso confirmado e marcado como utilizado com timestamp.
  2. ⚠️ **JÁ UTILIZADO:** Alerta de reuso com data/hora da primeira validação.
  3. ⛔ **EVENTO INCORRETO:** Ingresso pertencente a outra sessão/filme.
  4. ❌ **INVÁLIDO:** Código inexistente ou token adulterado.
- Histórico em tempo real das validações realizadas na sessão do porteiro.

---

## 🛠️ Tech Stack Completa

### Frontend
- **Framework:** Next.js 16 (App Router, Server Components + Client Components)
- **UI & Estilização:** React 19, Tailwind CSS 4, Lucide React, Base UI
- **QR Code & Mídia:** `qrcode.react`, `html5-qrcode`, `html2canvas`, `jspdf`

### Backend
- **Runtime & Framework:** Node.js 20+, Fastify 5
- **Segurança & Validação:** `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`, `zod`, `bcryptjs`
- **Banco de Dados & ORM:** PostgreSQL 16, Prisma ORM 6, `pg` (com suporte a conexões seguras SSL em produção)

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- Node.js 20+ instalado
- Docker & Docker Compose (recomendado para o banco PostgreSQL)

### 1. Clonar o Repositório
```bash
git clone https://github.com/DaviSCardozo/verzel-pass-redesign.git
cd verzel-pass-redesign
```

### 2. Subir o Banco de Dados (Docker)
```bash
docker compose up -d
```

### 3. Configurar e Iniciar a API (Backend)
```bash
cd api
npm install
```

Crie o arquivo `api/.env` (baseado no `api/.env.example`):
```env
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/eventos_db
JWT_SECRET=sua-chave-secreta-forte-com-minimo-de-32-caracteres
TMDB_API_KEY=sua_chave_tmdb_aqui
```

Execute as migrações, o seed inicial e inicie em modo watch:
```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```
> A API estará disponível em `http://localhost:3334` (ou porta configurada).

### 4. Configurar e Iniciar o Web App (Frontend)
Em outro terminal:
```bash
cd web
npm install
```

Crie o arquivo `web/.env.local` (baseado no `web/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3334/api/v1
NEXT_PUBLIC_PRESET_PASSWORD=123456
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
> Acesse o aplicativo no navegador em `http://localhost:3000`.

---

## 🌐 Guia de Deploy em Produção

### 1. Backend (Render / Railway / Fly.io)
- **Root Directory:** `api`
- **Build Command:** `npm install && npm run build` (executa `prisma generate && tsc`)
- **Start Command:** `npm run start` (executa `node dist/index.js`)
- **Variáveis de Ambiente Obrigatórias:**
  - `NODE_ENV` = `production`
  - `DATABASE_URL` = `postgresql://<user>:<pass>@<host>:<port>/<db>?sslmode=require`
  - `JWT_SECRET` = `<gerado via openssl rand -base64 64>`
  - `TMDB_API_KEY` = `<sua-chave-tmdb>`
  - `CORS_ORIGIN` = `https://verzel-pass-redesign.vercel.app` *(origem exata do frontend)*

### 2. Frontend (Vercel)
- **Root Directory:** `web`
- **Framework Preset:** `Next.js`
- **Variáveis de Ambiente Obrigatórias:**
  - `NEXT_PUBLIC_API_URL` = `https://sua-api.onrender.com/api/v1`

---

## 📂 Estrutura de Diretórios

```
verzel-pass-redesign/
├── api/                         # Backend Fastify + Prisma
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos (User, Event, Order, Ticket)
│   │   ├── seed.ts              # Seed com contas e eventos de exemplo
│   │   └── migrations/          # Histórico de migrações relacionais
│   ├── src/
│   │   ├── config/env.ts        # Schema Zod & startup security guards
│   │   ├── plugins/auth.ts      # Plugin JWT + decorator app.authorize()
│   │   ├── routes/              # Handlers (events, orders, tickets, sessions, users, tmdb)
│   │   └── services/tmdb.ts     # Integração com API externa TMDb
│   ├── .env.example
│   └── package.json
├── web/                         # Frontend Next.js 16 (App Router)
│   ├── app/                     # Rotas da aplicação (/event/[id], /validation, /my-tickets, /v/[code])
│   ├── components/              # Componentes (SeatMap, TicketVoucher, QRScanner, PublishEventButton)
│   ├── lib/user-context.tsx     # Contexto global de autenticação e sessão
│   ├── .env.example
│   └── package.json
├── docs/
│   └── security-audit/          # Auditoria de segurança e gerador PDF
│       ├── relatorio-auditoria-seguranca.pdf
│       └── gerar_relatorio.py
├── docker-compose.yml           # Infraestrutura local PostgreSQL
└── README.md
```

---

## ⚖️ Transparência Técnica & Decisões de Arquitetura

1. **Derivação de Vendas vs. Contador Estático:**
   A quantidade de ingressos vendidos é sempre calculada por `COUNT(Ticket)` agregada no banco de dados, eliminando qualquer risco de dessincronização entre contadores manuais e o inventário real.
2. **Tokens de Ingressos Criptografados:**
   O QR Code do ingresso contém um JWT assinado especificamente com `type: 'ticket'` e o código único. Mesmo que um invasor conheça a estrutura de UUIDs, é impossível forjar ingressos válidos sem a chave mestra do backend.
3. **Isolamento de Sessão por Cookies HttpOnly:**
   Tokens de autenticação de usuários são trafegados exclusivamente em cookies `httpOnly` com atributos `SameSite` e `Secure`, mitigando ataques de furto de sessão por XSS.

---

<div align="center">
  <sub>Desenvolvido com foco em excelência de engenharia de software, segurança e UX por <b>Davi S. Cardozo</b>.</sub>
</div>