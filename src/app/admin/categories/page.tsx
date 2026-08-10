"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Gift, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryImagePicker, { CloudinaryImageValue } from "@/components/admin/CloudinaryImagePicker";
import { EmptyState, Modal, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { createCategory, deleteCategory, fetchCategories, fetchProducts, sortCategoriesByPriority, updateCategory } from "@/lib/api";
import { isOfferCategory } from "@/lib/offer-category";
import { Category, Product } from "@/types";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(value));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [image, setImage] = useState<CloudinaryImageValue[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const [categoriesResult, productsResult] = await Promise.all([fetchCategories(), fetchProducts()]);

        if (!cancelled) {
          setCategories(categoriesResult);
          setProducts(productsResult);
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

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => counts.set(product.category_id || product.category, (counts.get(product.category_id || product.category) || 0) + 1));
    return counts;
  }, [products]);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPriority("");
    setImage([]);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setPriority(category.priority == null ? "" : String(category.priority));
    const existingUrl = category.image || category.media_url || "";
    setImage(existingUrl ? [{ url: existingUrl, public_id: category.public_id }] : []);
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = () => {
    void (async () => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setFormError("اكتب اسم التصنيف أولاً.");
        return;
      }

      const parsedPriority = priority === "" ? null : Number(priority);
      if (parsedPriority !== null && (!Number.isInteger(parsedPriority) || parsedPriority < 1 || parsedPriority > 1000)) {
        setFormError("الأولوية يجب أن تكون رقماً صحيحاً من 1 إلى 1000، أو اتركها فارغة.");
        return;
      }

      try {
        setIsSaving(true);
        setFormError("");
        const imageUrl = image[0]?.url || "";
        const publicId = image[0]?.public_id;
        const payload = {
          name: trimmedName,
          description: description.trim(),
          priority: parsedPriority,
          image: imageUrl,
          public_id: publicId,
        };
        if (editingId) {
          const updated = await updateCategory(editingId, payload);
          setCategories((current) => sortCategoriesByPriority(current.map((item) => (item.id === editingId ? updated : item))));
        } else {
          const created = await createCategory(payload);
          setCategories((current) => sortCategoriesByPriority([...current, created]));
        }
        setModalOpen(false);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "تعذر حفظ التصنيف، حاول مرة أخرى.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = (categoryId: string) => {
    void (async () => {
      if (!window.confirm("هل تريد حذف هذا التصنيف؟")) {
        return;
      }

      await deleteCategory(categoryId);
      setCategories((current) => current.filter((item) => item.id !== categoryId));
    })();
  };

  return (
    <AdminShell
      title="التصنيفات"
      subtitle="أضف وصفاً واضحاً لكل قسم وحدد أولوية ظهوره؛ الرقم الأصغر يظهر أولاً."
      actions={
        <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-400">
          <Plus className="h-4 w-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
          <span>🎁</span>
          <span>
            لعرض تصنيف كـ &quot;عروض وباقات&quot; مميزة في قسم خاص أعلى الصفحة الرئيسية، يكفي أن يحتوي اسم التصنيف على كلمة
            &quot;عروض&quot; أو &quot;عرض&quot; (مثال: العروض). أي منتج تضيفه داخل هذا التصنيف سيُعامل تلقائياً كعرض/باقة في الواجهة ولوحة التحكم.
          </span>
        </div>

        <Panel>
          <SectionHeader eyebrow="Categories" title="جدول التصنيفات" subtitle="الأقسام مرتبة حسب الأولوية من الرقم الأصغر إلى الأكبر، والأقسام بلا أولوية تظهر في النهاية." />
          <div className="overflow-x-auto px-5 py-5">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4">الصورة</th>
                  <th className="py-3 pl-4">اسم التصنيف</th>
                  <th className="py-3 pl-4">الأولوية</th>
                  <th className="py-3 pl-4">عدد المنتجات</th>
                  <th className="py-3 pl-4">تاريخ الإنشاء</th>
                  <th className="py-3 pl-4">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">جاري تحميل التصنيفات...</td></tr>
                ) : categories.length > 0 ? (
                  categories.map((category) => {
                    const count = productCounts.get(category.id) || productCounts.get(category.name) || 0;
                    const isOffer = isOfferCategory(category);

                    return (
                      <tr key={category.id} className={`border-b border-slate-100 last:border-0 ${isOffer ? "bg-amber-50/40" : ""}`}>
                        <td className="py-4 pl-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            {category.image || category.media_url ? <img src={category.image || category.media_url} alt={category.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-slate-400" />}
                          </div>
                        </td>
                        <td className="py-4 pl-4 font-bold text-slate-950">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{category.name}</span>
                            {isOffer ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
                                <Gift className="h-3 w-3" />
                                عروض وباقات
                              </span>
                            ) : null}
                          </div>
                          {category.description ? (
                            <p className="mt-1.5 max-w-md text-xs font-normal leading-5 text-slate-500">{category.description}</p>
                          ) : null}
                        </td>
                        <td className="py-4 pl-4">
                          {category.priority == null ? (
                            <span className="text-xs text-slate-400">بدون أولوية</span>
                          ) : (
                            <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{category.priority}</span>
                          )}
                        </td>
                        <td className="py-4 pl-4 text-slate-600">{count} منتج</td>
                        <td className="py-4 pl-4 text-slate-500">{formatDate(category.created_at)}</td>
                        <td className="py-4 pl-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => openEditModal(category)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>تعديل</span>
                            </button>
                            <button type="button" onClick={() => handleDelete(category.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={6} className="py-10"><EmptyState title="لا توجد تصنيفات بعد" description="ابدأ بإضافة التصنيف الأول ثم اربطه بالمنتجات من صفحة المنتجات." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
        subtitle="الوصف يظهر للزائر أسفل اسم القسم، والأولوية ترتب الأقسام في المتجر."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-60">حفظ</button>
          </>
        }
      >
        <div className="grid gap-4">
          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{formError}</div>
          ) : null}
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            اسم التصنيف
            <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" placeholder="مثال: كراسي الحلاقة" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            وصف التصنيف
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-amber-400" placeholder="وصف مختصر يساعد الزائر على فهم محتوى القسم" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            أولوية الظهور
            <input type="number" min={1} max={1000} step={1} value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" placeholder="من 1 إلى 1000" />
            <span className="text-xs font-normal leading-5 text-slate-500">الرقم الأصغر يظهر أولاً. يمكن تكرار نفس الرقم لأكثر من قسم، والرقم 1 يظهر أيضاً في الهيدر.</span>
          </label>
          <CloudinaryImagePicker
            title="صورة التصنيف"
            description="ارفع صورة التصنيف مباشرة إلى Cloudinary، ثم نحفظ الرابط والـ public_id في الباك إند."
            value={image}
            onChange={setImage}
            maxImages={1}
          />
        </div>
      </Modal>
    </AdminShell>
  );
}