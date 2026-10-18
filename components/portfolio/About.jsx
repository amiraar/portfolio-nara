"use client";

import { useRef } from "react";
import Image from "next/image";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import outdoorPhoto from "@/public/profile/outdoor.webp";

export default function About() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("about", PORTFOLIO_DEFAULTS.about);
  useRevealOnScroll(sectionRef, 0.12);

  const defaultInfo = PORTFOLIO_DEFAULTS.about.info;
  const locationRow = defaultInfo.find((row) => row.label === "Location");
  const statusRow = defaultInfo.find((row) => row.label === "Currently");
  const paragraphs = data.paragraphs ?? [];
  const [firstParagraph, ...restParagraphs] = paragraphs;
  const firstLetter = firstParagraph ? firstParagraph.trim().charAt(0) : "";
  const firstParagraphRest = firstParagraph ? firstParagraph.trim().slice(1) : "";

  return (
    <section id="about" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[10px] text-accent/70 tracking-widest">01</span>
              <span className="flex-1 h-px bg-border/60" />
            </div>
            <h2 className="font-display text-3xl font-medium text-text-primary">About</h2>

            {/* Identity card */}
            <figure className="mt-8 relative w-full max-w-[300px] sm:max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-border">
              <Image
                src={outdoorPhoto}
                alt="Mohammad Amirul outdoors in a hiking jacket"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 260px, (min-width: 640px) 340px, 300px"
                className="object-cover object-[50%_30%]"
              />
              {/* Darkens the lower part so the caption stays readable in both themes */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                aria-hidden="true"
              />

              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 font-mono text-[9px] text-white border border-white/20 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Available
              </span>

              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-2xl font-light text-white leading-tight italic">
                  Mohammad<br />Amirul
                </p>
                <div className="mt-3 space-y-1.5 text-white/75">
                  {locationRow ? (
                    <div className="flex items-center gap-2">
                      <svg width="9" height="9" viewBox="0 0 12 16" fill="none" aria-hidden="true">
                        <path d="M6 0C3 0 0 2.69 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" fill="currentColor" fillOpacity="0.8" />
                        <circle cx="6" cy="6" r="2" fill="black" fillOpacity="0.6" />
                      </svg>
                      <span className="font-mono text-[10px]">{locationRow.value}</span>
                    </div>
                  ) : null}
                  {statusRow ? (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full border border-white/60" />
                      <span className="font-mono text-[10px]">{statusRow.value}</span>
                    </div>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9">
            <h3 className="font-display text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
              {data.heading ?? ""}
              {data.headingAccent ? (
                <em className="not-italic gradient-text"> {data.headingAccent}</em>
              ) : null}
            </h3>

            <div className="mt-7 space-y-4 text-text-muted text-[15px] leading-[1.85]">
              {firstParagraph ? (
                <p>
                  <span
                    className="font-display font-light float-left mr-2.5 leading-none gradient-text select-none"
                    style={{ fontSize: "4rem", lineHeight: "0.82" }}
                    aria-hidden="true"
                  >
                    {firstLetter}
                  </span>
                  {firstParagraphRest}
                </p>
              ) : null}
              {restParagraphs.map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
              ))}
            </div>

            {/* Info grid */}
            <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(data.info ?? []).map((row) => (
                <div key={row.label} className="warm-card rounded-xl p-3.5">
                  <div className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mb-1.5">
                    {row.label}
                  </div>
                  <div className="text-[13px] text-text-primary font-medium">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
