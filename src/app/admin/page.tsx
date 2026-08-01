"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, ReceiptText, Sparkles, Users } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { ChartBars, EmptyState, MetricCard, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { useAuthSession } from "@/hooks/useAuthSession";
import { fetchOffers, fetchOrders, fetchProducts } from "@/lib/api";
import { extractUsersFromOrders } from "@/lib/customers";
import { Offer, Order, Product } from "@/types";

type DailyPoint = { label: string; value: number };

function formatEGP(value: number) {
  return `${value.toLocaleString("ar-EG")} جنيه`;
}

function buildLast30DaysSeries(orders: Order[]): DailyPoint[] {
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    const dayLabel = new Intl.DateTimeFormat("ar-EG", { day: "2-digit", month: "2-digit" }).format(date);
    return { key, label: dayLabel, value: 0 };
  });

  orders.forEach((order) => {
    const key = order.created_at.slice(0, 10);
    const entry = dates.find((item) => item.key === key);
    if (entry) {
      entry.value += Number(order.total || 0);
    }
  });

  return dates.map(({ label, value }) => ({ label, value }));
}

function buildStatusSeries(orders: Order[]) {
  const statuses: Order["status"][] = ["Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"];
  return statuses.map((status) => ({ label: status, value: orders.filter((order) => order.status === status).length }));
}

function buildTopProducts(products: Product[], orders: Order[]) {
  const salesMap = new Map<string, number>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      salesMap.set(item.product_name, (salesMap.get(item.product_name) || 0) + item.quantity);
    });
  });

  return products
    .map((product) => ({
      label: product.name,
      value: salesMap.get(product.name) || 0,
      fallback: product.price,
    }))
    .sort((left, right) => right.value - left.value || right.fallback - left.fallback)
    .slice(0, 5)
    .map((item) => ({ label: item.label, value: item.value }));
}


