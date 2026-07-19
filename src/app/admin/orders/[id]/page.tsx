"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader, StatusPill, Timeline } from "@/components/admin/admin-kit";
import { fetchOrders } from "@/lib/api";
import { Order } from "@/types";

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const order = useMemo(() => orders.find((item) => item.id === params.id), [orders, params.id]);

  if (isLoading) {
    return (
      <AdminShell title="تفاصيل الطلب" subtitle="...">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">جاري تحميل تفاصيل الطلب...</div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell title="تفاصيل الطلب" subtitle="الطلب غير موجود">
        <EmptyState title="تعذر العثور على الطلب" description="تحقق من الرابط أو ارجع إلى جدول الطلبات." />
      </AdminShell>
    );
  }

  const timeline = [
    { title: "تم إنشاء الطلب", description: formatDate(order.created_at), active: true },
    { title: "تم تأكيد الطلب", description: "المراجعة الداخلية أوتوماتيكياً أو عبر فريق المبيعات." , active: order.status !== "Pending" },
    { title: "قيد التجهيز", description: "مرحلة إعداد المنتجات والفاريانت المختارة.", active: order.status === "Processing" || order.status === "Ready" || order.status === "Completed" },
    { title: "مكتمل", description: "تم التسليم أو إنهاء الطلب بنجاح.", active: order.status === "Completed" },
  ];

  return (
    <AdminShell
      title={`الطلب ${order.orderNumber || order.id.slice(0, 8).toUpperCase()}`}
      subtitle="صفحة التفاصيل تعرض العميل، العنوان، العناصر، الفاريانت، الدفع، وخط الزمن الكامل."
      actions={
        <Link href="/admin/orders" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel>
            <SectionHeader eyebrow="Customer" title="بيانات العميل" subtitle="كل ما يتعلق بالعميل والعنوان في بطاقة واحدة." />
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">الاسم</p>
                <p className="mt-1 font-bold text-slate-950">{order.customerName || "عميل"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">الهاتف</p>
                <p className="mt-1 font-bold text-slate-950">{order.customerPhone || "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">العنوان</p>
                <p className="mt-1 font-bold text-slate-950">{order.address || "العنوان التفصيلي غير متوفر"}</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Items" title="المنتجات المطلوبة" subtitle="العناصر، الفاريانت المختار، الكمية، والسعر لكل سطر." />
            <div className="overflow-x-auto px-5 py-5">
              <table className="min-w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-3 pl-4">المنتج</th>
                    <th className="py-3 pl-4">الفاريانت</th>
                    <th className="py-3 pl-4">الكمية</th>
                    <th className="py-3 pl-4">السعر</th>
                    <th className="py-3 pl-4">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 pl-4 font-bold text-slate-950">{item.product_name}</td>
                        <td className="py-4 pl-4 text-slate-600">{item.variant_description || "Default"}</td>
                        <td className="py-4 pl-4 text-slate-600">{item.quantity}</td>
                        <td className="py-4 pl-4 text-slate-600">{formatPrice(item.price)}</td>
                        <td className="py-4 pl-4 font-semibold text-slate-950">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-10"><EmptyState title="لا توجد عناصر مفصلة" description="الطلب الحالي لا يحتوي على items مفصلة في الاستجابة، لكن الهيكل جاهز لعرضها." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <SectionHeader eyebrow="Summary" title="ملخص مالي" subtitle="المبلغ النهائي والحالة الحالية." />
            <div className="space-y-3 px-5 py-5">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">الإجمالي</span>
                <span className="font-bold text-slate-950">{formatPrice(order.total)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">الحالة</span>
                <StatusPill status={order.status} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">تاريخ الطلب</span>
                <span className="font-bold text-slate-950">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Payment" title="بيانات الدفع" subtitle="Paymob Transaction ID والحالة الحالية." />
            <div className="space-y-4 px-5 py-5 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-500">Transaction ID</p>
                  <p className="font-bold text-slate-950">{order.payment?.transaction_id || order.orderNumber || order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500">الحالة</p>
                  <p className="font-bold text-slate-950">{order.payment?.status || "Pending"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Clock3 className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">وقت الدفع</p>
                  <p className="font-bold text-slate-950">{order.payment?.paid_at || "غير متاح"}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Timeline" title="مراحل الطلب" subtitle="مسار زمني واضح لكل حالة." />
            <div className="px-5 py-5">
              <Timeline steps={timeline} />
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
