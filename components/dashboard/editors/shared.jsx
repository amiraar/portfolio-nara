/**
 * components/dashboard/editors/shared.jsx
 * Shared UI primitives and the PeriodInput component used by section editors.
 */

"use client";

import { useState } from "react";

// ─── Style constants ──────────────────────────────────────────────────────

export const inputCls =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors";

export const textareaCls =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none";

// ─── Shared UI components ─────────────────────────────────────────────────

export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[11px] text-text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  function remove(t) { onChange(tags.filter((x) => x !== t)); }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 text-xs font-mono px-2 py-0.5 rounded-md">
            {t}
            <button type="button" onClick={() => remove(t)} className="ml-0.5 text-accent/60 hover:text-red-400 transition-colors leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className={`${inputCls} flex-1`} placeholder="Tambah tag, Enter untuk simpan" />
        <button type="button" onClick={add}
          className="font-mono text-xs px-3 py-1.5 border border-border text-text-muted rounded-lg hover:border-accent/40 hover:text-accent transition-colors">
          + Add
        </button>
      </div>
    </div>
  );
}

export function BtnDanger({ onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className="font-mono text-[11px] text-red-400/70 border border-red-400/20 px-2.5 py-1 rounded-lg hover:bg-red-400/10 hover:border-red-400/40 transition-colors">
      {children}
    </button>
  );
}

export function BtnSecondary({ onClick, children, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="font-mono text-xs text-text-muted border border-border px-2.5 py-1 rounded-lg hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-30">
      {children}
    </button>
  );
}

export function Divider() {
  return <div className="border-t border-border my-2" />;
}

// ─── Period date-picker ───────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SUPPORTS_MONTH_INPUT = (() => {
  if (typeof document === "undefined") return true;
  const input = document.createElement("input");
  input.setAttribute("type", "month");
  return input.type === "month";
})();

function monthYearToInput(str) {
  if (!str || str === "Present") return "";
  const [mon, yr] = str.trim().split(" ");
  const idx = MONTH_NAMES.indexOf(mon);
  if (idx === -1 || !yr) return "";
  return `${yr}-${String(idx + 1).padStart(2, "0")}`;
}

function inputToMonthYear(val) {
  if (!val) return "";
  const [yr, mo] = val.split("-");
  return `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${yr}`;
}

function parsePeriod(period) {
  if (!period) return { start: "", end: "" };
  const parts = period.split("–").map((s) => s.trim());
  return {
    start: monthYearToInput(parts[0]),
    end: parts[1] === "Present" ? "" : monthYearToInput(parts[1]),
  };
}

function buildPeriod(start, end, isCurrent) {
  const startStr = inputToMonthYear(start);
  if (!startStr) return "";
  const endStr = isCurrent ? "Present" : inputToMonthYear(end);
  return endStr ? `${startStr} – ${endStr}` : startStr;
}

function getYearOptions() {
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let y = thisYear + 5; y >= thisYear - 20; y -= 1) years.push(String(y));
  return years;
}

function splitMonthInput(value) {
  if (!value || !value.includes("-")) return { month: "", year: "" };
  const [year, month] = value.split("-");
  return { month, year };
}

function composeMonthInput(month, year) {
  if (!month || !year) return "";
  return `${year}-${month}`;
}

export function PeriodInput({ value, onChange, current, onCurrentChange }) {
  const { start, end } = parsePeriod(value);
  const [supportsMonthInput] = useState(SUPPORTS_MONTH_INPUT);
  const years = getYearOptions();

  const startParts = splitMonthInput(start);
  const endParts = splitMonthInput(end);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Start</label>
          {supportsMonthInput ? (
            <input type="month" value={start}
              onChange={(e) => onChange(buildPeriod(e.target.value, end, current))}
              className={inputCls + " [color-scheme:dark]"} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <select value={startParts.month}
                onChange={(e) => onChange(buildPeriod(composeMonthInput(e.target.value, startParts.year), end, current))}
                className={inputCls + " cursor-pointer"}>
                <option value="">Month</option>
                {MONTH_NAMES.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
              </select>
              <select value={startParts.year}
                onChange={(e) => onChange(buildPeriod(composeMonthInput(startParts.month, e.target.value), end, current))}
                className={inputCls + " cursor-pointer"}>
                <option value="">Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-text-muted uppercase tracking-wider">End</label>
          {supportsMonthInput ? (
            <input type="month" value={end} disabled={current}
              onChange={(e) => onChange(buildPeriod(start, e.target.value, current))}
              className={inputCls + " [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <select value={endParts.month} disabled={current}
                onChange={(e) => onChange(buildPeriod(start, composeMonthInput(e.target.value, endParts.year), current))}
                className={inputCls + " cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"}>
                <option value="">Month</option>
                {MONTH_NAMES.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
              </select>
              <select value={endParts.year} disabled={current}
                onChange={(e) => onChange(buildPeriod(start, composeMonthInput(endParts.month, e.target.value), current))}
                className={inputCls + " cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"}>
                <option value="">Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={!!current}
          onChange={(e) => { onCurrentChange(e.target.checked); onChange(buildPeriod(start, end, e.target.checked)); }}
          className="accent-[#C9A96E] w-4 h-4" />
        <span className="text-sm text-text-muted">Pekerjaan saat ini (Current)</span>
      </label>
    </div>
  );
}