// An offer counts as "active" for this metric only if it's both flagged
// `is_active` AND the current date actually falls inside its start/end
// window - matches the same active-window check used for the storefront
// discount badges (`src/lib/product-offers.ts`).
function countActiveOffers(offers: Offer[]): number {
  const now = new Date();

  return offers.filter((offer) => {
    if (!offer.is_active) {
      return false;
    }

    const startsAt = offer.starts_at ? new Date(offer.starts_at) : null;
    const endsAt = offer.ends_at ? new Date(offer.ends_at) : null;

    if (startsAt && !Number.isNaN(startsAt.getTime()) && now < startsAt) {
      return false;
    }

    if (endsAt && !Number.isNaN(endsAt.getTime()) && now > endsAt) {
      return false;
    }

    return true;
  }).length;
}

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, isHydrated } = useAuthSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && (!currentUser || currentUser.role !== "Admin")) {
      router.replace("/");
    }
  }, [currentUser, isHydrated, router]);

  useEffect(() => {
    if (!isHydrated || !currentUser || currentUser.role !== "Admin") {
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const [productsResult, ordersResult, offersResult] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchOffers(),
        ]);

        if (!isCancelled) {
          setProducts(productsResult);
          setOrders(ordersResult);
          setOffers(offersResult);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [currentUser, isHydrated]);

  const customers = useMemo(() => extractUsersFromOrders(orders), [orders]);
  const activeOffers = countActiveOffers(offers);
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const totalSales = orders.filter((order) => order.payment?.status === "Paid").reduce((sum, order) => sum + Number(order.total || 0), 0);

  const dashboardActions = (
    <>
      <button
        type="button"
        onClick={() => router.push("/admin/products/new")}
        className="hidden items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-400 sm:flex"
      >
        <Sparkles className="h-4 w-4" />
        <span>إضافة منتج</span>
      </button>
      <button
        type="button"
        onClick={() => router.push("/admin/orders")}
        className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:flex"
      >
        <ReceiptText className="h-4 w-4" />
        <span>فتح الطلبات</span>
      </button>
    </>
  );

  if (!isHydrated || !currentUser || currentUser.role !== "Admin" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        جاري تجهيز لوحة التحكم... ⏳
      </div>
    );
  }

  const salesSeries = buildLast30DaysSeries(orders);
  const statusSeries = buildStatusSeries(orders);
  const topProducts = buildTopProducts(products, orders);
  const recentOrders = [...orders].sort((left, right) => right.created_at.localeCompare(left.created_at)).slice(0, 6);
  const recentCustomers = [...customers].sort((left, right) => right.created_at.localeCompare(left.created_at)).slice(0, 6);

  return (
    <AdminShell title="Dashboard" subtitle="مؤشرات الأداء، نظرة سريعة على المبيعات، والمهام العاجلة   ." actions={dashboardActions}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard label="إجمالي المبيعات" value={formatEGP(totalSales)} hint="الطلبات المدفوعة فقط" tone="accent" />
          <MetricCard label="عدد الطلبات" value={`${orders.length}`} hint="جميع الحالات" />
          <MetricCard label="عدد العملاء" value={`${customers.length}`} hint="حسابات وطلبات منفذة" />
          <MetricCard label="عدد المنتجات" value={`${products.length}`} hint="الكتالوج الحالي" />
          <MetricCard label="العروض النشطة" value={`${activeOffers}`} hint="خصومات وعروض موجوده " tone="success" />
          <MetricCard label="الطلبات المعلقة" value={`${pendingOrders}`} hint="تحتاج متابعة" tone="danger" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <SectionHeader eyebrow="Sales" title="مبيعات آخر 30 يوم" subtitle="عرض سريع يوضح تراكم الإيرادات اليومية لدعم قرارات المخزون والتشغيل." action={<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">آخر 30 يوم</span>} />
            <div className="px-5 py-5">
              <div className="grid grid-cols-6 gap-3 sm:grid-cols-10 xl:grid-cols-15">
                {salesSeries.map((point) => (
                  <div key={point.label} className="flex min-h-[130px] flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full items-end justify-center">
                      <div className="w-full rounded-t-2xl bg-gradient-to-t from-amber-500 to-amber-300" style={{ height: `${Math.max(6, (point.value / Math.max(...salesSeries.map((item) => item.value), 1)) * 100)}%` }} title={point.value.toString()} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Orders" title="توزيع الطلبات" subtitle="الحالات الأكثر شيوعاً خلال الفترة الحالية." />
            <div className="px-5 py-5"><ChartBars data={statusSeries} /></div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel>
            <SectionHeader eyebrow="Catalog" title="أكثر المنتجات مبيعاً" subtitle="مرتب حسب عدد القطع المباعة من الطلبات المتاحة." />
            <div className="px-5 py-5">{topProducts.length > 0 ? <ChartBars data={topProducts} /> : <EmptyState title="لا توجد بيانات مبيعات" description="لم يتم العثور على عناصر طلبات كافية لتكوين تقرير المنتجات الأكثر مبيعاً." />}</div>
          </Panel>

          <Panel className="xl:col-span-2">
            <SectionHeader eyebrow="Operations" title="آخر الطلبات" subtitle="أحدث التحركات التي تحتاج متابعة سريعة." />
            <div className="overflow-x-auto px-5 py-5">
              <table className="min-w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-3 pl-4">رقم الطلب</th>
                    <th className="py-3 pl-4">العميل</th>
                    <th className="py-3 pl-4">الإجمالي</th>
                    <th className="py-3 pl-4">الحالة</th>
                    <th className="py-3 pl-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 pl-4 font-bold text-slate-950">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-4 pl-4 text-slate-600">{order.customerName || "عميل"}</td>
                        <td className="py-4 pl-4 font-semibold text-slate-950">{formatEGP(order.total)}</td>
                        <td className="py-4 pl-4"><StatusPill status={order.status} /></td>
                        <td className="py-4 pl-4 text-slate-500">{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(order.created_at))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-8"><EmptyState title="لا توجد طلبات بعد" description="ستظهر هنا أحدث الطلبات بمجرد وصول أول Order من المتجر." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">

          <Panel>
            <SectionHeader eyebrow="Health" title="ملخص تشغيلي سريع" />
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm"><CalendarRange className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500">آخر تحديث للبيانات</p>
                    <p className="mt-1 text-xl font-black text-slate-950">مباشر من الـ API</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm"><Users className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500">تجهيز قاعدة العملاء</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{customers.length} ملف متاح</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}