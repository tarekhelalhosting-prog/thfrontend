"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, ReceiptText, Wallet } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import InlineBanner from "@/components/ui/InlineBanner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { fetchDashboardUserById, fetchOrders, updateDashboardUser } from "@/lib/api";
import { Order, User } from "@/types";

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const { currentUser } = useAuthSession();
  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const [customerResult, ordersResult] = await Promise.all([
          fetchDashboardUserById(customerId),
          fetchOrders(),
        ]);

        if (!cancelled) {
          setCustomer(customerResult);
          setOrders(ordersResult);
        }
      } catch {
        if (!cancelled) {
          setLoadError("تعذر جلب بيانات العميل.");
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
  }, [customerId]);

  const customerOrders = useMemo(() => orders.filter((order) => order.user_id === customer?.id || order.customerPhone === customer?.phone), [customer?.id, customer?.phone, orders]);

  const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const isSelf = Boolean(customer) && currentUser?.id === customer?.id;

  const handleToggleActive = () => {
    if (!customer) {
      return;
    }

    void (async () => {
      try {
        setIsSavingStatus(true);
        setStatusError("");
        const updated = await updateDashboardUser(customer.id, { is_active: !customer.is_active });
        setCustomer(updated);
      } catch (error) {
        setStatusError(error instanceof Error ? error.message : "تعذر تحديث حالة الحساب");
      } finally {
        setIsSavingStatus(false);
      }
    })();
  };

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
        <EmptyState title="تعذر العثور على العميل" description={loadError || "تحقق من الرابط أو ارجع إلى جدول العملاء."} />
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
          <SectionHeader eyebrow="Account status" title="حالة الحساب" subtitle="تفعيل أو إيقاف الحساب مباشرة." />
          <div className="space-y-4 px-5 py-5">
            {statusError ? <InlineBanner tone="error" message={statusError} /> : null}
            {isSelf ? <InlineBanner tone="warning" message="هذا حسابك الحالي — لا يسمح الخادم بتعديل حالته من هنا." /> : null}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">الدور</p><p className="mt-1 font-bold text-slate-950">{customer.role}</p></div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">الحالة</p>
                <p className={`mt-1 font-bold ${customer.is_active ? "text-emerald-700" : "text-rose-700"}`}>{customer.is_active ? "نشط" : "موقوف"}</p>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isSelf || isSavingStatus}
                className="rounded-2xl border border-slate-200 bg-red-500 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-red-800 disabled:cursor-not-allowed  disabled:opacity-50"
              >
                {customer.is_active ? "إيقاف الحساب" : "تفعيل الحساب"}
              </button>
            </div>
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
