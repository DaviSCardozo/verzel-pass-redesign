# 🎫 Verzel Pass — Visual Redesign & UI/UX Exploration

> **Exercício de Design System e Reimaginação da Experiência de Reserva de Ingressos**

---

## 📌 Disclaimer & Transparência Técnica

Este projeto é uma **reimaginação visual e funcional de front-end** baseada na plataforma original [Elite Events Platform](https://github.com/DaviSCardozo/elite-events-platform), desenvolvida como um exercício prático de **UI/UX, micro-interações e Design System moderno**.

### ⚠️ Diferenças entre este Redesign e a Versão Original:

1. **Mapa de Assentos (Simulação Visual):**
   - O mapa de assentos interativo simula a seleção física e a ocupação visual utilizando `localStorage`.
   - **Nota sobre Concorrência:** O backend original aceita reservas por **quantidade total de ingressos** por evento. Portanto, a seleção de assentos numéricos específicos é uma camada visual cosmética no front-end para enriquecer a experiência do usuário.

2. **Integração Real com o Backend de Produção:**
   - As ações de compra e reserva persistem dados reais invocando o endpoint `/orders` por **quantidade**.
   - As regras de negócio críticas (estoque total de ingressos do evento, autenticação JWT via HTTP-only cookies, geração de vouchers digitais e validação de QR Code na portaria) mantêm-se **100% reais, seguras e validadas pelo servidor**.

3. **Repositório do Desafio Técnico Original:**
   - Para consultar a entrega original com histórico de testes de carga/concorrência no backend, documentação completa de decisão técnica e Docker Compose, acesse: [github.com/DaviSCardozo/elite-events-platform](https://github.com/DaviSCardozo/elite-events-platform).

---

## ✨ Destaques do Redesign Visual

- **🎨 Design System & Estética Premium:** Tema escuro refinado com transparências (glassmorphism), gradientes vibrantes e tipografia moderna.
- **💺 Mapa Interativo de Assentos:** Interface tátil e responsiva para escolha de lugares com indicação visual de assentos disponíveis, selecionados e ocupados.
- **🎫 Voucher Digital Dinâmico:** Apresentação elegante do ingresso com QR Code gerado em tempo real, status dinâmico e opção de compartilhamento.
- **📱 Scanner de Portaria Integrado:** Leitor de QR Code acionado por câmera (ou digitação manual) com feedback imediato em 4 estados (Válido, Já Utilizado, Inválido e Evento Incorreto).
- **⚡ Alta Performance e Responsividade:** Desenvolvido com Next.js 15 (App Router) e animações suaves para telas desktop e mobile.

---

## 🛠️ Tech Stack

- **Front-end:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React
- **QR Code & Mídia:** `html5-qrcode` (leitura via câmera), `qrcode.react` (geração de QR code)
- **Integração Backend:** Fastify, Prisma 6, PostgreSQL (através do serviço da API original)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 20+
- Instância do backend [Elite Events Platform API](https://github.com/DaviSCardozo/elite-events-platform) rodando (localmente ou em nuvem).

### 1. Clonar o repositório
```bash
git clone https://github.com/DaviSCardozo/verzel-pass-redesign.git
cd verzel-pass-redesign
```

### 2. Configurar o Front-end
```bash
cd web
npm install
```

Crie o arquivo `.env.local` na pasta `web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3334/api/v1
```

### 3. Executar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

## 🌐 Deploy na Vercel

Este projeto está pronto para deploy independente em plataformas como a **Vercel**:

1. Importe o repositório `DaviSCardozo/verzel-pass-redesign` na Vercel.
2. Defina o **Root Directory** como `web`.
3. Configure a variável de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL da sua API implantada (ex: `https://sua-api.render.com/api/v1`).
4. Clique em **Deploy**.

---

## 📤 Atualização do Remote Git

Para vincular e enviar as alterações para este repositório dedicado:

```bash
git remote set-url origin https://github.com/DaviSCardozo/verzel-pass-redesign.git
git add .
git commit -m "feat: redesign visual completo verzel pass e disclaimer de arquitetura"
git push -u origin main
```

---

*Projeto desenvolvido por Davi S. Cardozo como exploração de UI/UX e arquitetura front-end.*