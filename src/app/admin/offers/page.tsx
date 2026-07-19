"use client";

import { useState } from "react";
import { BadgePercent, Plus } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Modal, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { Offer } from "@/types";

const seedOffers: Offer[] = [
  { id: "1", name: "Summer Boost", type: "Percentage", value: 15, starts_at: "2026-07-01", ends_at: "2026-07-31", is_active: true },
  { id: "2", name: "Bundle Basics", type: "Bundle", value: 0, starts_at: "2026-07-10", ends_at: "2026-08-10", is_active: true },
  { id: "3", name: "Starter Discount", type: "Fixed", value: 300, starts_at: "2026-06-01", ends_at: "2026-06-30", is_active: false },
];

export default function OffersPage() {
  const [offers, setOffers] = useState(seedOffers);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Percentage" as Offer["type"], value: "", starts_at: "", ends_at: "" });

  const handleSave = () => {
    setOffers((current) => [
      { id: crypto.randomUUID(), name: form.name, type: form.type, value: Number(form.value), starts_at: form.starts_at, ends_at: form.ends_at, is_active: true },
      ...current,
    ]);
    setModalOpen(false);
  };

  return (
    <AdminShell
      title="العروض"
      subtitle="جدول منفصل لأنواع العروض المدعومة: Percentage, Fixed, Bundle, Buy X Get Y."
      actions={
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-400">
          <Plus className="h-4 w-4" />
          <span>إضافة عرض</span>
        </button>
      }
    >
      <Panel>
        <SectionHeader eyebrow="Offers" title="جدول العروض" subtitle="اسم العرض، النوع، القيمة، البداية، النهاية، والحالة فقط." action={<BadgePercent className="h-4 w-4 text-slate-500" />} />
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">اسم العرض</th>
                <th className="py-3 pl-4">نوع العرض</th>
                <th className="py-3 pl-4">القيمة</th>
                <th className="py-3 pl-4">البداية</th>
                <th className="py-3 pl-4">النهاية</th>
                <th className="py-3 pl-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 pl-4 font-bold text-slate-950">{offer.name}</td>
                  <td className="py-4 pl-4 text-slate-600">{offer.type}</td>
                  <td className="py-4 pl-4 text-slate-600">{offer.type === "Percentage" ? `${offer.value}%` : `${offer.value.toLocaleString("ar-EG")} جنيه`}</td>
                  <td className="py-4 pl-4 text-slate-600">{offer.starts_at}</td>
                  <td className="py-4 pl-4 text-slate-600">{offer.ends_at}</td>
                  <td className="py-4 pl-4"><StatusPill status={offer.is_active ? "Completed" : "Cancelled"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        title="إضافة عرض"
        subtitle="نموذج خفيف وسريع لإنشاء Offer جديد."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">إلغاء</button>
            <button type="button" onClick={handleSave} className="rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white">حفظ</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">اسم العرض<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">نوع العرض<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as Offer["type"] }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"><option value="Percentage">Percentage</option><option value="Fixed">Fixed</option><option value="Bundle">Bundle</option><option value="BuyXGetY">Buy X Get Y</option></select></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">القيمة<input value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} type="number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">البداية<input value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} type="date" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">النهاية<input value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} type="date" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
        </div>
      </Modal>
    </AdminShell>
  );
}
