"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { derivePaymentStatus, fetchOrders } from "@/lib/api";
import { Order } from "@/types";

const filters: Array<"All" | "Paid" | "Pending" | "Cancelled" | "Refunded"> = ["All", "Paid", "Pending", "Cancelled", "Refunded"];

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<typeof filters[number]>("All");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const ordersResult = await fetchOrders();
        if (!cancelled) {
          setOrders(ordersResult);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // The backend has no endpoint exposing real per-order Payment records
  // (transaction id, paid_at, provider) to admins - only the order's own
  // owner can call `GET /orders/{id}/payment-status/`. So this page shows
  // only what's genuinely knowable admin-side: the order itself and a
  // payment status derived from `order.status` (see `derivePaymentStatus`).
  const paymentRows = useMemo(() => {
    return orders
      .map((order) => ({
        orderId: order.orderNumber || order.id,
        customerName: order.customerName || "عميل",
        amount: Number(order.total || 0),
        status: derivePaymentStatus(order),
        createdAt: order.created_at,
      }))
      .filter((row) => filter === "All" || row.status === filter);
  }, [filter, orders]);

  return (
    <AdminShell
      title="المدفوعات"
      subtitle="حالة الدفع مستنتجة من حالة الطلب - الباك إند لا يوفر Transaction ID لغير صاحب الطلب."
      actions={<Filter className="h-4 w-4 text-slate-500" />}
    >
      <Panel>
        <SectionHeader eyebrow="Payments" title="فلاتر المدفوعات" />
        <div className="flex flex-wrap gap-2 px-5 py-5">
          {filters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-bold ${filter === item ? "border-slate-950 bg-green-300 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">رقم الطلب</th>
                <th className="py-3 pl-4">العميل</th>
                <th className="py-3 pl-4">المبلغ</th>
                <th className="py-3 pl-4">الحالة</th>
                <th className="py-3 pl-4">تاريخ الطلب</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-500">جاري تحميل المدفوعات...</td></tr>
              ) : paymentRows.length > 0 ? (
                paymentRows.map((row) => (
                  <tr key={row.orderId} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pl-4 font-bold text-slate-950">{row.orderId}</td>
                    <td className="py-4 pl-4 text-slate-600">{row.customerName}</td>
                    <td className="py-4 pl-4 font-semibold text-slate-950">{formatPrice(row.amount)}</td>
                    <td className="py-4 pl-4"><StatusPill status={row.status} /></td>
                    <td className="py-4 pl-4 text-slate-500">{formatDate(row.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-10"><EmptyState title="لا توجد عمليات مطابقة" description="غيّر الفلتر أو انتظر ظهور مدفوعات جديدة من الطلبات المؤكدة." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
