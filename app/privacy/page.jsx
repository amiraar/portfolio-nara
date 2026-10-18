/**
 * app/privacy/page.jsx — privacy policy for the Kaia chat, in English (default)
 * and Indonesian (/privacy?lang=id). The two versions must say the same thing.
 *
 * Every statement here must match the code. When changing what is collected,
 * where it is sent, or how long it is kept, update both versions in the same change:
 *   - collected fields:   app/api/visitor/route.js, app/api/chat/route.js
 *   - Gemini input:       lib/gemini.js (message text only, no name/email)
 *   - Pusher payloads:    app/api/chat/route.js, lib/pusher.js
 *   - retention:          app/api/cron/retention/route.js, lib/rateLimit.js
 *   - self-service:       app/api/visitor/me/route.js
 *   - third-party loads:  app/layout.jsx (Google Fonts stylesheet)
 *
 * TODO(owner): add the data-centre regions of Pusher, Neon and Vercel from their
 * dashboards to the "Third parties" / "Pihak ketiga" section before relying on
 * this page for UU PDP cross-border transfer disclosure.
 */

const CONTACT_EMAIL = "amrlkurniawn19@gmail.com";

const META = {
  en: {
    title: "Privacy Policy — Amirul",
    description: "What data the Kaia chat collects, why, where it is sent, and how long it is kept.",
  },
  id: {
    title: "Kebijakan Privasi — Amirul",
    description: "Data apa yang dikumpulkan chat Kaia, untuk apa, ke mana dikirim, dan berapa lama disimpan.",
  },
};

const LANGUAGES = [
  { code: "en", label: "English", href: "/privacy" },
  { code: "id", label: "Bahasa Indonesia", href: "/privacy?lang=id" },
];

/** @param {{ lang?: string | string[] }} params */
function resolveLang(params) {
  return params?.lang === "id" ? "id" : "en";
}

export async function generateMetadata({ searchParams }) {
  const lang = resolveLang(await searchParams);
  return { ...META[lang], alternates: { canonical: lang === "id" ? "/privacy?lang=id" : "/privacy" } };
}

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-text-primary mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-text-muted">{children}</div>
    </section>
  );
}

function Strong({ children }) {
  return <strong className="text-text-primary">{children}</strong>;
}

function Code({ children }) {
  return <code className="font-mono text-xs">{children}</code>;
}

function Email() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline break-all">
      {CONTACT_EMAIL}
    </a>
  );
}

