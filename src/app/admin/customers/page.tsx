"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { fetchOrders } from "@/lib/api";
import { Order, User } from "@/types";

function collectCustomers(orders: Order[], storedUsers: User[]) {
  const merged = new Map<string, User>();

  storedUsers.forEach((user) => {
    if (user.phone) {
      merged.set(user.phone, user);
    }
  });

  orders.forEach((order) => {
    const phone = order.customerPhone?.trim();
    if (!phone || merged.has(phone)) {
      return;
    }

    const [first_name = "عميل", ...rest] = (order.customerName || "").split(" ");
    merged.set(phone, {
      id: phone,
      first_name,
      last_name: rest.join(" ") || "",
      phone,
      role: "Customer",
      created_at: order.created_at,
      updated_at: order.updated_at,
      deleted_at: null,
    });
  });

  return Array.from(merged.values());
}

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [storedUsers, setStoredUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const ordersResult = await fetchOrders();
        const localUsers = typeof window === "undefined" ? [] : JSON.parse(window.localStorage.getItem("th_users") || "[]");

        if (!cancelled) {
          setOrders(ordersResult);
          setStoredUsers(Array.isArray(localUsers) ? localUsers : []);
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

  const customers = useMemo(() => collectCustomers(orders, storedUsers), [orders, storedUsers]);
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
      const customerOrders = orders.filter((order) => order.customerPhone === customer.phone || order.user_id === customer.id);
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
      subtitle="جدول مستقل لعملاء المتجر مع إحصاء الطلبات وإجمالي الإنفاق، وتفاصيل الحساب في صفحة منفصلة."
      actions={
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو الهاتف" className="w-44 bg-transparent outline-none" />
        </label>
      }
    >
      <Panel>
        <SectionHeader eyebrow="Customers" title="جدول العملاء" subtitle="الاسم، الهاتف، عدد الطلبات، وإجمالي الإنفاق فقط." />
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
                  <tr key={customer.phone} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="py-4 pl-4">
                      <Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="inline-flex items-center gap-2 font-bold text-slate-950 hover:text-amber-700">
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
                <tr><td colSpan={4} className="py-10"><EmptyState title="لا توجد بيانات عملاء" description="ستظهر الحسابات هنا بعد استقبال الطلبات أو تسجيل الحسابات داخل النظام." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
