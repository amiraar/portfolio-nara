# Project Nara — Portfolio + Kaia Chat Assistant
## Product Requirements Document v1.0

---

## 1. Project Overview

**Project Name:** Nara  
**Assistant Name:** Kaia  
**Type:** Personal Portfolio Website with AI Chat Assistant  
**Owner:** Mohammad Amirul Kurniawan Putranto  
**Scale:** Personal, single owner  
**Goal:** Portfolio yang menampilkan profil profesional Amirul, dilengkapi Kaia sebagai AI chat assistant yang membalas visitor secara otomatis. Owner bisa takeover conversation dari dashboard private.

---

## 2. User Personas

**Visitor (Public)**
- Rekruiter, kolega, atau siapapun yang ingin tahu tentang Amirul
- Ingin tahu background, skills, projects, dan cara menghubungi
- Mungkin tidak bisa WA/Instagram/Discord — butuh jalur kontak alternatif

**Owner (Amirul)**
- Akses dashboard private
- Monitor conversation yang masuk
- Takeover dan balas manual jika perlu
- Handover balik ke Kaia setelah selesai

---

## 3. Design Direction

**Aesthetic:** Luxury minimal — dark base, warm accent, generous whitespace, editorial typography  
**Tone:** Profesional tapi tidak kaku, personal tapi tidak informal  
**Memorable element:** Chat widget yang terasa seperti berbicara dengan asisten sungguhan, bukan bot generik  
**Color palette:**
- Background: `#0A0A0A` (near black)
- Surface: `#111111`
- Accent: `#C9A96E` (warm gold)
- Text primary: `#F5F5F0`
- Text muted: `#6B6B6B`
- Border: `#1E1E1E`

**Typography:**
- Display: `Playfair Display` (Google Fonts) — untuk nama dan section headers
- Body: `DM Sans` — untuk paragraf dan UI elements
- Mono: `JetBrains Mono` — untuk tags/labels teknikal

---

## 4. Portfolio Content (dari CV)

### Hero Section
- Nama: Mohammad Amirul Kurniawan Putranto
- Tagline: Software Developer — Backend, UI/UX, AI Systems
- Location: Yogyakarta
- Contact: amrlkurniawn19@gmail.com
- LinkedIn: linkedin.com/in/mohammad-amirul-kurniawan-putranto/
- CTA: "Chat with Kaia" (membuka chat widget)

### About Section
Backend-focused Software Developer dengan pengalaman membangun MVP production systems. Spesialisasi di Laravel dan CodeIgniter, dengan background kuat di UI/UX design. Berpengalaman di workflow systems, AI-driven features, reimbursement platforms, dan notification infrastructure.

### Experience Section
| Perusahaan | Role | Periode |
|---|---|---|
| SoftwareSeni | Software Developer | Aug 2025 – Present |
| SoftwareSeni | Software Training (Bootcamp) | May 2025 – Aug 2025 |
| RSU Mitra Paramedika | UI/UX Designer | Aug 2023 – Nov 2023 |
| Lazismu Yogyakarta | Project Manager | May 2023 – Aug 2023 |
| Ahmad Dahlan University | Lab Assistant | Sep 2022 – Jul 2024 |

### Projects Section
| Project | Deskripsi | Link |
|---|---|---|
| Racker | End-to-end reimbursement & request workflow, AWS S3, notification system | SoftwareSeni |
| QuickCue | AI-driven one-page profile generation, shareable URLs, slug-based | SoftwareSeni |
| CPTool | Laravel admin system, Google OAuth, RBAC, skills & client management | SoftwareSeni |
| UI/UX Study App | Interface untuk 500+ students, +30% engagement | bit.ly/uiuxstudyapp |
| UI/UX Laboratorium | RSU Mitra Paramedika, -15% processing time | bit.ly/uiuxlaboratorium |
| UI/UX Travel & Transport | Booking experience, +20% bookings | bit.ly/uiuxtravelandtransportation |
| UI/UX Farmasi Rawat Jalan | Hospital system, +20% efficiency | bit.ly/uiuxfarmasirawatjalan |

### Skills Section
**Technical:** Laravel, CodeIgniter, Node.js, PostgreSQL, SQLite, AWS S3, Figma, Android Studio, Adobe Suite  
**Soft Skills:** Leadership, Communication, Adaptability, Time Management, Problem-solving  
**Languages:** Bahasa Indonesia (Native), English (Intermediate)

### Education Section
Ahmad Dahlan University — Informatics, GPA 3.82

---

## 5. Application Architecture

### 5.1 Public Side (Portfolio + Chat Widget)
- Portfolio page dengan semua section di atas
- Chat widget fixed di pojok kanan bawah
- Visitor input nama + email sebelum mulai chat
- Cek DB: kalau email sudah pernah chat, load history
- Kaia balas otomatis via OpenAI
- Realtime via Socket.io

### 5.2 Private Side (Owner Dashboard)
- Route: `/dashboard` — protected, login required
- Tampilkan semua conversation dengan status (ai / human / resolved)
- Buka conversation → lihat full history + nama + email visitor
- Tombol "Takeover" → mode berubah ke human, Kaia berhenti balas
- Kolom reply manual untuk owner
- Tombol "Hand back to Kaia" → mode kembali ke ai
- Badge notif kalau ada conversation baru (polling setiap 30 detik)

---

## 6. Tech Stack

| Layer | Tool | Alasan |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes dalam satu repo |
| Styling | Tailwind CSS + CSS Modules | Utility + custom untuk animasi kompleks |
| AI | OpenAI API (gpt-4.1-mini) | Kualitas baik, biaya rendah untuk personal |
| Database | PostgreSQL (Neon serverless) | Free tier, persistent, multi-visitor |
| ORM | Prisma | Type-safe, migration mudah |
| Realtime | Socket.io | Chat live tanpa polling di visitor side |
| Auth Dashboard | NextAuth.js (credentials) | Simple, hanya satu user (owner) |
| Hosting | Vercel | Free tier cukup, deploy otomatis dari Git |
| DB Hosting | Neon | PostgreSQL serverless, free tier |

