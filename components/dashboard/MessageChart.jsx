/**
 * components/dashboard/MessageChart.jsx — Pure CSS bar chart: messages per day (last 7 days).
 */

"use client";

import { useState, useEffect } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 80px total height breakdown:
//   12px — count label row (above bar)
//   52px — bar area (proportional to max count)
//   4px  — gap between bar and day label (mt-1)
//   12px — day label row
const BAR_AREA = 52;

export default function MessageChart() {
  const [data, setData] = useState(null); // null = loading

  useEffect(() => {
    fetch("/api/analytics/messages")
      .then((r) => r.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => setData([]));
  }, []);

  // Loading skeleton
  if (data === null) {
    return (
      <div style={{ height: 80 }} className="flex items-end gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm animate-pulse"
              style={{
                height: `${20 + (i % 3) * 16}px`,
                background: "rgb(var(--color-border))",
              }}
            />
            <div
              className="rounded animate-pulse"
              style={{ height: 8, width: "80%", background: "rgb(var(--color-border))" }}
            />
          </div>
        ))}
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ height: 80 }} className="flex items-end gap-1">
      {data.map(({ date, count }) => {
        const barHeight = Math.max(
          Math.round((count / maxCount) * BAR_AREA),
          count > 0 ? 3 : 1
        );
        const dayIndex = new Date(date + "T00:00:00").getDay();
        const label = DAY_LABELS[dayIndex];

        return (
          <div
            key={date}
            className="flex-1 flex flex-col items-center"
            style={{ height: 80 }}
          >
            {/* Count label above bar */}
            <div
              className="font-mono text-[10px]"
              style={{
                color: "rgb(var(--color-accent))",
                lineHeight: "12px",
                height: 12,
              }}
            >
              {count > 0 ? count : ""}
            </div>

            {/* Spacer pushes bar to the bottom of available area */}
            <div style={{ flex: 1 }} />

            {/* Bar */}
            <div
              className="w-full rounded-sm"
              style={{
                height: `${barHeight}px`,
                background:
                  count > 0
                    ? "rgb(var(--color-accent) / 0.7)"
                    : "rgb(var(--color-border))",
              }}
            />

            {/* Day label */}
            <div
              className="font-mono text-[10px] mt-1"
              style={{
                color: "rgb(var(--color-muted))",
                lineHeight: "12px",
                height: 12,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
