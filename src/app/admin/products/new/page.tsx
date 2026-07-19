"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Panel, SectionHeader } from "@/components/admin/admin-kit";
import { createProduct, fetchCategories } from "@/lib/api";
import { Category, Product } from "@/types";

type VariantDraft = {
  color: string;
  size: string;
  price: string;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [gallery, setGallery] = useState<string[]>([""]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [variants, setVariants] = useState<VariantDraft[]>([{ color: "", size: "", price: "" }]);

  useEffect(() => {
    void (async () => {
      const categoriesResult = await fetchCategories();
      setCategories(categoriesResult);
      setCategoryId(categoriesResult[0]?.id || "");
    })();
  }, []);

  const updateGalleryItem = (index: number, value: string) => {
    setGallery((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const handleSave = () => {
    void (async () => {
      if (!name.trim() || !description.trim() || !categoryId) {
        return;
      }

      try {
        setIsSaving(true);
        const created = await createProduct({
          name: name.trim(),
          description: description.trim(),
          category_id: categoryId,
          category: categoryId,
          price: Number(variants[0]?.price || 0),
          image: gallery[primaryImageIndex] || "",
        } as Omit<Product, "id">);

        console.log("Created product", created, variants);
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <AdminShell
      title="إضافة منتج"
      subtitle="نموذج مستقل للمنتج الجديد مع صور متعددة وفاريانت لا نهائي عبر جدول ديناميكي."
      actions={
        <Link href="/admin/products" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
          العودة إلى المنتجات
        </Link>
      }
    >
      <div className="space-y-6">
        <Panel>
          <SectionHeader eyebrow="Wireframe" title="هيكل الإضافة" subtitle="1) بيانات أساسية 2) صور 3) Variants 4) حفظ المنتج" />
          <div className="grid gap-4 px-5 py-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">البيانات الأساسية</p>
              <p className="mt-2 leading-6">اسم المنتج، التصنيف، والوصف المختصر/التفصيلي.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">الصور</p>
              <p className="mt-2 leading-6">رفع عدة صور وتحديد صورة رئيسية للكتالوج.</p>
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Product" title="بيانات المنتج الأساسية" subtitle="هذا القسم فقط لمدخلات المنتج الأساسية." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              اسم المنتج
              <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="مثال: كرسي حلاقة فاخر" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              التصنيف
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              الوصف
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="وصف تفصيلي للمنتج..." />
            </label>
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Images" title="الصور" subtitle="ارفع عدة صور وحدد صورة رئيسية للمشهد الأول في الكتالوج." />
          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {gallery.map((item, index) => (
                <label key={index} className="grid gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2"><UploadCloud className="h-4 w-4" /> صورة #{index + 1}</span>
                  <input value={item} onChange={(event) => updateGalleryItem(index, event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-amber-400" placeholder="https://..." />
                  <button type="button" onClick={() => setPrimaryImageIndex(index)} className={`rounded-2xl border px-4 py-2 text-xs font-bold ${primaryImageIndex === index ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                    {primaryImageIndex === index ? "الصورة الرئيسية" : "تعيين كصورة رئيسية"}
                  </button>
                </label>
              ))}
            </div>

            <button type="button" onClick={() => setGallery((current) => [...current, ""])} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              <span>إضافة صورة أخرى</span>
            </button>
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Variants" title="جدول الفاريانت الديناميكي" subtitle="أضف عدداً غير محدود من الفاريانت مع اللون، المقاس، والسعر." />
          <div className="overflow-x-auto px-5 py-5">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4">اللون</th>
                  <th className="py-3 pl-4">المقاس</th>
                  <th className="py-3 pl-4">السعر</th>
                  <th className="py-3 pl-4">حذف</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pl-4"><input value={variant.color} onChange={(event) => setVariants((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, color: event.target.value } : item)))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="أسود" /></td>
                    <td className="py-3 pl-4"><input value={variant.size} onChange={(event) => setVariants((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, size: event.target.value } : item)))} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="M" /></td>
                    <td className="py-3 pl-4"><input value={variant.price} onChange={(event) => setVariants((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, price: event.target.value } : item)))} type="number" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="350" /></td>
                    <td className="py-3 pl-4">
                      <button type="button" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-2xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pb-5">
            <button type="button" onClick={() => setVariants((current) => [...current, { color: "", size: "", price: "" }])} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              <span>إضافة Variant</span>
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
              حفظ المنتج
            </button>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
