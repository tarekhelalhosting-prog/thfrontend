"use client";

import { useState } from "react";
import { Globe2, MessageCircleMore, ShieldCheck } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Panel, SectionHeader } from "@/components/admin/admin-kit";

type SettingsTab = "store" | "contact" | "pages";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("store");
  const [store, setStore] = useState({ name: "طارق هلال", currency: "EGP", logo: "/logo.png" });
  const [contact, setContact] = useState({ phone: "201501593962", facebook: "", instagram: "" });
  const [pages, setPages] = useState({ privacy: "", terms: "" });

  return (
    <AdminShell title="الإعدادات" subtitle="بيانات المتجر، وسائل التواصل، والصفحات القانونية في تبويبات واضحة ومنفصلة.">
      <Panel>
        <SectionHeader eyebrow="Settings" title="الإعدادات العامة" subtitle="كل تبويب يركز على مجموعة واحدة فقط." />
        <div className="flex flex-wrap gap-2 px-5 pt-5">
          {[
            { id: "store", label: "بيانات المتجر" },
            { id: "contact", label: "التواصل" },
            { id: "pages", label: "الصفحات" },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id as SettingsTab)} className={`rounded-full border px-4 py-2 text-xs font-bold ${tab === item.id ? "border-slate-950 bg-green-300 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-6 px-5 py-5">
          {tab === "store" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">اسم المتجر<input value={store.name} onChange={(event) => setStore((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">العملة<input value={store.currency} onChange={(event) => setStore((current) => ({ ...current, currency: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">اللوجو<input value={store.logo} onChange={(event) => setStore((current) => ({ ...current, logo: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
            </div>
          ) : null}

          {tab === "contact" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">الهاتف<input value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">فيسبوك<input value={contact.facebook} onChange={(event) => setContact((current) => ({ ...current, facebook: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">انستجرام<input value={contact.instagram} onChange={(event) => setContact((current) => ({ ...current, instagram: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
            </div>
          ) : null}

          {tab === "pages" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-500" /> Privacy Policy</span><textarea value={pages.privacy} onChange={(event) => setPages((current) => ({ ...current, privacy: event.target.value }))} rows={8} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-slate-500" /> Terms & Conditions</span><textarea value={pages.terms} onChange={(event) => setPages((current) => ({ ...current, terms: event.target.value }))} rows={8} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel className="mt-6">
        <SectionHeader eyebrow="Preview" title="مراجع سريعة" subtitle="معاينة تنظيمية للمدخلات الأساسية داخل الإعدادات." />
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><MessageCircleMore className="mb-2 h-4 w-4 text-amber-600" /><p className="font-bold text-slate-950">Store</p><p className="mt-1">بيانات المتجر المركزية</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><MessageCircleMore className="mb-2 h-4 w-4 text-amber-600" /><p className="font-bold text-slate-950">Contact</p><p className="mt-1">قنوات التواصل الاجتماعية</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><MessageCircleMore className="mb-2 h-4 w-4 text-amber-600" /><p className="font-bold text-slate-950">Legal</p><p className="mt-1">صفحات الخصوصية والشروط</p></div>
        </div>
      </Panel>
    </AdminShell>
  );
}