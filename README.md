# Nara — Portfolio + Kaia Chat Assistant

Personal portfolio website for **Mohammad Amirul Kurniawan Putranto** with an integrated AI chat assistant named **Kaia**. Built with Next.js 14, Socket.io realtime, OpenAI, and a private owner dashboard.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Neon account)
- OpenAI API key

### Installation

```sh
npm install
```

### Environment Setup

```sh
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neon?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://user:pass@ep-xxx.neon.tech/neon?sslmode=require

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
MAX_HISTORY=15

NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
OWNER_EMAIL=your@gmail.com
OWNER_PASSWORD=your-password

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

```sh
npm run db:push       # sync schema to DB
npm run db:generate   # generate Prisma client
```

### Run Development

```sh
node server.js        # custom server (Next.js + Socket.io)
```

### View Database (GUI)

```sh
npm run db:studio     # opens Prisma Studio at localhost:5555
```

---

## 🏗️ Architecture Overview

```
Visitor Browser                Owner Browser
     │                              │
     │  HTTP + Socket.io            │  HTTP + Socket.io
     ▼                              ▼
┌─────────────────────────────────────────┐
│          server.js (Node.js)            │
│   Next.js App Router + Socket.io        │
├─────────────────────────────────────────┤
│  /app/api/*  (Next.js Route Handlers)   │
│  /components/* (React Client Components)│
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
  OpenAI API      Neon PostgreSQL
  (gpt-4.1-mini)  (via Prisma ORM)
```

---

## 📋 Features

| Feature | Status |
|---|---|
| Portfolio sections (Hero, About, Experience, Projects, Skills, Education) | ✅ |
| Dynamic content via CMS (all sections editable from dashboard) | ✅ |
| Chat widget with bubble + tooltip | ✅ |
| Visitor identification (name + Gmail) with localStorage session | ✅ |
| Kaia AI replies via OpenAI | ✅ |
| Realtime messages via Socket.io | ✅ |
| Typing indicator | ✅ |
| Owner dashboard (protected) | ✅ |
| Takeover / Hand back to Kaia | ✅ |
| Owner manual reply | ✅ |
| Resolve conversation | ✅ |
| Polling every 30s + Socket.io realtime on dashboard | ✅ |
| Mobile responsive | ✅ |

---

## 🗂️ Portfolio CMS

The owner can edit all portfolio content from `/dashboard` → **Content** tab without touching code.

Each section is stored as JSON in the `PortfolioContent` table and falls back to hardcoded defaults if not yet saved.

---

## 🔐 Authentication

Single-owner auth via NextAuth.js credentials. Set `OWNER_EMAIL` and `OWNER_PASSWORD` in `.env`. Access dashboard at `/dashboard` — redirects to `/login` if unauthenticated.
