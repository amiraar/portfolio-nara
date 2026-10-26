/**
 * components/dashboard/LogViewer.jsx
 * Read-only list of recent server errors (AppLog, via /api/logs).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/logs");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { logs: rows } = await res.json();
      setLogs(rows ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface/30">
        <span className="font-mono text-[10px] text-text-muted">
          {failed ? <span className="text-red-400">✗ Gagal memuat log</span> : `${logs.length} error terbaru · disimpan 90 hari`}
        </span>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="font-mono text-[11px] text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-40"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-6">
        {!loading && !failed && logs.length === 0 && (
          <p className="font-mono text-xs text-text-muted text-center py-10">Belum ada error.</p>
        )}
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full text-left px-4 py-3 bg-surface/40 hover:bg-surface/70 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-text-muted flex-shrink-0">
                    {format(new Date(log.at), "dd MMM yyyy HH:mm:ss")}
                  </span>
                  <span className="font-mono text-[10px] text-accent truncate">{log.source}</span>
                </div>
                <p className="text-sm text-text-primary mt-1 break-words">{log.message}</p>
              </button>
              {expandedId === log.id && (
                <pre className="font-mono text-[11px] text-text-muted whitespace-pre-wrap break-words px-4 py-3 border-t border-border">
                  {log.details ? JSON.stringify(log.details, null, 2) : "Tidak ada detail."}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
