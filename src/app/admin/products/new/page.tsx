"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductManagementForm from "@/components/admin/ProductManagementForm";
import { fetchCategories } from "@/lib/api";
import { Category } from "@/types";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    void (async () => {
      const categoriesResult = await fetchCategories();
      setCategories(categoriesResult);
    })();
  }, []);

  return (
    <AdminShell
      title="إضافة منتج"
      subtitle="اضف صفات المنتج اولا ثم قم باضافه الصور"
      actions={
        <Link href="/admin/products" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
          العودة إلى المنتجات
        </Link>
      }
    >
      <ProductManagementForm mode="create" categories={categories} defaultCategoryId={categories[0]?.id} />
    </AdminShell>
  );
}