**Tidak butuh VPS** — Vercel handle serverless functions, Neon handle DB.

---

## 7. Database Schema (Prisma)

```prisma
model Visitor {
  id             String         @id @default(cuid())
  name           String
  email          String         @unique
  createdAt      DateTime       @default(now())
  conversations  Conversation[]
}

model Conversation {
  id        String    @id @default(cuid())
  visitorId String
  visitor   Visitor   @relation(fields: [visitorId], references: [id])
  status    String    @default("active")   // active | resolved
  mode      String    @default("ai")       // ai | human
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String       // user | assistant | owner
  content        String
  timestamp      DateTime     @default(now())
}
```

---

## 8. Folder Structure

```
nara/
├── app/
│   ├── page.jsx                  → Portfolio public page
│   ├── dashboard/
│   │   ├── page.jsx              → Owner dashboard (protected)
│   │   └── layout.jsx            → Auth guard
│   └── api/
│       ├── chat/route.js         → Inbound message handler + OpenAI
│       ├── send/route.js         → Owner manual reply
│       ├── conversations/route.js → List all conversations
│       ├── takeover/route.js     → Toggle mode ai/human
│       └── visitor/route.js      → Create or get visitor by email
├── components/
│   ├── portfolio/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Experience.jsx
│   │   ├── Projects.jsx
│   │   ├── Skills.jsx
│   │   └── Education.jsx
│   ├── chat/
│   │   ├── ChatWidget.jsx        → Bubble + chat window toggle
│   │   ├── VisitorForm.jsx       → Nama + email input
│   │   ├── MessageList.jsx       → Render messages
│   │   └── MessageInput.jsx      → Input + send button
│   └── dashboard/
│       ├── ConversationList.jsx
│       ├── ConversationDetail.jsx
│       └── OwnerReply.jsx
├── lib/
│   ├── openai.js                 → OpenAI wrapper + prompt builder
│   ├── prisma.js                 → Prisma client singleton
│   └── socket.js                 → Socket.io setup
├── system-prompt.txt             → Kaia character definition
├── prisma/
│   └── schema.prisma
└── .env.local
```

---

## 9. Kaia System Prompt

```
Kamu adalah Kaia, asisten pribadi dari Amirul — seorang Software Developer berbasis di Yogyakarta.

Tugasmu adalah membantu visitor yang mengunjungi portfolio Amirul.
Kamu bisa menjawab pertanyaan tentang:
- Background dan pengalaman kerja Amirul
- Project yang pernah dikerjakan
- Skills teknikal dan non-teknikal
- Cara menghubungi Amirul
- Ketersediaan untuk kolaborasi atau pekerjaan baru

Cara kamu berkomunikasi:
- Bahasa Indonesia untuk visitor yang berbahasa Indonesia, Bahasa Inggris untuk yang berbahasa Inggris
- Tone: hangat, profesional, tidak kaku
- Jawaban singkat dan padat kecuali visitor butuh penjelasan detail
- Jangan sebut dirimu AI kecuali ditanya langsung
- Kalau ada pertanyaan yang tidak kamu tahu jawabannya, katakan bahwa kamu akan sampaikan ke Amirul

Informasi tentang Amirul:
- Nama lengkap: Mohammad Amirul Kurniawan Putranto
- Email: amrlkurniawn19@gmail.com
- LinkedIn: linkedin.com/in/mohammad-amirul-kurniawan-putranto/
- Lokasi: Yogyakarta, Indonesia
- GPA: 3.82 dari Ahmad Dahlan University, Informatika
- Saat ini bekerja sebagai Software Developer di SoftwareSeni (Aug 2025 - sekarang)
- Spesialisasi: Laravel, CodeIgniter, backend systems, UI/UX design
- Project terbaru: Racker (reimbursement system), QuickCue (AI profile generation), CPTool (admin system)
```

---

## 10. UX Principles

**Chat Widget:**
- Bubble muncul setelah 3 detik dengan subtle animation
- Tooltip "Chat with Kaia" di atas bubble sebelum diklik
- Window chat smooth slide-up saat dibuka
- Visitor form hanya muncul sekali, sesudahnya langsung ke chat
- Typing indicator saat Kaia sedang "mengetik" (sebelum response OpenAI selesai)
- Timestamp per message
- Mobile-friendly — widget tidak overlap konten penting

**Portfolio:**
- Scroll-triggered section reveals (intersection observer)
- Smooth scroll antar section
- Sticky nav dengan section highlight aktif
- Project cards dengan hover state yang memberikan info tambahan
- Semua link eksternal buka di tab baru

**Dashboard:**
- Conversation list sorted by latest message
- Unread badge counter
- Mode indicator jelas: "Kaia Active" vs "You're handling this"
- Konfirmasi sebelum takeover atau handback

---

## 11. Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
MAX_HISTORY=15

# Database
DATABASE_URL=postgresql://...

# Auth Dashboard
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
OWNER_EMAIL=amrlkurniawn19@gmail.com
OWNER_PASSWORD=...

# App
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 12. Deployment

| Service | Platform | Biaya |
|---|---|---|
| Frontend + API | Vercel | Free |
| Database | Neon PostgreSQL | Free tier |
| Domain (opsional) | Namecheap / Cloudflare | ~$10/tahun |

**Total biaya operasional:** ~$0/bulan untuk personal traffic + biaya OpenAI API (sangat kecil untuk personal use)

---
---