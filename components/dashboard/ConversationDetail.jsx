/**
 * components/dashboard/ConversationDetail.jsx
 * Shows full message history for the selected conversation.
 * Includes mode badge and Takeover / Hand back buttons.
 */

"use client";

import { useEffect, useRef, useState, memo } from "react";
import { format } from "date-fns";
import { clsx } from "clsx";

/**
 * @param {{
 *   conversation: any,
 *   messages: Array<any>,
 *   onTakeover: () => void,
 *   onHandback: () => void,
 *   onResolve: () => void,
 *   isTakingOver: boolean,
 *   loadingMessages?: boolean,
 * }} props
 */
export default function ConversationDetail({
  conversation,
  messages,
  onTakeover,
  onHandback,
  onResolve,
  isTakingOver,
  loadingMessages = false,
}) {
  const [showConfirm, setShowConfirm] = useState(null); // "takeover" | "handback" | null

  const isHuman = conversation.mode === "human";
  const isResolved = conversation.status === "resolved";

  function handleAction(action) {
    setShowConfirm(null);
    if (action === "takeover") onTakeover();
    if (action === "handback") onHandback();
    if (action === "resolve") onResolve();
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-surface/80">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-medium text-text-primary truncate">
              {conversation.visitor?.name}
            </h2>
            <p className="text-xs text-text-muted mt-0.5 truncate">{conversation.visitor?.email}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode badge */}
            <span
              className={clsx(
                "font-mono text-[10px] px-2 py-1 rounded border whitespace-nowrap",
                isHuman
                  ? "text-orange-400 border-orange-400/30 bg-orange-400/5"
                  : "text-accent border-accent/30 bg-accent/5"
              )}
            >
              {isHuman ? "You're handling this" : "Kaia Active"}
            </span>

            {/* Action buttons */}
            {!isResolved && (
              <>
                {isHuman ? (
                  <button
                    onClick={() => setShowConfirm("handback")}
                    disabled={isTakingOver}
                    className="text-xs text-accent border border-accent/30 px-3 py-1 rounded-lg hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    {isTakingOver ? <InlineSpinner label="Switching..." /> : "Hand back to Kaia"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm("takeover")}
                    disabled={isTakingOver}
                    className="text-xs text-orange-400 border border-orange-400/30 px-3 py-1 rounded-lg hover:bg-orange-400/5 transition-colors disabled:opacity-50"
                  >
                    {isTakingOver ? <InlineSpinner label="Switching..." /> : "Takeover"}
                  </button>
                )}
                <button
                  onClick={() => setShowConfirm("resolve")}
                  className="text-xs text-text-muted border border-border px-3 py-1 rounded-lg hover:border-text-muted/50 transition-colors"
                >
                  Resolve
                </button>
              </>
            )}
            {isResolved && (
              <span className="font-mono text-[10px] text-text-muted border border-border px-2 py-1 rounded">
                Resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {showConfirm === "takeover"
              ? "Takeover? Kaia will stop responding."
              : showConfirm === "handback"
              ? "Hand back to Kaia? She will resume responding."
              : "Mark this conversation as resolved?"}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleAction(showConfirm)}
              className="text-xs text-accent border border-accent/30 px-2.5 py-1 rounded hover:bg-accent/5"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="text-xs text-text-muted border border-border px-2.5 py-1 rounded hover:border-text-muted/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-3">
        {loadingMessages && messages.length === 0 ? (
          <MessageSkeleton />
        ) : (
          <MemoizedMessageList messages={messages} />
        )}
      </div>
    </div>
  );
}

const MemoizedMessageList = memo(function MemoizedMessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isOwnerMsg = msg.role === "owner";
        const isPending = Boolean(msg.pending);
        return (
          <div
            key={msg.id || msg.clientTempId || `fallback:${index}`}
            className={clsx("flex gap-2", isUser ? "justify-end" : "justify-start")}
          >
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-[10px] font-mono">
                  {isOwnerMsg ? "A" : "K"}
                </span>
              </div>
            )}
            <div className={clsx("flex flex-col gap-0.5 max-w-[70%]", isUser && "items-end")}>
              {!isUser && (
                <span className="text-[10px] text-accent font-mono pl-0.5">
                  {isOwnerMsg ? "You" : "Kaia"}
                </span>
              )}
              <div
                className={clsx(
                  "px-3.5 py-2.5 rounded-xl text-sm leading-relaxed",
                  isUser
                    ? "bg-accent/15 border border-accent/20 text-text-primary rounded-br-sm"
                    : isOwnerMsg
                    ? "bg-surface border border-orange-400/20 text-text-primary rounded-bl-sm"
                    : "bg-surface border border-border text-text-primary rounded-bl-sm",
                  isPending && "opacity-70"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-text-muted px-0.5">
                {isPending
                  ? "Sending..."
                  : msg.timestamp
                  ? format(new Date(msg.timestamp), "HH:mm")
                  : ""}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </>
  );
}, areMessagesEqual);

function areMessagesEqual(prevProps, nextProps) {
  const prevMessages = prevProps.messages || [];
  const nextMessages = nextProps.messages || [];
  if (prevMessages.length !== nextMessages.length) return false;
  const prevLast = prevMessages[prevMessages.length - 1];
  const nextLast = nextMessages[nextMessages.length - 1];
  const prevKey = prevLast?.id || prevLast?.clientTempId;
  const nextKey = nextLast?.id || nextLast?.clientTempId;
  return prevKey === nextKey;
}

function InlineSpinner({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </span>
  );
}

function MessageSkeleton() {
  const bubbles = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-4">
      {bubbles.map((i) => (
        <div
          key={i}
          className={clsx("flex gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}
        >
          {i % 2 === 0 && (
            <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0" />
          )}
          <div className={clsx("flex flex-col gap-2", i % 2 !== 0 && "items-end")}>
            <div
              className={clsx(
                "h-8 rounded-xl bg-surface/70 border border-border/50 animate-pulse",
                i % 2 === 0 ? "w-48" : "w-36"
              )}
            />
            <div className="h-3 w-12 rounded bg-surface/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
