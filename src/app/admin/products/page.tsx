"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Image as ImageIcon, Plus, Search, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Modal, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { createProduct, deleteProduct, fetchCategories, fetchProducts, updateProduct } from "@/lib/api";
import { Category, Product } from "@/types";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(value));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category_id: "", price: "", image: "" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const [productsResult, categoriesResult] = await Promise.all([fetchProducts(), fetchCategories()]);
        if (!cancelled) {
          setProducts(productsResult);
          setCategories(categoriesResult);
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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter || product.category === categoryFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, products, query]);

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category_id: product.category_id || product.category || categories[0]?.id || "",
      price: String(product.price || ""),
      image: product.image || "",
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    void (async () => {
      if (!form.name.trim() || !form.description.trim() || !form.category_id || Number(form.price) <= 0) {
        return;
      }

      try {
        setIsSaving(true);
        if (editingProduct) {
          const updated = await updateProduct(editingProduct.id, {
            name: form.name.trim(),
            description: form.description.trim(),
            category_id: form.category_id,
            category: form.category_id,
            price: Number(form.price),
            image: form.image,
          });
          setProducts((current) => current.map((item) => (item.id === editingProduct.id ? updated : item)));
        } else {
          const created = await createProduct({
            name: form.name.trim(),
            description: form.description.trim(),
            category_id: form.category_id,
            category: form.category_id,
            price: Number(form.price),
            image: form.image,
          } as Omit<Product, "id">);
          setProducts((current) => [created, ...current]);
        }
        setModalOpen(false);
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = (productId: string) => {
    void (async () => {
      if (!window.confirm("هل تريد حذف هذا المنتج؟")) {
        return;
      }

      await deleteProduct(productId);
      setProducts((current) => current.filter((item) => item.id !== productId));
    })();
  };

  return (
    <AdminShell
      title="المنتجات"
      subtitle="جدول المنتجات مستقل بالكامل، مع زر إضافة منتج يفتح نموذج الفاريانت المنفصل."
      actions={
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          <span>إضافة منتج</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <Panel>
          <SectionHeader
            eyebrow="Products"
            title="جدول المنتجات"
            subtitle="صورة المنتج، اسمه، التصنيف، وعدد الفاريانت فقط. لا توجد كيانات أخرى داخل الصفحة."
            action={
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن منتج" className="w-36 bg-transparent outline-none" />
              </label>
            }
          />

          <div className="flex flex-wrap gap-2 px-5 pt-5">
            <button type="button" onClick={() => setCategoryFilter("all")} className={`rounded-full border px-4 py-2 text-xs font-bold ${categoryFilter === "all" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              كل التصنيفات
            </button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setCategoryFilter(category.id)} className={`rounded-full border px-4 py-2 text-xs font-bold ${categoryFilter === category.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                {category.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto px-5 py-5">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pl-4">الصورة</th>
                  <th className="py-3 pl-4">اسم المنتج</th>
                  <th className="py-3 pl-4">التصنيف</th>
                  <th className="py-3 pl-4">عدد الفاريانت</th>
                  <th className="py-3 pl-4">تاريخ الإنشاء</th>
                  <th className="py-3 pl-4">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">جاري تحميل المنتجات...</td></tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pl-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-slate-400" />}
                        </div>
                      </td>
                      <td className="py-4 pl-4">
                        <p className="font-bold text-slate-950">{product.name}</p>
                        <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{product.description}</p>
                      </td>
                      <td className="py-4 pl-4 text-slate-600">{categories.find((category) => category.id === product.category_id || category.id === product.category)?.name || "—"}</td>
                      <td className="py-4 pl-4 text-slate-600">{product.variants?.length || 0} variant</td>
                      <td className="py-4 pl-4 text-slate-500">{formatDate(product.created_at)}</td>
                      <td className="py-4 pl-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => openEditModal(product)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button type="button" onClick={() => handleDelete(product.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-10"><EmptyState title="لا توجد منتجات مطابقة" description="جرّب تغيير البحث أو فلتر التصنيف، أو أضف أول منتج من الزر العلوي." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        title={editingProduct ? "تعديل المنتج" : "إضافة منتج"}
        subtitle="هذا نموذج مختصر للتعديل السريع، أما الفاريانت الكاملة فتوجد في صفحة الإضافة المنفصلة."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">حفظ</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            اسم المنتج
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            التصنيف
            <select value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            السعر
            <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} type="number" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            الصورة الرئيسية
            <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            الوصف
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400" />
          </label>
        </div>
      </Modal>
    </AdminShell>
  );
}
