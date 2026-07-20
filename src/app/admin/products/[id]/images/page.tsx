"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductImagesPhaseForm from "@/components/admin/ProductImagesPhaseForm";
import { fetchProductById } from "@/lib/api";
import { Product } from "@/types";

export default function ProductImagesPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const productResult = await fetchProductById(productId);
        if (!cancelled) {
          setProduct(productResult);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "تعذر تحميل المنتج.");
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
  }, [productId]);

  return (
    <AdminShell
      title="رفع الصور"
      subtitle="Phase 2 of the wizard. Upload product images now that the product already exists."
      actions={
        <Link href={`/admin/products/${productId}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
          العودة للمنتج
        </Link>
      }
    >
      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">جاري تحميل بيانات المنتج...</div>
      ) : loadError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-10 text-center text-sm font-bold text-rose-700">{loadError}</div>
      ) : product ? (
        <ProductImagesPhaseForm product={product} />
      ) : null}
    </AdminShell>
  );
}
