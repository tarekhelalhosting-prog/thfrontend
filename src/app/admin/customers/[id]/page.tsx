"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, ReceiptText, Wallet } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { fetchOrders } from "@/lib/api";
import { Order, User } from "@/types";

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [storedUsers, setStoredUsers] = useState<User[]>([]);
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

  const customer = useMemo(() => {
    const localUser = storedUsers.find((user) => user.phone === params.id || user.id === params.id);
    if (localUser) {
      return localUser;
    }

    const matchingOrder = orders.find((order) => order.customerPhone === params.id);
    if (!matchingOrder) {
      return null;
    }

    const [first_name = "عميل", ...rest] = (matchingOrder.customerName || "").split(" ");
    return {
      id: params.id,
      first_name,
      last_name: rest.join(" ") || "",
      phone: params.id,
      role: "Customer" as const,
      created_at: matchingOrder.created_at,
      updated_at: matchingOrder.updated_at,
      deleted_at: null,
    };
  }, [orders, params.id, storedUsers]);

  const customerOrders = useMemo(() => orders.filter((order) => order.customerPhone === params.id || order.user_id === customer?.id), [customer?.id, orders, params.id]);
  const addresses = useMemo(() => {
    const unique = new Map<string, string>();
    customerOrders.forEach((order) => {
      if (order.address) {
        unique.set(order.address, order.city || "");
      }
    });

    return Array.from(unique.entries()).map(([address, city]) => ({ address, city }));
  }, [customerOrders]);

  const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  if (isLoading) {
    return (
      <AdminShell title="تفاصيل العميل" subtitle="...">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">جاري تحميل بيانات العميل...</div>
      </AdminShell>
    );
  }

  if (!customer) {
    return (
      <AdminShell title="تفاصيل العميل" subtitle="العميل غير موجود">
        <EmptyState title="تعذر العثور على العميل" description="تحقق من الرابط أو ارجع إلى جدول العملاء." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`${customer.first_name} ${customer.last_name}`}
      subtitle="بطاقة الحساب، العناوين، الطلبات السابقة، وإجمالي المشتريات في شاشة واحدة."
      actions={
        <Link href="/admin/customers" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel>
          <SectionHeader eyebrow="Account" title="بيانات الحساب" subtitle="معلومات الحساب الأساسية." />
          <div className="space-y-4 px-5 py-5 text-sm text-slate-600">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><Phone className="h-4 w-4 text-amber-600" /><div><p className="text-xs text-slate-500">الهاتف</p><p className="font-bold text-slate-950">{customer.phone}</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><Wallet className="h-4 w-4 text-emerald-600" /><div><p className="text-xs text-slate-500">إجمالي المشتريات</p><p className="font-bold text-slate-950">{formatPrice(totalSpent)}</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><ReceiptText className="h-4 w-4 text-slate-600" /><div><p className="text-xs text-slate-500">عدد الطلبات</p><p className="font-bold text-slate-950">{customerOrders.length}</p></div></div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Addresses" title="العناوين" subtitle="العناوين المستخلصة من الطلبات السابقة." />
          <div className="space-y-3 px-5 py-5">
            {addresses.length > 0 ? addresses.map((address) => (
              <div key={address.address} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-bold text-slate-950">{address.address}</p>
                    <p className="mt-1 text-xs text-slate-500">{address.city || ""}</p>
                  </div>
                </div>
              </div>
            )) : <EmptyState title="لا توجد عناوين" description="سيظهر هنا أي عنوان تم استخدامه في الطلبات السابقة." />}
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Summary" title="ملخص سريع" subtitle="إجمالي الإنفاق مع عدد الطلبات وحالة الحساب." />
          <div className="space-y-4 px-5 py-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">الحساب</p><p className="mt-1 font-bold text-slate-950">{customer.role}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">عدد الطلبات السابقة</p><p className="mt-1 font-bold text-slate-950">{customerOrders.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">إجمالي المشتريات</p><p className="mt-1 font-bold text-slate-950">{formatPrice(totalSpent)}</p></div>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel>
          <SectionHeader eyebrow="Orders" title="الطلبات السابقة" subtitle="كل الطلبات المرتبطة بهذا العميل." />
          <div className="overflow-x-auto px-5 py-5">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4">رقم الطلب</th>
                  <th className="py-3 pl-4">الإجمالي</th>
                  <th className="py-3 pl-4">الحالة</th>
                  <th className="py-3 pl-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.length > 0 ? customerOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pl-4 font-bold text-slate-950"><Link href={`/admin/orders/${order.id}`} className="hover:text-amber-700">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</Link></td>
                    <td className="py-4 pl-4 text-slate-600">{formatPrice(order.total)}</td>
                    <td className="py-4 pl-4"><StatusPill status={order.status} /></td>
                    <td className="py-4 pl-4 text-slate-500">{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(order.created_at))}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="py-10"><EmptyState title="لا توجد طلبات" description="لم يتم العثور على أي طلبات مرتبطة بهذا العميل." /></td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