function PolicyEn() {
  return (
    <>
      <a href="/" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        ← Back to portfolio
      </a>

      <h1 className="font-display text-3xl text-text-primary mt-8">Privacy Policy</h1>
      <p className="font-mono text-xs text-text-muted mt-2">Effective from 2 October 2026</p>

      <p className="text-sm leading-relaxed text-text-muted mt-6">
        This page explains the data processed when you use Kaia, the chat assistant on this site. The data
        controller is Mohammad Amirul Kurniawan Putranto (the site owner). Reading the portfolio without using
        the chat does not store any personal data; as with any web request, your IP address is still processed
        by the host (Vercel) and the font provider (Google Fonts) when the page loads.
      </p>

      <Section title="Data collected">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><Strong>Name and email</Strong> you enter in the chat form. The email is not verified.</li>
          <li><Strong>Messages</Strong> you send, along with replies from Kaia and the site owner.</li>
          <li><Strong>Consent time</Strong>, as a record that you agreed to this processing.</li>
          <li><Strong>IP address</Strong>, only to limit the number of requests (anti-spam / rate limiting).</li>
        </ul>
      </Section>

      <Section title="Why">
        <p>
          To reply to your messages (automatically by Kaia or directly by the site owner) and to protect the
          service from abuse. The data is not sold and is not used for advertising. The legal basis is your
          consent, which you give with the checkbox before the chat starts.
        </p>
      </Section>

      <Section title="Third parties that process the data">
        <p>The data may be processed outside Indonesia by the following service providers:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <Strong>Google (Gemini API)</Strong> — receives your messages to generate Kaia&apos;s replies. Your name
            and email are not sent to Google. This site uses the Gemini API free of charge; under Google&apos;s terms
            for that service, Google may use the messages to provide, improve, and develop its products, and human
            reviewers may read them. <Strong>Do not send personal or sensitive data in the chat.</Strong>
          </li>
          <li>
            <Strong>Pusher</Strong> — delivers messages in real time (including name, email, and message text)
            between your browser and the site owner&apos;s dashboard.
          </li>
          <li><Strong>Neon</Strong> — the database where the data is stored.</li>
          <li><Strong>Vercel</Strong> — hosts the site; processes every request, including your IP address.</li>
          <li>
            <Strong>Google Fonts</Strong> — serves the font files; your browser requests them directly from
            Google&apos;s servers, so Google receives your IP address.
          </li>
        </ul>
      </Section>

      <Section title="How long it is kept">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Name, email, and conversations are deleted automatically <Strong>90 days after your last activity</Strong>.</li>
          <li>Rate-limit records (which contain IP addresses) are deleted after about 2 days.</li>
        </ul>
      </Section>

      <Section title="Cookies and browser storage">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <Code>visitor-token</Code> — an HttpOnly cookie that identifies your chat session, valid for 30 days.
            Without it you cannot open your chat history.
          </li>
          <li><Code>nara_visitor</Code> (localStorage) — only the conversation ID, no name or email.</li>
          <li><Code>nara-theme</Code> (localStorage) — your light/dark theme choice.</li>
        </ul>
        <p>There are no analytics or advertising cookies.</p>
      </Section>

      <Section title="Your rights">
        <p>From the same browser you used for the chat, open the chat widget, then:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><Strong>Download my data</Strong> — a copy of your name, email, and all your conversations (JSON).</li>
          <li>
            <Strong>Delete my data</Strong> — permanently deletes your name, email, and conversations, and
            withdraws your consent.
          </li>
        </ul>
        <p>From another browser, or to ask for a correction, email <Email />.</p>
      </Section>

      <Section title="Contact">
        <p>Privacy questions or security reports: <Email />.</p>
      </Section>
    </>
  );
}

