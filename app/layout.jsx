/**
 * app/layout.jsx — Root layout: sets metadata, fonts, and wraps app with SessionProvider.
 */

import "./globals.css";
import NextAuthSessionProvider from "@/components/SessionProvider";

/** @type {import('next').Metadata} */
export const metadata = {
  title: "Amirul — Software Developer",
  description:
    "Portfolio of Mohammad Amirul Kurniawan Putranto — Backend Developer, UI/UX Designer, and AI Systems builder based in Yogyakarta.",
  openGraph: {
    title: "Amirul — Software Developer",
    description: "Backend Developer, UI/UX Designer, AI Systems",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect for Google Fonts (loaded via globals.css @import) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="bg-background text-text-primary font-sans antialiased">
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
