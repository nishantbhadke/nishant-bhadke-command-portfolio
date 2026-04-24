"use client";

import React from "react";
import { motion } from "framer-motion";

/* ---------- MetricCard ---------- */

export function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-surface/85 p-4">
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <p className="mt-4 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}

/* ---------- SoftFact ---------- */

export function SoftFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-line bg-surface/85 p-4">
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-3 text-sm leading-7 text-ink">{value}</p>
    </div>
  );
}

/* ---------- ContactCard ---------- */

export function ContactCard({
  label,
  value,
  href,
  icon
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="rounded-[1.5rem] border border-line bg-surface/88 p-4 transition hover:border-accent hover:text-accent"
    >
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <p className="mt-4 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-ink">{value}</p>
    </a>
  );
}

/* ---------- Field ---------- */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  id
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  id?: string;
}) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[1.2rem] border border-line bg-surface/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
      />
    </div>
  );
}

/* ---------- AnalysisStat ---------- */

export function AnalysisStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[1.2rem] border border-line bg-card/70 p-4">
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{hint}</p>
    </div>
  );
}

/* ---------- SignalChip ---------- */

export function SignalChip({ label, active }: { label: string; active: boolean }) {
  return (
    <p
      className={`rounded-[1rem] px-3 py-2 ${
        active ? "bg-[#d7efe2] text-[#17603a]" : "bg-surface/80 text-muted"
      }`}
    >
      {label}
    </p>
  );
}

/* ---------- SectionShell ---------- */

export function SectionShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[2rem] border border-line bg-card/92 p-6 shadow-soft sm:p-7"
    >
      <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.26em] text-accent">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl tracking-[-0.04em] sm:text-5xl">{title}</h2>
          <p className="mt-3 text-base leading-8 text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}
