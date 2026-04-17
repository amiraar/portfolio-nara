# Nara — Portfolio + Kaia Chat Assistant

Personal portfolio website for **Mohammad Amirul Kurniawan Putranto** with an integrated AI chat assistant named **Kaia**. Built with Next.js 14, Pusher Channels realtime, OpenAI, and a private owner dashboard.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Neon account)
- Google AI Studio API key (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
- Pusher Channels app

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

# Get free key at https://aistudio.google.com/apikey
GOOGLE_AI_STUDIO_KEY=AQ...your-key
OPENAI_MODEL=gemini-2.5-flash
MAX_HISTORY=15
KAIA_SYSTEM_PROMPT=your-single-line-prompt-here

NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
OWNER_EMAIL=your@gmail.com
OWNER_PASSWORD=your-password

NEXT_PUBLIC_SITE_URL=http://localhost:3000

PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

### Database Setup

```sh
npm run db:push       # sync schema to DB
npm run db:generate   # generate Prisma client
```

### Run Development

```sh
npm run dev
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
     │  HTTP + Pusher Channels      │  HTTP + Pusher Channels
     ▼                              ▼
┌─────────────────────────────────────────┐
│      Next.js App Router (Vercel)        │
│      Route Handlers + React Client      │
├─────────────────────────────────────────┤
│  /app/api/*  (Next.js Route Handlers)   │
│  /components/* (React Client Components)│
└──────────────┬──────────────────────────┘
               │
     ┌─────────┼──────────┬───────────────┐
     ▼         ▼              ▼               ▼
Pusher Channels Google Gemini  Neon PostgreSQL
 (realtime)   (AI Studio API) (via Prisma ORM)
```

---

## 📋 Features

| Feature | Status |
|---|---|
| Portfolio sections (Hero, About, Experience, Projects, Skills, Education) | ✅ |
| Dynamic content via CMS (all sections editable from dashboard) | ✅ |
| Chat widget with bubble + tooltip | ✅ |
| Visitor identification (name + Gmail) with localStorage session | ✅ |
| Kaia AI replies via Google Gemini (Google AI Studio) | ✅ |
| Realtime messages via Pusher Channels | ✅ |
| Typing indicator | ✅ |
| Owner dashboard (protected) | ✅ |
| Takeover / Hand back to Kaia | ✅ |
| Owner manual reply | ✅ |
| Resolve conversation | ✅ |
| Polling every 30s + Pusher realtime on dashboard | ✅ |
| Vercel-compatible deployment (no custom server) | ✅ |
| Mobile responsive | ✅ |

---

## 🗂️ Portfolio CMS

The owner can edit all portfolio content from `/dashboard` → **Content** tab without touching code.

Each section is stored as JSON in the `PortfolioContent` table and falls back to hardcoded defaults if not yet saved.

---

## 🔐 Authentication

Single-owner auth via NextAuth.js credentials. Set `OWNER_EMAIL` and `OWNER_PASSWORD` in `.env`. Access dashboard at `/dashboard` — redirects to `/login` if unauthenticated.
