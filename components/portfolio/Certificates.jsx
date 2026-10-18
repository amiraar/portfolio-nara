"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CERTIFICATES, CERTIFICATE_GROUPS } from "@/lib/certificates";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import CertificateViewer from "@/components/portfolio/CertificateViewer";

export default function Certificates() {
  const sectionRef = useRef(null);
  const [open, setOpen] = useState(null);
  useRevealOnScroll(sectionRef, 0.08);

  return (
    <section id="certificates" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] text-accent/70 tracking-widest">06</span>
          <span className="h-px w-8 bg-accent/40" />
          <h2 className="font-display text-4xl text-text-primary">Certificates</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        <div className="space-y-12">
          {CERTIFICATE_GROUPS.map((group) => {
            const items = CERTIFICATES.filter((cert) => cert.group === group.id);
            if (!items.length) return null;
            return (
              <div key={group.id}>
                <h3 className="font-mono text-[10px] text-accent/70 uppercase tracking-widest mb-5">
                  {group.label}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((cert) => (
                    <CertificateCard key={cert.id} cert={cert} onOpen={() => setOpen(cert)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open ? (
        <CertificateViewer key={open.id} certificate={open} onClose={() => setOpen(null)} />
      ) : null}
    </section>
  );
}

function CertificateCard({ cert, onOpen }) {
  const cover = cert.pages[0];
  const count = cert.pages.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View certificate: ${cert.title}, ${cert.issuer}`}
      className="group text-left warm-card rounded-2xl overflow-hidden flex flex-row sm:flex-col hover:border-accent/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {/* Compact row on phones so six cards don't become a very long scroll */}
      <div className="relative w-32 sm:w-full flex-shrink-0 self-center sm:self-auto aspect-[1.414] bg-white overflow-hidden sm:rounded-none rounded-lg ml-3 sm:ml-0">
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 128px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {count > 1 ? (
          <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 font-mono text-[9px] text-white bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
            <span className="sm:hidden">×{count}</span>
            <span className="hidden sm:inline">{count} certificates</span>
          </span>
        ) : null}
      </div>
      <div className="p-4 flex-1 min-w-0 flex flex-col">
        <span className="font-mono text-[10px] text-text-muted">{cert.date}</span>
        <span className="mt-1.5 text-[14px] font-medium text-text-primary leading-snug">{cert.title}</span>
        <span className="mt-1 text-[12px] text-text-muted leading-snug">{cert.issuer}</span>
        {cert.summary ? (
          <span className="mt-2 text-[12px] text-text-muted/80 leading-snug line-clamp-3">{cert.summary}</span>
        ) : null}
        <span className="mt-auto pt-3 font-mono text-[10px] text-accent/80 group-hover:text-accent transition-colors">
          {count > 1 ? "View certificates →" : "View certificate →"}
        </span>
      </div>
    </button>
  );
}
