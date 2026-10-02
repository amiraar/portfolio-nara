/**
 * app/privacy/page.jsx — Kebijakan Privasi (privacy policy) for the Kaia chat.
 *
 * Every statement here must match the code. When changing what is collected,
 * where it is sent, or how long it is kept, update this page in the same change:
 *   - collected fields:   app/api/visitor/route.js, app/api/chat/route.js
 *   - Gemini input:       lib/gemini.js (message text only, no name/email)
 *   - Pusher payloads:    app/api/chat/route.js, lib/pusher.js
 *   - retention:          app/api/cron/retention/route.js, lib/rateLimit.js
 *   - self-service:       app/api/visitor/me/route.js
 *   - third-party loads:  app/layout.jsx (Google Fonts stylesheet)
 *
 * TODO(owner): add the data-centre regions of Pusher, Neon and Vercel from their
 * dashboards to the "Pihak ketiga" section before relying on this page for
 * UU PDP cross-border transfer disclosure.
 */

export const metadata = {
  title: "Kebijakan Privasi — Amirul",
  description: "Data apa yang dikumpulkan chat Kaia, untuk apa, ke mana dikirim, dan berapa lama disimpan.",
};

const CONTACT_EMAIL = "amrlkurniawn19@gmail.com";
const EFFECTIVE_DATE = "2 Oktober 2026";

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-text-primary mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-text-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-16">
      <article className="max-w-2xl mx-auto">
        <a href="/" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
          ← Kembali ke portfolio
        </a>

        <h1 className="font-display text-3xl text-text-primary mt-8">Kebijakan Privasi</h1>
        <p className="font-mono text-xs text-text-muted mt-2">Berlaku sejak {EFFECTIVE_DATE}</p>

        <p className="text-sm leading-relaxed text-text-muted mt-6">
          Halaman ini menjelaskan data yang diproses saat kamu memakai Kaia, asisten chat di situs ini.
          Pengendali data adalah Mohammad Amirul Kurniawan Putranto (pemilik situs). Membaca portfolio
          tanpa memakai chat tidak menyimpan data pribadi; seperti setiap permintaan web, alamat IP-mu
          tetap diproses oleh hosting (Vercel) dan penyedia font (Google Fonts) saat halaman dimuat.
        </p>

        <Section title="Data yang dikumpulkan">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-text-primary">Nama dan email</strong> yang kamu isi di form chat. Email tidak diverifikasi.</li>
            <li><strong className="text-text-primary">Isi pesan</strong> yang kamu kirim, beserta balasan Kaia dan pemilik situs.</li>
            <li><strong className="text-text-primary">Waktu persetujuan</strong> (consent) sebagai bukti kamu menyetujui pemrosesan ini.</li>
            <li><strong className="text-text-primary">Alamat IP</strong>, hanya untuk membatasi jumlah permintaan (anti-spam/rate limit).</li>
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
              <strong className="text-text-primary">Google (Gemini API)</strong> — menerima isi pesan untuk
              membuat balasan Kaia. Nama dan email tidak dikirim ke Google. Situs ini memakai layanan Gemini
              API tanpa biaya; menurut ketentuan Google untuk layanan tersebut, Google dapat memakai isi pesan
              untuk menyediakan, meningkatkan, dan mengembangkan produknya, dan peninjau manusia dapat membaca
              isinya. <strong className="text-text-primary">Jangan kirim data pribadi atau sensitif di chat.</strong>
            </li>
            <li>
              <strong className="text-text-primary">Pusher</strong> — mengantarkan pesan secara realtime
              (termasuk nama, email, dan isi pesan) antara browsermu dan dashboard pemilik situs.
            </li>
            <li><strong className="text-text-primary">Neon</strong> — database tempat data disimpan.</li>
            <li><strong className="text-text-primary">Vercel</strong> — hosting situs; memproses setiap permintaan, termasuk alamat IP.</li>
            <li>
              <strong className="text-text-primary">Google Fonts</strong> — menyediakan file huruf; browsermu
              memintanya langsung ke server Google, sehingga Google menerima alamat IP-mu.
            </li>
          </ul>
        </Section>

        <Section title="Berapa lama disimpan">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Nama, email, dan percakapan dihapus otomatis <strong className="text-text-primary">90 hari setelah aktivitas terakhir</strong>.</li>
            <li>Catatan rate limit (berisi alamat IP) dihapus setelah sekitar 2 hari.</li>
          </ul>
        </Section>

        <Section title="Cookie dan penyimpanan browser">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <code className="font-mono text-xs">visitor-token</code> — cookie HttpOnly yang mengenali sesi
              chat-mu, berlaku 30 hari. Tanpa cookie ini kamu tidak bisa membuka riwayat chat.
            </li>
            <li>
              <code className="font-mono text-xs">nara_visitor</code> (localStorage) — hanya ID percakapan, tanpa nama atau email.
            </li>
            <li><code className="font-mono text-xs">nara-theme</code> (localStorage) — pilihan tema terang/gelap.</li>
          </ul>
          <p>Tidak ada cookie analitik atau iklan.</p>
        </Section>

        <Section title="Hak kamu">
          <p>Dari browser yang sama dengan yang kamu pakai untuk chat, buka widget chat lalu:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-text-primary">Unduh data saya</strong> — salinan nama, email, dan seluruh percakapanmu (JSON).</li>
            <li>
              <strong className="text-text-primary">Hapus data saya</strong> — menghapus permanen nama, email,
              dan percakapanmu, sekaligus menarik persetujuanmu.
            </li>
          </ul>
          <p>
            Dari browser lain, atau untuk meminta koreksi data, kirim email ke{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="Kontak">
          <p>
            Pertanyaan tentang privasi atau laporan masalah keamanan:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>
      </article>
    </main>
  );
}
