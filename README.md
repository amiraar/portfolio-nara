# Nara — Portfolio + Kaia Chat Assistant

Personal portfolio website for **Mohammad Amirul Kurniawan Putranto** with an integrated AI chat assistant named **Kaia**. Built with Next.js 14, Socket.io realtime, OpenAI, and a private owner dashboard.

---

## 🧠 Project Summary (for Claude.ai)

> **Paste this when starting a new conversation on Claude.ai:**

```
Project: Nara — Personal Portfolio + AI Chat Assistant
Owner: Mohammad Amirul Kurniawan Putranto (Software Developer, Yogyakarta)
Assistant Name: Kaia

TECH STACK:
- Framework: Next.js 14 (App Router, "use client" components)
- Styling: Tailwind CSS (custom dark theme: bg #0A0A0A, accent #C9A96E gold)
- Fonts: Playfair Display (display), DM Sans (body), JetBrains Mono (mono)
- AI: OpenAI API (gpt-4.1-mini) via lib/openai.js
- Database: PostgreSQL on Neon (serverless), Prisma ORM
- Realtime: Socket.io via custom Node.js server (server.js)
- Auth: NextAuth.js credentials (single owner)
- Hosting: Railway

FOLDER STRUCTURE:
app/
  page.jsx                  → Public portfolio page
  layout.jsx                → Root layout + SessionProvider
  globals.css               → Global styles + Tailwind
  api/
    chat/route.js           → Inbound visitor message + OpenAI call
    send/route.js           → Owner manual reply (protected)
    conversations/route.js  → List all conversations (protected)
    conversations/[id]/route.js → Get/patch single conversation
    takeover/route.js       → Toggle ai/human mode (protected)
    visitor/route.js        → Create/get visitor by email
    portfolio/route.js      → GET (public) / PATCH (protected) CMS content
    auth/[...nextauth]/route.js → NextAuth handler
  dashboard/page.jsx        → Owner dashboard (protected)
  login/page.jsx            → Login page

components/
  portfolio/
    Nav.jsx                 → Sticky nav with active section highlight
    Hero.jsx                → Hero section (dynamic via usePortfolioContent)
    About.jsx               → About section (dynamic)
    Experience.jsx          → Work timeline (dynamic)
    Projects.jsx            → Project cards grid (dynamic)
    Skills.jsx              → Skills + language bars + stats (dynamic)
    Education.jsx           → Education + contact + footer (dynamic)
  chat/
    ChatWidget.jsx          → Bubble + chat window state machine
    VisitorForm.jsx         → Name + email form (Gmail validation)
    MessageList.jsx         → Render messages + typing indicator
    MessageInput.jsx        → Input + send button
  dashboard/
    ConversationList.jsx    → List with mode badges + last message
    ConversationDetail.jsx  → Full history + takeover/handback/resolve
    OwnerReply.jsx          → Manual reply input (human mode only)
    ContentEditor.jsx       → Form-based CMS for all portfolio sections

lib/
  openai.js                 → OpenAI wrapper, reads system-prompt.txt
  prisma.js                 → Prisma client singleton
  socket.js                 → Socket.io client singleton
  authOptions.js            → NextAuth config (credentials, bcrypt)
  usePortfolioContent.js    → Hook: fetch section from /api/portfolio, fallback to default

prisma/schema.prisma        → Visitor, Conversation, Message, PortfolioContent models
system-prompt.txt           → Kaia character + full Amirul profile info
server.js                   → Custom Node.js server (Next.js + Socket.io)

DATABASE SCHEMA:
- Visitor: id, name, email (unique), createdAt
- Conversation: id, visitorId, status (active|resolved), mode (ai|human), createdAt, updatedAt
- Message: id, conversationId, role (user|assistant|owner), content, timestamp
- PortfolioContent: id, section (unique), data (Json), updatedAt

KEY FLOWS:
1. Visitor opens portfolio → ChatWidget bubble appears after 3s
2. Visitor submits VisitorForm (name + Gmail) → POST /api/visitor → creates/gets Visitor + Conversation
3. Visitor sends message → POST /api/chat → saves Message → if mode=ai, calls OpenAI → emits via Socket.io
4. Owner opens /dashboard → sees ConversationList (polling 30s + Socket.io realtime)
5. Owner clicks Takeover → PATCH /api/takeover {mode: "human"} → Kaia stops replying
6. Owner replies → POST /api/send → saves as role "owner" → emits via Socket.io
7. Owner clicks Hand back → PATCH /api/takeover {mode: "ai"} → Kaia resumes
8. Owner clicks Resolve → PATCH /api/conversations/:id {status: "resolved"}
9. Owner edits portfolio content → ContentEditor → PATCH /api/portfolio {section, data}
10. Portfolio components fetch → GET /api/portfolio?section=xxx → fallback to DEFAULT_* if null

CMS SECTIONS (all editable via dashboard):
- hero: name, tagline, location, email, linkedin
- about: heading, paragraphs[], info[] {label, value}
- experience: [{company, role, period, description, tags[], current}]
- projects: [{name, type, company, description, tags[], link, highlight, metric}]
- skills: {skills: {Category: string[]}, languages: [{name, level, pct}], stats: [{label, value}]}
- education: {university, degree, gpa, period, location, contactHeading, contactSubtext, email, linkedin, linkedinLabel, footerCopy}

SOCKET.IO EVENTS:
- join_room (conversationId) → visitor joins their room
- join_dashboard → owner joins dashboard room
- new_message {conversationId, message} → emitted to both room + dashboard
- kaia_typing {conversationId} → emitted to visitor room before OpenAI responds

ENV VARIABLES NEEDED:
DATABASE_URL, DIRECT_URL, OPENAI_API_KEY, OPENAI_MODEL, MAX_HISTORY,
NEXTAUTH_SECRET, NEXTAUTH_URL, OWNER_EMAIL, OWNER_PASSWORD, NEXT_PUBLIC_SITE_URL
```

---

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
