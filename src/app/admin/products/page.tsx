"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Image as ImageIcon, Plus, RotateCcw, Search, Trash2, XCircle } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { deleteProduct, fetchCategories, fetchDeletedProducts, fetchProducts, hardDeleteProduct, restoreProduct } from "@/lib/api";
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
  const [isDeleting, setIsDeleting] = useState<string>("");
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [isDeletedLoading, setIsDeletedLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string>("");
  const [isHardDeleting, setIsHardDeleting] = useState<string>("");

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

  useEffect(() => {
    if (viewMode !== "deleted") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsDeletedLoading(true);
        const result = await fetchDeletedProducts();
        if (!cancelled) {
          setDeletedProducts(result);
        }
      } finally {
        if (!cancelled) {
          setIsDeletedLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sourceProducts = viewMode === "deleted" ? deletedProducts : products;

    return sourceProducts.filter((product) => {
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter || product.category === categoryFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, deletedProducts, products, query, viewMode]);

  const handleDelete = (productId: string) => {
    void (async () => {
      if (!window.confirm("هل تريد حذف هذا المنتج؟")) {
        return;
      }

      try {
        setIsDeleting(productId);
        await deleteProduct(productId);
        setProducts((current) => current.filter((item) => item.id !== productId));
      } finally {
        setIsDeleting("");
      }
    })();
  };

  const handleRestore = (productId: string) => {
    void (async () => {
      try {
        setIsRestoring(productId);
        const restored = await restoreProduct(productId);
        setDeletedProducts((current) => current.filter((item) => item.id !== productId));
        setProducts((current) => [restored, ...current.filter((item) => item.id !== productId)]);
      } finally {
        setIsRestoring("");
      }
    })();
  };

  const handleHardDelete = (productId: string) => {
    void (async () => {
      if (!window.confirm("هذا الإجراء نهائي ولا يمكن التراجع عنه، هل تريد حذف المنتج نهائياً؟")) {
        return;
      }

      try {
        setIsHardDeleting(productId);
        await hardDeleteProduct(productId);
        setDeletedProducts((current) => current.filter((item) => item.id !== productId));
      } finally {
        setIsHardDeleting("");
      }
    })();
  };

  return (
    <AdminShell
      title="المنتجات"
      subtitle="The list is route-driven. Create and edit live on dedicated pages that follow the two-phase model."
      actions={
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-400">
          <Plus className="h-4 w-4" />
          <span>إضافة منتج</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("active")}
            className={`rounded-2xl border px-4 py-2 text-xs font-bold ${viewMode === "active" ? "border-green-300 bg-green-300 text-slate-900" : "border-slate-200 bg-white text-slate-600"}`}
          >
            المنتجات النشطة
          </button>
          <button
            type="button"
            onClick={() => setViewMode("deleted")}
            className={`rounded-2xl border px-4 py-2 text-xs font-bold ${viewMode === "deleted" ? "border-green-300 bg-green-300 text-slate-900" : "border-slate-200 bg-white text-slate-600"}`}
          >
            المحذوفة{deletedProducts.length > 0 ? ` (${deletedProducts.length})` : ""}
          </button>
        </div>

        <Panel>
          <SectionHeader
            eyebrow="Products"
            title={viewMode === "deleted" ? "المنتجات المحذوفة" : "جدول المنتجات"}
            subtitle={viewMode === "deleted" ? "يمكنك استرجاع المنتج أو حذفه نهائياً بشكل غير قابل للتراجع." : "يعرض الصور والاسم والتصنيف وعدد الفاريانت مع رابط تعديل مباشر لكل منتج."}
            action={
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن منتج" className="w-36 bg-transparent outline-none" />
              </label>
            }
          />

          <div className="flex flex-wrap gap-2 px-5 pt-5">
            <button type="button" onClick={() => setCategoryFilter("all")} className={`rounded-full border px-4 py-2 text-xs font-bold ${categoryFilter === "all" ? "border-slate-950 bg-green-300 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              كل التصنيفات
            </button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setCategoryFilter(category.id)} className={`rounded-full border px-4 py-2 text-xs font-bold ${categoryFilter === category.id ? "border-slate-950 bg-green-300 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
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
                {(viewMode === "deleted" ? isDeletedLoading : isLoading) ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      جاري تحميل المنتجات...
                    </td>
                  </tr>
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
                          {viewMode === "deleted" ? (
                            <>
                              <button type="button" onClick={() => handleRestore(product.id)} disabled={isRestoring === product.id} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>{isRestoring === product.id ? "جاري الاسترجاع..." : "استرجاع"}</span>
                              </button>
                              <button type="button" onClick={() => handleHardDelete(product.id)} disabled={isHardDeleting === product.id} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>{isHardDeleting === product.id ? "جاري الحذف..." : "حذف نهائي"}</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <Link href={`/admin/products/${product.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>تعديل</span>
                              </Link>
                              <button type="button" onClick={() => handleDelete(product.id)} disabled={isDeleting === product.id} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{isDeleting === product.id ? "جاري الحذف..." : "حذف"}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10">
                      <EmptyState title={viewMode === "deleted" ? "لا توجد منتجات محذوفة" : "لا توجد منتجات مطابقة"} description={viewMode === "deleted" ? "جميع المنتجات نشطة حالياً." : "جرّب تغيير البحث أو فلتر التصنيف، أو أضف أول منتج من الزر العلوي."} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
