"use client";

import { Field, inputCls } from "./primitives";

export default function EducationEditor({ data, onChange }) {
  function set(k, v) {
    onChange({ ...data, [k]: v });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-xs text-text-muted leading-relaxed">
        Edit your education background. This appears in the Education section of the portfolio.
      </p>

      <Field label="University / Institution">
        <input
          className={inputCls}
          value={data.university ?? ""}
          onChange={(e) => set("university", e.target.value)}
          placeholder="Ahmad Dahlan University"
        />
      </Field>

      <Field label="Degree / Major">
        <input
          className={inputCls}
          value={data.degree ?? ""}
          onChange={(e) => set("degree", e.target.value)}
          placeholder="Informatics · S.Kom"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="GPA">
          <input
            className={inputCls}
            value={data.gpa ?? ""}
            onChange={(e) => set("gpa", e.target.value)}
            placeholder="3.82 / 4.00"
          />
        </Field>
        <Field label="Period">
          <input
            className={inputCls}
            value={data.period ?? ""}
            onChange={(e) => set("period", e.target.value)}
            placeholder="2020 – 2024"
          />
        </Field>
        <Field label="Location">
          <input
            className={inputCls}
            value={data.location ?? ""}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Yogyakarta, Indonesia"
          />
        </Field>
      </div>
    </div>
  );
}
