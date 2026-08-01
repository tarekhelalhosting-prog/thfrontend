"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type PageStateVariant = "loading" | "error" | "success";

interface PageStateProps {
  variant: PageStateVariant;
  title: string;
  message?: string;
  action?: ReactNode;
  /** Centers the card in a full min-h-screen viewport; otherwise fills its parent container. */
  fullPage?: boolean;
  className?: string;
}

const VARIANT_ICON: Record<PageStateVariant, ReactNode> = {
  loading: <Loader2 className="mx-auto animate-spin text-gold-400" size={36} />,
  error: <AlertTriangle className="mx-auto text-red-500" size={36} />,
  success: <CheckCircle2 className="mx-auto text-green-400" size={36} />,
};

// Single shared loading/error/success screen so every storefront page and
// modal shows the same themed card instead of ad-hoc plain text/colors.
export default function PageState({ variant, title, message, action, fullPage = false, className = "" }: PageStateProps) {
  const card = (
    <div className={`${fullPage ? "max-w-md" : "w-full"} space-y-3 rounded-2xl border border-dark-border bg-dark-card p-8 text-center ${className}`}>
      {VARIANT_ICON[variant]}
      <h1 className="text-base font-black text-white sm:text-lg">{title}</h1>
      {message ? <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">{message}</p> : null}
      {action}
    </div>
  );

  if (!fullPage) {
    return card;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
      {card}
    </div>
  );
}
