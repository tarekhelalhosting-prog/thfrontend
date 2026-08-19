"use client";

import { CheckCircle2 } from "lucide-react";

interface AddToCartToastProps {
  visible: boolean;
  message?: string;
}

// Small auto-dismissing confirmation popup shown after adding a product to
// the cart, replacing the old behavior of force-opening the cart drawer.
export default function AddToCartToast({ visible, message = "تمت إضافة المنتج إلى السلة" }: AddToCartToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-dark-card px-4 py-2.5 text-xs font-bold text-green-500 shadow-2xl">
        <CheckCircle2 size={16} className="shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
