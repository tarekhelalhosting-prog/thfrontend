"use client";

import { useEffect, useState } from "react";
import { Globe2, Loader2, MessageCircleMore, ShieldCheck } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryImagePicker, { CloudinaryImageValue } from "@/components/admin/CloudinaryImagePicker";
import { Panel, SectionHeader } from "@/components/admin/admin-kit";
import { fetchSettings, updateSettings } from "@/lib/api";
import { Setting } from "@/types";

type SettingsTab = "store" | "contact" | "pages";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("store");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [currency, setCurrency] = useState("");
  const [logo, setLogo] = useState<CloudinaryImageValue[]>([]);
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [terms, setTerms] = useState("");

  const applySettings = (settings: Setting) => {
    setSiteName(settings.site_name || "");
    setCurrency(settings.currency || "");
    setLogo(settings.logo ? [{ url: settings.logo, public_id: settings.public_id || undefined }] : []);
    setPhone(settings.phone || "");
    setFacebook(settings.facebook || "");
    setInstagram(settings.instagram || "");
    setPrivacyPolicy(settings.privacy_policy || "");
    setTerms(settings.terms || "");
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const settings = await fetchSettings();
        if (!cancelled) {
          applySettings(settings);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الإعدادات");
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

  const handleSave = () => {
    void (async () => {
      try {
        setIsSaving(true);
        setSaveError("");
        setSaveSuccess(false);

        const updated = await updateSettings({
          site_name: siteName.trim(),
          currency: currency.trim(),
          logo: logo[0]?.url || "",
          public_id: logo[0]?.public_id || "",
          phone: phone.trim(),
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          privacy_policy: privacyPolicy,
          terms,
        });

        applySettings(updated);
        setSaveSuccess(true);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "فشل حفظ الإعدادات");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <AdminShell title="الإعدادات" subtitle="بيانات المتجر، وسائل التواصل، والصفحات القانونية في تبويبات واضحة ومنفصلة.">
      <Panel>
        <SectionHeader
          eyebrow="Settings"
          title="الإعدادات العامة"
          subtitle="كل تبويب يركز على مجموعة واحدة فقط."
          action={
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}</span>
            </button>
          }
        />

        {loadError ? (
          <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loadError}</div>
        ) : null}
        {saveError ? (
          <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{saveError}</div>
        ) : null}
        {saveSuccess ? (
          <div className="mx-5 mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">تم حفظ الإعدادات بنجاح.</div>
        ) : null}

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

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جارٍ تحميل الإعدادات...</span>
          </div>
        ) : (
          <div className="space-y-6 px-5 py-5">
            {tab === "store" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
                  اسم المتجر
                  <input value={siteName} onChange={(event) => setSiteName(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  العملة
                  <input value={currency} onChange={(event) => setCurrency(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <div className="sm:col-span-2">
                  <CloudinaryImagePicker title="اللوجو" description="صورة اللوجو الظاهرة في الهيدر والفوتر." value={logo} onChange={setLogo} maxImages={1} />
                </div>
              </div>
            ) : null}

            {tab === "contact" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
                  الهاتف
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  فيسبوك
                  <input value={facebook} onChange={(event) => setFacebook(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  انستجرام
                  <input value={instagram} onChange={(event) => setInstagram(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
              </div>
            ) : null}

            {tab === "pages" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-500" /> Privacy Policy
                  </span>
                  <textarea value={privacyPolicy} onChange={(event) => setPrivacyPolicy(event.target.value)} rows={8} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-slate-500" /> Terms & Conditions
                  </span>
                  <textarea value={terms} onChange={(event) => setTerms(event.target.value)} rows={8} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
              </div>
            ) : null}
          </div>
        )}
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
