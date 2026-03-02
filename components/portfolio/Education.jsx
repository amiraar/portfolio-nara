/**
 * components/portfolio/Education.jsx — Education and contact/footer section.
 */

"use client";

import { useEffect, useRef } from "react";

export default function Education() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("revealed"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-14">
          <p className="font-mono text-accent text-xs tracking-widest uppercase">05 — Education &amp; Contact</p>
          <div className="gold-divider flex-1 max-w-[60px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Education card */}
          <div className="p-6 rounded-xl border border-border bg-surface/60">
            <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Education</p>
            <h3 className="font-display text-xl font-medium text-text-primary leading-snug">
              Ahmad Dahlan University
            </h3>
            <p className="text-text-muted text-sm mt-1">Informatics · S.Kom</p>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-text-muted">GPA</span>
                <span className="font-mono text-sm text-accent">3.82 / 4.00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-text-muted">Period</span>
                <span className="font-mono text-sm text-text-muted">2020 – 2024</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-text-muted">Location</span>
                <span className="font-mono text-sm text-text-muted">Yogyakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="p-6 rounded-xl border border-border bg-surface/60">
            <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Get in Touch</p>
            <h3 className="font-display text-xl font-medium text-text-primary leading-snug mb-2">
              Let&apos;s work together.
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Whether it&apos;s a backend challenge, a new product, or just a chat —
              I&apos;m always open to interesting conversations.
            </p>

            <div className="space-y-3">
              <a
                href="mailto:amrlkurniawn19@gmail.com"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
              >
                <div>
                  <p className="text-xs text-text-muted font-mono">Email</p>
                  <p className="text-sm text-text-primary mt-0.5">amrlkurniawn19@gmail.com</p>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
              </a>
              <a
                href="https://linkedin.com/in/mohammad-amirul-kurniawan-putranto/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
              >
                <div>
                  <p className="text-xs text-text-muted font-mono">LinkedIn</p>
                  <p className="text-sm text-text-primary mt-0.5">Mohammad Amirul Kurniawan</p>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-display text-text-muted text-sm">
            © 2026 Mohammad Amirul Kurniawan Putranto
          </p>
          <p className="font-mono text-xs text-text-muted">
            Built with Next.js · Powered by Kaia
          </p>
        </div>
      </div>
    </section>
  );
}
