"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";
import { useTheme } from "@/components/ThemeProvider";
import ConversationList from "@/components/dashboard/ConversationList";
import ConversationDetail from "@/components/dashboard/ConversationDetail";
import OwnerReply from "@/components/dashboard/OwnerReply";
import ContentEditor from "@/components/dashboard/ContentEditor";
import MessageChart from "@/components/dashboard/MessageChart";
import { getPusherClient } from "@/lib/pusherClient";

const POLL_INTERVAL = 30_000;

// ── Navigation definition ───────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    group: "Inbox",
    items: [
      { key: "conversations", label: "Conversations", apiSection: null },
    ],
  },
  {
    group: "Portfolio",
    items: [
      { key: "hero",       label: "Hero",       apiSection: "hero" },
      { key: "about",      label: "About",      apiSection: "about" },
      { key: "experience", label: "Experience", apiSection: "experience" },
      { key: "projects",   label: "Projects",   apiSection: "projects" },
      { key: "skills",     label: "Skills",     apiSection: "skills" },
      { key: "education",  label: "Education",  apiSection: "education" },
    ],
  },
  {
    group: "Site",
    items: [
      { key: "contact", label: "Contact & Footer", apiSection: "education" },
    ],
  },
  {
    group: "Settings",
    items: [
      { key: "kaia_config", label: "AI Assistant", apiSection: "kaia_config" },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function getNavItem(key) {
  return ALL_NAV_ITEMS.find((item) => item.key === key) ?? ALL_NAV_ITEMS[0];
}

// ── SVG icons ───────────────────────────────────────────────────────────────

function NavIcon({ itemKey, size = 13 }) {
  const s = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (itemKey) {
    case "conversations": return <svg {...s}><path d="M14 3H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3l3 3 3-3h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>;
    case "hero":          return <svg {...s}><path d="M8 1l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/></svg>;
    case "about":         return <svg {...s}><circle cx="8" cy="5" r="3"/><path d="M1 14c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>;
    case "experience":    return <svg {...s}><rect x="1" y="5" width="14" height="10" rx="1"/><path d="M5 5V4a3 3 0 0 1 6 0v1"/><path d="M1 9h14"/></svg>;
    case "projects":      return <svg {...s}><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>;
    case "skills":        return <svg {...s}><path d="M8 1l1.4 4.2H14L10.3 7.8l1.4 4.2L8 9.5l-3.7 2.5 1.4-4.2L2 5.2h4.6z"/></svg>;
    case "education":     return <svg {...s}><path d="M1 5.5l7-3.5 7 3.5-7 3.5z"/><path d="M15 5.5v4"/><path d="M4 7v5c0 1.7 1.8 3 4 3s4-1.3 4-3V7"/></svg>;
    case "contact":       return <svg {...s}><rect x="1" y="3" width="14" height="10" rx="1"/><path d="M1 5l7 5 7-5"/></svg>;
    case "kaia_config":   return <svg {...s}><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/><circle cx="8" cy="8" r="3"/></svg>;
    default:              return <svg {...s}><circle cx="8" cy="8" r="6"/></svg>;
  }
}

// ── Main component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { theme, toggle } = useTheme();

  // ── Conversations state
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [convFilter, setConvFilter] = useState("active");
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileConvView, setMobileConvView] = useState("list"); // "list" | "detail"

  // ── Dashboard navigation state
  const [activeView, setActiveView] = useState("conversations");
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState(null); // key to navigate to after confirm

  // ── Misc
  const [error, setError] = useState(null);
  const searchDebounceRef = useRef(null);

  const activeNavItem = getNavItem(activeView);
  const isConversationsView = activeView === "conversations";

  // ── Navigation with dirty guard ──────────────────────────────────────────

  function navigateTo(key) {
    if (key === activeView) {
      setSidebarOpen(false);
      return;
    }
    if (isEditorDirty) {
      setPendingNav(key);
      return;
    }
    doNavigate(key);
  }

  function doNavigate(key) {
    setActiveView(key);
    setIsEditorDirty(false);
    setSidebarOpen(false);
    if (key === "conversations") {
      setNewCount(0);
    }
  }

  function confirmPendingNav() {
    if (pendingNav) {
      doNavigate(pendingNav);
      setPendingNav(null);
    }
  }

  function cancelPendingNav() {
    setPendingNav(null);
  }

  // ── Conversation data fetching ───────────────────────────────────────────

  const fetchConversations = useCallback(async (q = "") => {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/conversations${params.size ? `?${params}` : ""}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        setNextCursor(data.nextCursor ?? null);
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  }, []);

  const fetchMoreConversations = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/conversations?${params}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          return [...prev, ...data.conversations.filter((c) => !existingIds.has(c.id))];
        });
        setNextCursor(data.nextCursor ?? null);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, searchQuery]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (!data.error) setAnalytics(data);
    } catch (err) {
      console.error("Fetch analytics error:", err);
    }
  }, []);

  const loadConversation = useCallback(async (convId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const data = await res.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, ...data.conversation } : c))
        );
      }
    } catch (err) {
      console.error("Load conversation error:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchConversations(searchQuery);
    fetchAnalytics();
    const interval = setInterval(() => {
      if (!searchQuery) fetchConversations();
      fetchAnalytics();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fetchAnalytics]);

  useEffect(() => {
    if (selectedId) loadConversation(selectedId);
  }, [selectedId, loadConversation]);

  // Pusher realtime
  useEffect(() => {
    if (status !== "authenticated") return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe("private-dashboard");

    function onNewMessage({ conversationId, message }) {
      if (conversationId === selectedId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const existing = c.messages || [];
          const alreadyFirst = existing[0]?.id === message.id;
          const nextMessages = alreadyFirst ? existing : [message, ...existing.filter((m) => m.id !== message.id)];
          const nextUnread = conversationId === selectedId ? 0 : message?.role === "owner" ? c.unreadCount || 0 : (c.unreadCount || 0) + 1;
          return { ...c, messages: nextMessages, updatedAt: message.timestamp || new Date().toISOString(), unreadCount: nextUnread };
        })
      );
      fetchConversations();
      if (conversationId !== selectedId) setNewCount((n) => n + 1);
    }

    function onModeChanged({ conversationId, mode }) {
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, mode } : c)));
    }

    channel.bind("new_message", onNewMessage);
    channel.bind("mode_changed", onModeChanged);
    return () => {
      channel.unbind("new_message", onNewMessage);
      channel.unbind("mode_changed", onModeChanged);
      pusher.unsubscribe("private-dashboard");
    };
  }, [status, selectedId, fetchConversations]);

  // Mobile back-button for conversation detail
  useEffect(() => {
    if (mobileConvView !== "detail") return;
    function onPopState() { handleBackToList(); }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [mobileConvView]);

  // ── Conversation actions ─────────────────────────────────────────────────

  async function handleTakeover() {
    if (!selectedId) return;
    setIsTakingOver(true);
    try {
      await fetch("/api/takeover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: selectedId, mode: "human" }) });
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, mode: "human" } : c)));
    } finally { setIsTakingOver(false); }
  }

  async function handleHandback() {
    if (!selectedId) return;
    setIsTakingOver(true);
    try {
      await fetch("/api/takeover", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: selectedId, mode: "ai" }) });
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, mode: "ai" } : c)));
    } finally { setIsTakingOver(false); }
  }

  async function handleResolve() {
    if (!selectedId) return;
    try {
      await fetch(`/api/conversations/${selectedId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "resolved" }) });
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, status: "resolved" } : c)));
    } catch (err) { console.error("Resolve error:", err); }
  }

  function handleSelect(conv) {
    setSelectedId(conv.id);
    setNewCount(0);
    setMobileConvView("detail");
    setLoadingMessages(true);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
      window.history.pushState({ dashboardView: "detail", conversationId: conv.id }, "");
    }
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
  }

  function handleBackToList() {
    setMobileConvView("list");
    setSelectedId(null);
    setMessages([]);
    setLoadingMessages(false);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
      window.history.replaceState({ dashboardView: "list" }, "");
    }
  }

  function handleReplySent(message) {
    setMessages((prev) => {
      if (message?._remove && message?.clientTempId) return prev.filter((m) => m.clientTempId !== message.clientTempId);
      if (message?.clientTempId) {
        const idx = prev.findIndex((m) => m.clientTempId === message.clientTempId);
        if (idx !== -1) { const next = [...prev]; next[idx] = { ...message, pending: false }; return next; }
      }
      if (message?.id && prev.find((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const filteredConversations = convFilter === "active" ? conversations.filter((c) => c.status === "active") : conversations;

  // ── Loading / auth guard ─────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-xs text-text-muted animate-pulse">Loading…</p>
      </div>
    );
  }
  if (!session) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* ── Unsaved changes confirmation modal ─────────────────── */}
      {pendingNav && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
            <h3 className="font-display text-base font-medium text-text-primary">Discard unsaved changes?</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              You have unsaved edits in this section. Navigating away will discard them.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={cancelPendingNav} className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/40 transition-colors">
                Stay
              </button>
              <button onClick={confirmPendingNav} className="font-mono text-xs bg-accent text-background px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors">
                Discard & continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-12 bg-surface border-b border-border flex items-center justify-between px-4 gap-3">
        {/* Mobile: hamburger + back */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile back button when in conversation detail */}
          {isConversationsView && mobileConvView === "detail" && selectedId && (
            <button onClick={handleBackToList} className="sm:hidden text-text-muted hover:text-text-primary transition-colors" aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Mobile hamburger for sidebar */}
          {!(isConversationsView && mobileConvView === "detail" && selectedId) && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Toggle sidebar"
            >
              <span className={clsx("block w-4 h-px bg-current transition-all duration-200", sidebarOpen && "rotate-45 translate-y-[5px]")} />
              <span className={clsx("block w-4 h-px bg-current transition-all duration-200", sidebarOpen && "opacity-0")} />
              <span className={clsx("block w-4 h-px bg-current transition-all duration-200", sidebarOpen && "-rotate-45 -translate-y-[5px]")} />
            </button>
          )}

          {/* Title */}
          <span className="font-display text-sm font-medium text-text-primary truncate">
            {isConversationsView && mobileConvView === "detail" && selectedId
              ? (selectedConversation?.visitor?.name ?? "Conversation")
              : <><span className="text-text-primary">Nara</span> <span className="text-accent">Dashboard</span></>
            }
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {lastFetch && (
            <span className="font-mono text-[9px] text-text-muted/40 hidden sm:inline">
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:border-accent/35 hover:text-accent transition-colors"
          >
            {theme === "dark" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="font-mono text-[11px] text-text-muted hover:text-text-primary transition-colors hidden sm:block"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-red-400/8 border-b border-red-400/15">
          <p className="font-mono text-xs text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="flex-shrink-0 text-red-400/60 hover:text-red-400 transition-colors font-mono text-xs">✕</button>
        </div>
      )}

      {/* ── Body: sidebar + main ────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* ── Mobile overlay backdrop ───────────────────────────── */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside
          className={clsx(
            "fixed lg:relative inset-y-0 left-0 z-30 flex flex-col bg-surface border-r border-border",
            "w-56 flex-shrink-0 transition-transform duration-250 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Sidebar scrollable nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {NAV_GROUPS.map(({ group, items }) => (
              <div key={group} className="mb-4">
                <p className="font-mono text-[9px] text-text-muted/50 uppercase tracking-widest px-2 mb-1">
                  {group}
                </p>
                {items.map((item) => {
                  const isActive = activeView === item.key;
                  const unread = item.key === "conversations" ? newCount : 0;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigateTo(item.key)}
                      className={clsx(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors duration-150",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                      )}
                    >
                      <span className="flex-shrink-0 opacity-80">
                        <NavIcon itemKey={item.key} size={13} />
                      </span>
                      <span className="font-mono text-[11px] flex-1 truncate">{item.label}</span>
                      {unread > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-success text-[9px] font-mono font-bold text-background flex items-center justify-center leading-none">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                      {isEditorDirty && isActive && item.key !== "conversations" && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent" title="Unsaved changes" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 border-t border-border p-3">
            <div className="flex items-center gap-2.5 px-1 mb-2">
              <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-[9px] text-accent">{session?.user?.name?.[0]?.toUpperCase() ?? "A"}</span>
              </div>
              <span className="font-mono text-[10px] text-text-muted truncate flex-1">{session?.user?.email ?? "Owner"}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l4-3-4-3M14 8H6"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────── */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">

          {/* ── CONVERSATIONS VIEW ────────────────────────────────── */}
          {isConversationsView && (
            <>
              {/* Conversation list panel */}
              <div
                className={clsx(
                  "flex flex-col border-r border-border bg-surface/30",
                  "w-full sm:w-72 sm:flex-shrink-0",
                  mobileConvView === "detail" ? "hidden sm:flex" : "flex"
                )}
              >
                {/* Analytics strip */}
                {analytics && (
                  <div className="px-4 py-3 border-b border-border">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Visitors",    value: analytics.totalVisitors },
                        { label: "Active",      value: analytics.activeConversations, accent: true },
                        { label: "Resolved/mo", value: analytics.resolvedThisMonth },
                        { label: "Messages/mo", value: analytics.messagesThisMonth },
                      ].map(({ label, value, accent }) => (
                        <div key={label}>
                          <p className="font-mono text-[9px] text-text-muted uppercase tracking-wide">{label}</p>
                          <p className={clsx("font-mono text-sm font-medium", accent ? "text-accent" : "text-text-primary")}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <MessageChart />
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="px-3 py-2.5 border-b border-border flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={(e) => {
                      const q = e.target.value;
                      setSearchQuery(q);
                      clearTimeout(searchDebounceRef.current);
                      if (!q) { setNextCursor(null); fetchConversations(""); return; }
                      searchDebounceRef.current = setTimeout(() => { setNextCursor(null); fetchConversations(q); }, 300);
                    }}
                    className="w-full font-mono text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                {/* Filter */}
                <div className="px-3 py-2 border-b border-border flex-shrink-0 flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] text-text-muted">{filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""}</p>
                  <div className="flex items-center gap-1">
                    {["active", "all"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setConvFilter(f)}
                        className={clsx(
                          "font-mono text-[10px] px-2 py-0.5 rounded-md border transition-colors capitalize",
                          convFilter === f ? "bg-accent/10 text-accent border-accent/25" : "text-text-muted border-border hover:text-text-primary"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <ConversationList conversations={filteredConversations} selectedId={selectedId} onSelect={handleSelect} />

                {nextCursor && !searchQuery && (
                  <div className="flex-shrink-0 px-3 py-2.5 border-t border-border">
                    <button
                      onClick={fetchMoreConversations}
                      disabled={loadingMore}
                      className="w-full font-mono text-[11px] text-text-muted hover:text-text-primary border border-border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </div>

              {/* Conversation detail panel */}
              <div
                className={clsx(
                  "flex-1 min-h-0 flex flex-col",
                  mobileConvView === "list" ? "hidden sm:flex" : "flex"
                )}
              >
                {selectedConversation ? (
                  <>
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                      <ConversationDetail
                        conversation={selectedConversation}
                        messages={messages}
                        onTakeover={handleTakeover}
                        onHandback={handleHandback}
                        onResolve={handleResolve}
                        isTakingOver={isTakingOver}
                        loadingMessages={loadingMessages}
                      />
                    </div>
                    <OwnerReply
                      conversationId={selectedId}
                      disabled={selectedConversation.mode !== "human"}
                      onSent={handleReplySent}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center mb-3 text-text-muted/40">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <p className="font-display text-text-muted/60 text-sm">Select a conversation</p>
                    <p className="font-mono text-[11px] text-text-muted/40 mt-1">Choose from the list on the left</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CONTENT EDITOR VIEW ───────────────────────────────── */}
          {!isConversationsView && activeNavItem.apiSection && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ContentEditor
                key={activeView}
                section={activeView}
                apiSection={activeNavItem.apiSection}
                onDirtyChange={setIsEditorDirty}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
