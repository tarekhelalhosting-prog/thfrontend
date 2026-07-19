"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { fetchOrders } from "@/lib/api";
import { Order } from "@/types";

const filters: Array<"All" | "Paid" | "Pending" | "Failed" | "Cancelled"> = ["All", "Paid", "Pending", "Failed", "Cancelled"];

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

  const paymentRows = useMemo(() => {
    return orders
      .map((order) => ({
        transactionId: order.payment?.transaction_id || order.orderNumber || order.id,
        orderId: order.orderNumber || order.id,
        amount: Number(order.payment?.amount || order.total || 0),
        status: order.payment?.status || "Pending",
        paidAt: order.payment?.paid_at || null,
      }))
      .filter((row) => filter === "All" || row.status === filter);
  }, [filter, orders]);

  return (
    <AdminShell
      title="المدفوعات"
      subtitle="جدول منفصل للمدفوعات مع فلترة الحالة، وبيانات Paymob Transaction ID لكل عملية."
      actions={<Filter className="h-4 w-4 text-slate-500" />}
    >
      <Panel>
        <SectionHeader eyebrow="Payments" title="فلاتر المدفوعات" subtitle="Paid, Pending, Failed, Cancelled" />
        <div className="flex flex-wrap gap-2 px-5 py-5">
          {filters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-bold ${filter === item ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">رقم العملية</th>
                <th className="py-3 pl-4">رقم الطلب</th>
                <th className="py-3 pl-4">Transaction ID</th>
                <th className="py-3 pl-4">المبلغ</th>
                <th className="py-3 pl-4">الحالة</th>
                <th className="py-3 pl-4">وقت الدفع</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">جاري تحميل المدفوعات...</td></tr>
              ) : paymentRows.length > 0 ? (
                paymentRows.map((row) => (
                  <tr key={`${row.orderId}-${row.transactionId}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pl-4 font-bold text-slate-950">{row.transactionId.slice(0, 12)}</td>
                    <td className="py-4 pl-4 text-slate-600">{row.orderId}</td>
                    <td className="py-4 pl-4 text-slate-600">{row.transactionId}</td>
                    <td className="py-4 pl-4 font-semibold text-slate-950">{formatPrice(row.amount)}</td>
                    <td className="py-4 pl-4"><StatusPill status={row.status} /></td>
                    <td className="py-4 pl-4 text-slate-500">{formatDate(row.paidAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-10"><EmptyState title="لا توجد عمليات مطابقة" description="غيّر الفلتر أو انتظر ظهور مدفوعات جديدة من الطلبات المؤكدة." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
