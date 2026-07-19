"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { fetchOrders } from "@/lib/api";
import { Order } from "@/types";

const statusFilters: Array<"All" | Order["status"]> = ["All", "Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"];

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<typeof statusFilters[number]>("All");
  const [query, setQuery] = useState("");

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

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = filter === "All" || order.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        (order.orderNumber || order.id).toLowerCase().includes(normalizedQuery) ||
        (order.customerName || "").toLowerCase().includes(normalizedQuery) ||
        (order.customerPhone || "").toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query]);

  return (
    <AdminShell
      title="الطلبات"
      subtitle="جدول مستقل مع فلاتر للحالة، وصول سريع لتفاصيل كل Order، وتصميم مناسب للعمليات اليومية."
      actions={
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="رقم الطلب أو العميل" className="w-44 bg-transparent outline-none" />
        </label>
      }
    >
      <div className="space-y-6">
        <Panel>
          <SectionHeader eyebrow="Orders" title="فلاتر الطلبات" subtitle="Pending, Confirmed, Processing, Ready, Completed, Cancelled, Refunded" action={<Filter className="h-4 w-4 text-slate-500" />} />
          <div className="flex flex-wrap gap-2 px-5 py-5">
            {statusFilters.map((status) => (
              <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full border px-4 py-2 text-xs font-bold ${filter === status ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                {status}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Table" title="جدول الطلبات" subtitle="رقم الطلب، العميل، الهاتف، الإجمالي، الحالة، وتاريخ الطلب." />
          <div className="overflow-x-auto px-5 py-5">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4">رقم الطلب</th>
                  <th className="py-3 pl-4">العميل</th>
                  <th className="py-3 pl-4">الهاتف</th>
                  <th className="py-3 pl-4">الإجمالي</th>
                  <th className="py-3 pl-4">الحالة</th>
                  <th className="py-3 pl-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">جاري تحميل الطلبات...</td></tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="py-4 pl-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-slate-950 hover:text-amber-700">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</Link>
                      </td>
                      <td className="py-4 pl-4 text-slate-600">{order.customerName || "عميل"}</td>
                      <td className="py-4 pl-4 text-slate-600">{order.customerPhone || "—"}</td>
                      <td className="py-4 pl-4 font-semibold text-slate-950">{formatPrice(order.total)}</td>
                      <td className="py-4 pl-4"><StatusPill status={order.status} /></td>
                      <td className="py-4 pl-4 text-slate-500">{formatDate(order.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-10"><EmptyState title="لا توجد طلبات مطابقة" description="غيّر الفلاتر أو ابحث برقم الطلب للوصول مباشرةً إلى التفاصيل." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
