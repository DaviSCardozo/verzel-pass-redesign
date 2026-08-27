# 🎫 Verzel Pass — Visual Redesign & UI/UX Exploration

> **Exercício de Design System, Reimaginação de UI/UX e Arquitetura Full Stack de Ingressos**

---

## 🔗 Links do Projeto & Demonstração

- **🌐 Live Demo (Front-end):** [Acessar a Aplicação na Vercel](https://verzel-pass-redesign.vercel.app) *(substitua pela sua URL da Vercel se for diferente)*
- **⚡ API em Produção:** `https://verzel-pass-api.onrender.com/api/v1`
- **📦 Repositório do Desafio Original:** [github.com/DaviSCardozo/elite-events-platform](https://github.com/DaviSCardozo/elite-events-platform)

### 🧪 Contas de Teste Pré-Cadastradas (Senha Padrão: `123456`)

| Papel / Perfil | E-mail de Acesso | Senha | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **👑 Organizador** | `organizador@eventos.com` | `123456` | Criar novos eventos, ver estatísticas |
| **🎟️ Cliente** | `cliente1@eventos.com` | `123456` | Escolher assentos, comprar ingressos, ver vouchers |
| **🚪 Portaria** | `portaria@eventos.com` | `123456` | Validar QR Codes de ingressos via câmera |

---

## 📌 Disclaimer & Transparência Técnica

Este projeto é uma **reimaginação visual e funcional de front-end** desenvolvida após a entrega do desafio técnico original [Elite Events Platform](https://github.com/DaviSCardozo/elite-events-platform). O objetivo desta versão é servir como **exercício avançado de UI/UX, micro-interações, mapas interativos e Design System moderno**.

### ⚠️ Diferenças de Arquitetura em Relação ao Repositório Original:

1. **Mapa de Assentos (Simulação Visual Front-end):**
   - O mapa de assentos interativo simula a escolha e ocupação física de cadeiras utilizando `localStorage`.
   - **Nota sobre Concorrência:** O backend da aplicação gerencia a disponibilidade real por **quantidade total de ingressos por evento**. Portanto, a escolha de assentos numéricos (ex: A-12, C-05) é uma camada cosmética no front-end para enriquecer a experiência do usuário.

2. **Integração Segura com a API de Produção:**
   - Ao finalizar a compra, o front-end consome o endpoint original `/orders` enviando a **quantidade total de ingressos selecionados**.
   - Todas as garantias técnicas essenciais (estoque real do evento no banco de dados, autenticação JWT via HTTP-only cookies, validação de permissões RBAC, geração de vouchers digitais com QR Code e validação na portaria) mantêm-se **100% ativas e validadas pelo servidor**.

3. **Repositório do Desafio Técnico Original:**
   - Para analisar o repositório com o histórico de commits da entrega técnica do desafio, testes de concorrência/carga no backend, decisões de persistência com Prisma 6 e Docker Compose, acesse: [github.com/DaviSCardozo/elite-events-platform](https://github.com/DaviSCardozo/elite-events-platform).

---

## 🏗️ Arquitetura de Deploy em Produção

A aplicação foi implantada em infraestrutura distribuída na nuvem:

| Camada | Serviço / Provedor | URL / Descrição |
| :--- | :--- | :--- |
| **Front-end** | **Vercel** | Aplicação Next.js 15 (App Router) com Tailwind CSS |
| **Back-end API** | **Render.com** | Node.js + Fastify + Prisma (`https://verzel-pass-api.onrender.com/api/v1`) |
| **Banco de Dados** | **Render PostgreSQL** | Instância PostgreSQL com conexões SSL gerenciadas |

---

## ✨ Destaques do Redesign Visual

- **🎨 Design System & Estética Dark:** Interface com transparências glassmorphism, paleta harmônica de cores e tipografia fluida.
- **💺 Mapa Interativo de Assentos:** Interface para escolha de lugares com indicação visual em tempo real (disponível, selecionado e ocupado).
- **🎫 Voucher Digital Dinâmico:** Apresentação do ingresso com QR Code gerado instantaneamente, status e opção de compartilhamento por link.
- **📱 Scanner de Portaria por Câmera:** Leitor de QR Code integrado via câmera (ou digitação manual) com feedback visual imediato em 4 estados: *Válido*, *Já Utilizado*, *Inválido* e *Evento Incorreto*.
- **⚡ Alta Performance:** Desenvolvido com Next.js 15 (App Router), React 19 e Tailwind CSS.

---

## 🛠️ Tech Stack

- **Front-end:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React
- **QR Code & Mídia:** `html5-qrcode` (leitura via câmera), `qrcode.react` (geração de QR code)
- **Back-end:** Node.js 20, Fastify 5, Prisma 6, PostgreSQL, JWT (HTTP-only cookies), Zod
- **Infraestrutura:** Vercel (Front-end), Render (API + PostgreSQL)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 20+
- Docker (opcional, para rodar o PostgreSQL localmente)

### 1. Clonar o repositório
```bash
git clone https://github.com/DaviSCardozo/verzel-pass-redesign.git
cd verzel-pass-redesign
```

### 2. Configurar e Executar a API (Back-end)
```bash
cd api
npm install
```
Crie um arquivo `.env` na pasta `api/`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/eventos_db
JWT_SECRET=sua-chave-secreta-local-2026
CORS_ORIGIN=http://localhost:3000
TMDB_API_KEY=sua-chave-tmdb
```
Execute as migrations, o seed e inicie a API:
```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```
A API rodará em `http://localhost:3334`.

### 3. Configurar e Executar o Front-end
Em outro terminal:
```bash
cd web
npm install
```
Crie um arquivo `.env.local` na pasta `web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3334/api/v1
```
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

## 🌐 Configuração de Variáveis de Ambiente no Deploy (Vercel & Render)

### Front-end (Vercel)
- `NEXT_PUBLIC_API_URL` = `https://verzel-pass-api.onrender.com/api/v1` *(Tipo: Config)*

### Back-end (Render Web Service)
- `DATABASE_URL` = `postgresql://<user>:<password>@<host>.render.com/<database>`
- `JWT_SECRET` = `<sua-chave-secreta-jwt>`
- `TMDB_API_KEY` = `<sua-chave-tmdb>`
- `CORS_ORIGIN` = `*`
- `NODE_ENV` = `production`

---

*Projeto desenvolvido por Davi S. Cardozo como exploração de UI/UX e arquitetura de software full stack.*