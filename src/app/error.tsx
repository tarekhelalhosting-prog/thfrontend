"use client";

import { useEffect } from "react";
import PageState from "../components/ui/PageState";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageState
      variant="error"
      title="حدث خطأ غير متوقع"
      message="نأسف، حدثت مشكلة أثناء تحميل هذه الصفحة. حاول مرة أخرى أو عد إلى الصفحة الرئيسية."
      fullPage
      action={
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-gold-400 px-6 py-2.5 text-xs font-extrabold text-dark-bg transition-colors hover:bg-gold-500"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="rounded-xl border border-dark-border px-6 py-2.5 text-xs font-extrabold text-gray-300 transition-colors hover:text-white"
          >
            العودة للرئيسية
          </a>
        </div>
      }
    />
  );
}
