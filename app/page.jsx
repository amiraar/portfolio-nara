/**
 * app/page.jsx — Public portfolio page.
 * Renders all portfolio sections + sticky nav + chat widget.
 */

"use client";

import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Experience from "@/components/portfolio/Experience";
import Projects from "@/components/portfolio/Projects";
import Skills from "@/components/portfolio/Skills";
import Education from "@/components/portfolio/Education";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function HomePage() {
  /**
   * Called by Hero's "Chat with Kaia" CTA button.
   * Programmatically opens the chat widget via custom event.
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
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
