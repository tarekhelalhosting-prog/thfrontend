"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { translateStatusLabel } from "@/lib/status-labels";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]", className)}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold tracking-[0.32em] text-amber-700/80">{eyebrow}</p> : null}
        <h3 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "accent" | "success" | "danger" }) {
  const toneClass =
    tone === "accent"
      ? "bg-amber-50 border-amber-200"
      : tone === "success"
      ? "bg-emerald-50 border-emerald-200"
      : tone === "danger"
      ? "bg-rose-50 border-rose-200"
      : "bg-white border-slate-200";

  return (
    <div className={clsx("rounded-3xl border p-4 shadow-sm", toneClass)}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black text-slate-950 sm:text-[28px]">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase();
  const className =
    normalized === "paid" || normalized === "completed" || normalized === "confirmed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : normalized === "processing" || normalized === "ready"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : normalized === "pending"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : normalized === "cancelled" || normalized === "failed" || normalized === "refunded"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return <span className={clsx("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold", className)}>{translateStatusLabel(status)}</span>;
}

export function Modal({ open, title, subtitle, onClose, children, footer }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <div className="border-b border-slate-200 px-5 py-5">
          <h4 className="text-lg font-black text-slate-950">{title}</h4>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="max-h-[76vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <p className="text-lg font-black text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function ChartBars({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-gradient-to-l from-amber-400 to-amber-600" style={{ width: `${(item.value / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({ steps }: { steps: { title: string; description: string; active?: boolean }[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={`${step.title}-${index}`} className="flex gap-3">
          <div className={clsx("mt-1 h-3 w-3 rounded-full ring-4", step.active ? "bg-amber-500 ring-amber-100" : "bg-slate-300 ring-slate-100")} />
          <div className="flex-1 pb-4">
            <p className="text-sm font-bold text-slate-950">{step.title}</p>
            <p className="mt-1 text-xs leading-6 text-slate-500">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}