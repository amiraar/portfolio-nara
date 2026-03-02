/**
 * app/dashboard/page.jsx — Owner dashboard for monitoring and managing conversations.
 *
 * Features:
 * - Conversation list with polling every 30 seconds
 * - Full message history for selected conversation
 * - Takeover / Hand back to Kaia controls
 * - Manual owner reply
 * - Realtime updates via Socket.io
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import ConversationList from "@/components/dashboard/ConversationList";
import ConversationDetail from "@/components/dashboard/ConversationDetail";
import OwnerReply from "@/components/dashboard/OwnerReply";
import ContentEditor from "@/components/dashboard/ContentEditor";
import { getSocket } from "@/lib/socket";

const POLL_INTERVAL = 30_000; // 30 seconds

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [mobileView, setMobileView] = useState("list"); // "list" | "detail"
  const [activeTab, setActiveTab] = useState("conversations"); // "conversations" | "content"

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  /** Fetch all conversations from the server */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  }, []);

  /** Load selected conversation's full message history */
  const loadConversation = useCallback(async (convId) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const data = await res.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        // Update local conversation state
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, ...data.conversation } : c))
        );
      }
    } catch (err) {
      console.error("Load conversation error:", err);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchConversations();
    const interval = setInterval(fetchConversations, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [status, fetchConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedId) loadConversation(selectedId);
  }, [selectedId, loadConversation]);

  // Socket.io: join dashboard room + listen for new messages / mode changes
  useEffect(() => {
    if (status !== "authenticated") return;

    const socket = getSocket();
    socket.emit("join_dashboard");

    function onNewMessage({ conversationId, message }) {
      // Append to selected conversation messages
      if (conversationId === selectedId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      // Refresh list to update previews + order
      fetchConversations();
      // Increment new badge if not currently selected
      if (conversationId !== selectedId) {
        setNewCount((n) => n + 1);
      }
    }

    function onModeChanged({ conversationId, mode }) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, mode } : c))
      );
    }

    socket.on("new_message", onNewMessage);
    socket.on("mode_changed", onModeChanged);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("mode_changed", onModeChanged);
    };
  }, [status, selectedId, fetchConversations]);

  /** Takeover conversation (mode → human) */
  async function handleTakeover() {
    if (!selectedId) return;
    setIsTakingOver(true);
    try {
      await fetch("/api/takeover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, mode: "human" }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, mode: "human" } : c))
      );
    } catch (err) {
      console.error("Takeover error:", err);
    } finally {
      setIsTakingOver(false);
    }
  }

  /** Hand back to Kaia (mode → ai) */
  async function handleHandback() {
    if (!selectedId) return;
    setIsTakingOver(true);
    try {
      await fetch("/api/takeover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, mode: "ai" }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, mode: "ai" } : c))
      );
    } catch (err) {
      console.error("Handback error:", err);
    } finally {
      setIsTakingOver(false);
    }
  }

  /** Resolve conversation */
  async function handleResolve() {
    if (!selectedId) return;
    try {
      await fetch(`/api/conversations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, status: "resolved" } : c))
      );
    } catch (err) {
      console.error("Resolve error:", err);
    }
  }

  function handleSelect(conv) {
    setSelectedId(conv.id);
    setNewCount(0);
    setMobileView("detail"); // switch to detail on mobile
  }

  function handleBackToList() {
    setMobileView("list");
    setSelectedId(null);
  }

  function handleReplySent(message) {
    setMessages((prev) => {
      if (prev.find((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-xs text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button — mobile only, shown in detail view */}
          {mobileView === "detail" && selectedId && (
            <button
              onClick={handleBackToList}
              className="sm:hidden mr-1 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Back to list"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <span className="font-display text-sm font-medium text-text-primary truncate">
            {mobileView === "detail" && selectedId
              ? conversations.find((c) => c.id === selectedId)?.visitor?.name ?? "Conversation"
              : <><span className="text-text-primary">Nara</span> <span className="text-accent">Dashboard</span></>
            }
          </span>
          {newCount > 0 && (
            <span className="font-mono text-[10px] bg-accent text-background px-1.5 py-0.5 rounded-full flex-shrink-0">
              {newCount} new
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("conversations")}
            className={clsx(
              "font-mono text-xs px-3 py-1 rounded-lg transition-colors",
              activeTab === "conversations"
                ? "bg-accent/10 text-accent border border-accent/30"
                : "text-text-muted hover:text-text-primary border border-transparent"
            )}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={clsx(
              "font-mono text-xs px-3 py-1 rounded-lg transition-colors",
              activeTab === "content"
                ? "bg-accent/10 text-accent border border-accent/30"
                : "text-text-muted hover:text-text-primary border border-transparent"
            )}
          >
            Content
          </button>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {lastFetch && (
            <span className="font-mono text-[10px] text-text-muted hidden sm:inline">
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main layout */}
      {activeTab === "content" ? (
        <div className="flex-1 overflow-hidden">
          <ContentEditor />
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — always visible on desktop; visible on mobile only in list view */}
        <aside
          className={clsx(
            "border-r border-border bg-surface/40 flex flex-col overflow-hidden",
            "w-full sm:w-72 sm:flex-shrink-0",
            mobileView === "detail" ? "hidden sm:flex" : "flex"
          )}
        >
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <p className="font-mono text-xs text-text-muted">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </aside>

        {/* Detail panel — always visible on desktop; visible on mobile only in detail view */}
        <main
          className={clsx(
            "flex-1 flex flex-col overflow-hidden",
            mobileView === "list" ? "hidden sm:flex" : "flex"
          )}
        >
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-hidden flex flex-col">
                <ConversationDetail
                  conversation={selectedConversation}
                  messages={messages}
                  onTakeover={handleTakeover}
                  onHandback={handleHandback}
                  onResolve={handleResolve}
                  isTakingOver={isTakingOver}
                />
              </div>
              <OwnerReply
                conversationId={selectedId}
                disabled={selectedConversation.mode !== "human"}
                onSent={handleReplySent}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="font-display text-text-muted">Select a conversation</p>
                <p className="text-xs text-text-muted mt-1">Choose from the list on the left</p>
              </div>
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}
