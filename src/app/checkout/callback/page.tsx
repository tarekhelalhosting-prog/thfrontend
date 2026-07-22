"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { fetchPaymentStatus } from "../../../lib/api";
import { Order } from "../../../types";

// Paymob's hosted checkout redirects the browser back to this page after
// payment and echoes the `merchant_order_id` we generated at intention
// creation time (`order-{orderId}-{hex8}` - see CreatePaymentIntentionView).
// The order id is parsed back out of it purely to know which order to poll;
// the actual payment/order status is always re-fetched from our own
// authenticated backend endpoint rather than trusted from query params,
// since redirect query params are attacker-controllable.
const MERCHANT_ORDER_ID_PATTERN = /^order-(\d+)-/;

function extractOrderId(searchParams: URLSearchParams): string | null {
  const merchantOrderId = searchParams.get("merchant_order_id");
  if (!merchantOrderId) {
    return null;
  }

  const match = MERCHANT_ORDER_ID_PATTERN.exec(merchantOrderId);
  return match ? match[1] : null;
}

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

type CallbackStatus = "loading" | "paid" | "pending" | "failed" | "error";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const orderId = useMemo(() => extractOrderId(searchParams), [searchParams]);
  const [status, setStatus] = useState<CallbackStatus>(orderId ? "loading" : "error");
  const [orderStatus, setOrderStatus] = useState<Order["status"] | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    orderId ? "" : "تعذر التعرف على الطلب المرتبط بعملية الدفع هذه."
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      attempt += 1;

      try {
        const result = await fetchPaymentStatus(orderId);
        if (cancelled) {
          return;
        }

        setOrderStatus(result.orderStatus);

        if (result.paymentStatus === "Paid") {
          setStatus("paid");
          return;
        }

        if (result.paymentStatus === "Failed" || result.paymentStatus === "Cancelled") {
          setStatus("failed");
          return;
        }

        if (attempt >= MAX_POLL_ATTEMPTS) {
          setStatus("pending");
          return;
        }

        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "تعذر التحقق من حالة الدفع.");
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [orderId]);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-dark-card border border-dark-border rounded-2xl p-8 space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto animate-spin text-gold-400" size={40} />
            <h1 className="text-lg font-black text-white">جاري التحقق من حالة الدفع...</h1>
            <p className="text-xs text-gray-400">الرجاء الانتظار قليلاً، لا تغلق هذه الصفحة.</p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle2 className="mx-auto text-green-400" size={40} />
            <h1 className="text-lg font-black text-white">تم الدفع بنجاح!</h1>
            <p className="text-xs text-gray-400">تم تأكيد طلبك وسيتم التواصل معك لتأكيد الشحن.</p>
          </>
        )}

        {status === "pending" && (
          <>
            <Loader2 className="mx-auto text-gold-400" size={40} />
            <h1 className="text-lg font-black text-white">جاري تأكيد الدفع</h1>
            <p className="text-xs text-gray-400">
              لم نتلق تأكيداً نهائياً بعد، سيتم تحديث حالة الطلب تلقائياً خلال لحظات. يمكنك متابعة الحالة من صفحة الملف الشخصي.
            </p>
          </>
        )}

        {(status === "failed" || status === "error") && (
          <>
            <XCircle className="mx-auto text-red-400" size={40} />
            <h1 className="text-lg font-black text-white">لم تكتمل عملية الدفع</h1>
            <p className="text-xs text-gray-400">
              {errorMessage || "لم يتم تأكيد الدفع، يمكنك المحاولة مرة أخرى من صفحة الملف الشخصي."}
            </p>
          </>
        )}

        {orderStatus && (
          <p className="text-[10px] text-gray-500">
            حالة الطلب الحالية: <span className="text-gray-300 font-bold">{orderStatus}</span>
          </p>
        )}

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-dark-bg font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors"
        >
          الذهاب لصفحة طلباتي
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg" />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
