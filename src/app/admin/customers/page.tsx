"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { fetchDashboardUsers, fetchOrders } from "@/lib/api";
import { Order, User } from "@/types";

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const [customersResult, ordersResult] = await Promise.all([
          fetchDashboardUsers({ role: "Customer" }),
          fetchOrders(),
        ]);

        if (!cancelled) {
          setCustomers(customersResult);
          setOrders(ordersResult);
        }
      } catch {
        if (!cancelled) {
          setLoadError("تعذر جلب قائمة العملاء من الخادم.");
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

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(normalizedQuery) ||
        customer.phone.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [customers, query]);

  const customerStats = useMemo(() => {
    return filteredCustomers.map((customer) => {
      const customerOrders = orders.filter((order) => order.user_id === customer.id || order.customerPhone === customer.phone);
      const spent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

      return {
        ...customer,
        ordersCount: customerOrders.length,
        spent,
      };
    });
  }, [filteredCustomers, orders]);

  return (
    <AdminShell
      title="العملاء"
      subtitle="كل الحسابات المسجّلة بدور عميل، مع عدد الطلبات وإجمالي الإنفاق المحسوبين من الطلبات الحقيقية."
      actions={
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو الهاتف" className="w-44 bg-transparent outline-none" />
        </label>
      }
    >
      <Panel>
        <SectionHeader eyebrow="Customers" title="جدول العملاء" subtitle="الاسم، الهاتف، عدد الطلبات، وإجمالي الإنفاق فقط." />
        {loadError ? <p className="px-5 pt-4 text-sm font-bold text-rose-600">{loadError}</p> : null}
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">الاسم</th>
                <th className="py-3 pl-4">الهاتف</th>
                <th className="py-3 pl-4">عدد الطلبات</th>
                <th className="py-3 pl-4">إجمالي الإنفاق</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">جاري تحميل العملاء...</td></tr>
              ) : customerStats.length > 0 ? (
                customerStats.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="py-4 pl-4">
                      <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center gap-2 font-bold text-slate-950 hover:text-amber-700">
                        <UserRound className="h-4 w-4 text-slate-400" />
                        <span>{customer.first_name} {customer.last_name}</span>
                      </Link>
                    </td>
                    <td className="py-4 pl-4 text-slate-600">{customer.phone}</td>
                    <td className="py-4 pl-4 text-slate-600">{customer.ordersCount}</td>
                    <td className="py-4 pl-4 font-semibold text-slate-950">{formatPrice(customer.spent)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-10"><EmptyState title="لا توجد بيانات عملاء" description="سيظهر أي عميل هنا بمجرد تسجيله في المتجر." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
