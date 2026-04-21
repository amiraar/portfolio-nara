/**
 * components/dashboard/ConversationList.jsx
 * Shows all conversations sorted by latest message, with visitor name,
 * last message preview, mode badge, and unread indicator.
 */

"use client";

import { format, formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";

/**
 * @param {{
 *   conversations: Array<any>,
 *   selectedId: string | null,
 *   onSelect: (conv: any) => void
 * }} props
 */
export default function ConversationList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="font-display text-text-muted text-sm">No conversations yet</p>
          <p className="text-xs text-text-muted mt-1">Conversations will appear here when visitors chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      {conversations.map((conv) => {
        const lastMsg = conv.messages?.[0] ?? null;
        const isSelected = conv.id === selectedId;
        const isHuman = conv.mode === "human";
        const isResolved = conv.status === "resolved";

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={clsx(
              "w-full text-left px-4 py-3.5 border-b border-border transition-colors",
              isSelected
                ? "bg-accent/8 border-l-2 border-l-accent"
                : "hover:bg-surface/60 border-l-2 border-l-transparent"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">
                  {conv.visitor?.name ?? "Unknown Visitor"}
                </span>
                {isResolved && (
                  <span className="font-mono text-[9px] text-text-muted border border-border px-1 rounded flex-shrink-0">
                    resolved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {conv.unreadCount > 0 && (
                  <span className="font-mono text-[9px] bg-accent text-background px-1.5 py-0.5 rounded-full leading-none">
                    {conv.unreadCount}
                  </span>
                )}
                <span className="font-mono text-[10px] text-text-muted">
                  {conv.updatedAt
                    ? formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })
                    : ""}
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted truncate mb-2">
              {conv.visitor?.email}
            </p>

            {lastMsg && (
              <p className="text-xs text-text-muted truncate italic">
                {lastMsg.role === "user" ? "" : lastMsg.role === "owner" ? "You: " : "Kaia: "}
                {lastMsg.content}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={clsx(
                  "font-mono text-[9px] px-1.5 py-0.5 rounded border",
                  isHuman
                    ? "text-orange-400 border-orange-400/30 bg-orange-400/5"
                    : "text-accent border-accent/30 bg-accent/5"
                )}
              >
                {isHuman ? "● You handling" : "● Kaia active"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
