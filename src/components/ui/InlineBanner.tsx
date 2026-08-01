"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

type BannerTone = "error" | "success" | "warning";

const TONE_STYLES: Record<BannerTone, string> = {
  error: "border-red-500/40 bg-red-500/10 text-red-500",
  success: "border-green-500/40 bg-green-500/10 text-green-500",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-500",
};

const TONE_ICON: Record<BannerTone, ReactNode> = {
  error: <AlertTriangle size={15} className="shrink-0" />,
  success: <CheckCircle2 size={15} className="shrink-0" />,
  warning: <Info size={15} className="shrink-0" />,
};

interface InlineBannerProps {
  tone?: BannerTone;
  message: string;
  className?: string;
}

// Single shared inline notice used for form/section-level errors and success
// messages, so the same message never renders in a different color/shape
// depending on which page or modal happens to show it.
export default function InlineBanner({ tone = "error", message, className = "" }: InlineBannerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-xs font-bold ${TONE_STYLES[tone]} ${className}`}>
      {TONE_ICON[tone]}
      <span>{message}</span>
    </div>
  );
}
