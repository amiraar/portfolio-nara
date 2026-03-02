/**
 * app/page.jsx — Public portfolio page.
 * Renders all portfolio sections + sticky nav + chat widget.
 */

"use client";

import { useRef } from "react";
import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Experience from "@/components/portfolio/Experience";
import Projects from "@/components/portfolio/Projects";
import Skills from "@/components/portfolio/Skills";
import Education from "@/components/portfolio/Education";
import ChatWidget from "@/components/chat/ChatWidget";

export default function HomePage() {
  const chatWidgetRef = useRef(null);

  /**
   * Called by Hero's "Chat with Kaia" CTA button.
   * Programmatically opens the chat widget.
   */
  function handleChatOpen() {
    // The chat widget manages its own state; we dispatch a custom event
    window.dispatchEvent(new CustomEvent("open_chat_widget"));
  }

  return (
    <>
      <Nav />
      <main>
        <Hero onChatOpen={handleChatOpen} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
      </main>
      <ChatWidget ref={chatWidgetRef} />
    </>
  );
}