function PolicyId() {
  return (
    <>
      <a href="/" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        ← Kembali ke portfolio
      </a>

      <h1 className="font-display text-3xl text-text-primary mt-8">Kebijakan Privasi</h1>
      <p className="font-mono text-xs text-text-muted mt-2">Berlaku sejak 2 Oktober 2026</p>

      <p className="text-sm leading-relaxed text-text-muted mt-6">
        Halaman ini menjelaskan data yang diproses saat kamu memakai Kaia, asisten chat di situs ini.
        Pengendali data adalah Mohammad Amirul Kurniawan Putranto (pemilik situs). Membaca portfolio
        tanpa memakai chat tidak menyimpan data pribadi; seperti setiap permintaan web, alamat IP-mu
        tetap diproses oleh hosting (Vercel) dan penyedia font (Google Fonts) saat halaman dimuat.
      </p>

      <Section title="Data yang dikumpulkan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><Strong>Nama dan email</Strong> yang kamu isi di form chat. Email tidak diverifikasi.</li>
          <li><Strong>Isi pesan</Strong> yang kamu kirim, beserta balasan Kaia dan pemilik situs.</li>
          <li><Strong>Waktu persetujuan</Strong> (consent) sebagai bukti kamu menyetujui pemrosesan ini.</li>
          <li><Strong>Alamat IP</Strong>, hanya untuk membatasi jumlah permintaan (anti-spam/rate limit).</li>
        </ul>
      </Section>

      <Section title="Untuk apa">
        <p>
          Untuk membalas pesanmu (otomatis oleh Kaia atau langsung oleh pemilik situs) dan menjaga layanan
          dari penyalahgunaan. Data tidak dijual dan tidak dipakai untuk iklan. Dasar pemrosesan adalah
          persetujuanmu, yang kamu berikan lewat checkbox sebelum chat dimulai.
        </p>
      </Section>

      <Section title="Pihak ketiga yang memproses data">
        <p>Data dapat diproses di luar Indonesia oleh penyedia layanan berikut:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <Strong>Google (Gemini API)</Strong> — menerima isi pesan untuk membuat balasan Kaia. Nama dan email
            tidak dikirim ke Google. Situs ini memakai layanan Gemini API tanpa biaya; menurut ketentuan Google
            untuk layanan tersebut, Google dapat memakai isi pesan untuk menyediakan, meningkatkan, dan
            mengembangkan produknya, dan peninjau manusia dapat membaca isinya.{" "}
            <Strong>Jangan kirim data pribadi atau sensitif di chat.</Strong>
          </li>
          <li>
            <Strong>Pusher</Strong> — mengantarkan pesan secara realtime (termasuk nama, email, dan isi pesan)
            antara browsermu dan dashboard pemilik situs.
          </li>
          <li><Strong>Neon</Strong> — database tempat data disimpan.</li>
          <li><Strong>Vercel</Strong> — hosting situs; memproses setiap permintaan, termasuk alamat IP.</li>
          <li>
            <Strong>Google Fonts</Strong> — menyediakan file huruf; browsermu memintanya langsung ke server
            Google, sehingga Google menerima alamat IP-mu.
          </li>
        </ul>
      </Section>

      <Section title="Berapa lama disimpan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Nama, email, dan percakapan dihapus otomatis <Strong>90 hari setelah aktivitas terakhir</Strong>.</li>
          <li>Catatan rate limit (berisi alamat IP) dihapus setelah sekitar 2 hari.</li>
        </ul>
      </Section>

      <Section title="Cookie dan penyimpanan browser">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <Code>visitor-token</Code> — cookie HttpOnly yang mengenali sesi chat-mu, berlaku 30 hari. Tanpa
            cookie ini kamu tidak bisa membuka riwayat chat.
          </li>
          <li><Code>nara_visitor</Code> (localStorage) — hanya ID percakapan, tanpa nama atau email.</li>
          <li><Code>nara-theme</Code> (localStorage) — pilihan tema terang/gelap.</li>
        </ul>
        <p>Tidak ada cookie analitik atau iklan.</p>
      </Section>

      <Section title="Hak kamu">
        <p>Dari browser yang sama dengan yang kamu pakai untuk chat, buka widget chat lalu:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <Strong>Download my data</Strong> (unduh data saya) — salinan nama, email, dan seluruh percakapanmu (JSON).
          </li>
          <li>
            <Strong>Delete my data</Strong> (hapus data saya) — menghapus permanen nama, email, dan percakapanmu,
            sekaligus menarik persetujuanmu.
          </li>
        </ul>
        <p>Dari browser lain, atau untuk meminta koreksi data, kirim email ke <Email />.</p>
      </Section>

      <Section title="Kontak">
        <p>Pertanyaan tentang privasi atau laporan masalah keamanan: <Email />.</p>
      </Section>
    </>
  );
}

export default async function PrivacyPage({ searchParams }) {
  const lang = resolveLang(await searchParams);

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-16">
      <article lang={lang} className="max-w-2xl mx-auto">
        <nav aria-label="Language" className="flex justify-end mb-6">
          <div className="inline-flex rounded-full border border-border p-0.5 font-mono text-[11px]">
            {LANGUAGES.map((option) => (
              <a
                key={option.code}
                href={option.href}
                hrefLang={option.code}
                lang={option.code}
                aria-current={option.code === lang ? "page" : undefined}
                className={
                  option.code === lang
                    ? "px-3 py-1.5 rounded-full bg-accent/15 text-accent"
                    : "px-3 py-1.5 rounded-full text-text-muted hover:text-text-primary transition-colors"
                }
              >
                {option.label}
              </a>
            ))}
          </div>
        </nav>

        {lang === "id" ? <PolicyId /> : <PolicyEn />}
      </article>
    </main>
  );
}
