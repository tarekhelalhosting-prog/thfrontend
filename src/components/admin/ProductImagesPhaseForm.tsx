"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Pencil, Plus, X } from "lucide-react";
import CloudinaryImagePicker from "@/components/admin/CloudinaryImagePicker";
import { createProductImage, deleteProductImage, fetchCategories, updateProduct, updateProductImage } from "@/lib/api";
import { Category, Product, ProductImage } from "@/types";
import { Panel, SectionHeader, Timeline } from "@/components/admin/admin-kit";

type ProductImagesPhaseFormProps = {
  product: Product;
};

type VariantImageDraft = {
  id: string;
  image: string;
};

export default function ProductImagesPhaseForm({ product }: ProductImagesPhaseFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  // Snapshot of the images the product already had when this form loaded,
  // used on save to diff against the current gallery instead of blindly
  // re-creating every image (which would duplicate ProductImage rows).
  const [initialImages] = useState<ProductImage[]>(() =>
    [...(product.images || [])].sort((left, right) => (left.sort_order || 0) - (right.sort_order || 0))
  );
  const [productImages, setProductImages] = useState<string[]>(() =>
    initialImages.length > 0 ? initialImages.map((image) => image.media_url) : product.image ? [product.image] : []
  );
  const [primaryImageIndex, setPrimaryImageIndex] = useState(() => {
    const primaryIndex = initialImages.findIndex((image) => image.is_primary);
    return primaryIndex >= 0 ? primaryIndex : 0;
  });
  const [variantImages, setVariantImages] = useState<Record<string, VariantImageDraft>>(() => {
    const initialState: Record<string, VariantImageDraft> = {};

    for (const variant of product.variants || []) {
      initialState[String(variant.id)] = {
        id: String(variant.id),
        image: variant.media_url || "",
      };
    }

    return initialState;
  });
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving" | "done">("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const categoriesResult = await fetchCategories();
      if (!cancelled) {
        setCategories(categoriesResult);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryName = useMemo(() => {
    const categoryId = product.category_id || product.category;
    return categories.find((category) => category.id === categoryId)?.name || "—";
  }, [categories, product.category, product.category_id]);

  const currentSteps = useMemo(() => {
    return [
      { title: "Uploading Images", description: "رفع صور المنتج مباشرة إلى Cloudinary", active: phase === "uploading" },
      { title: "Saving Images", description: "حفظ روابط الصور في الباك إند", active: phase === "saving" },
      { title: "Completed", description: "تم حفظ الصور والروابط بنجاح", active: phase === "done" },
    ];
  }, [phase]);

  const updateVariantImage = (variantId: string, image: string) => {
    setVariantImages((current) => ({
      ...current,
      [variantId]: {
        id: variantId,
        image,
      },
    }));
  };

  const handleSave = () => {
    void (async () => {
      try {
        setError("");
        setIsSubmitting(true);
        setPhase("uploading");

        if (productImages.length === 0) {
          throw new Error("يرجى رفع صورة واحدة على الأقل للمنتج.");
        }

        const existingImages = initialImages;
        const existingByUrl = new Map(existingImages.map((image) => [image.media_url, image]));
        const keptUrls = new Set(productImages);

        // Remove images the admin dropped from the gallery.
        const removedImages = existingImages.filter((image) => !keptUrls.has(image.media_url));
        for (const removedImage of removedImages) {
          await deleteProductImage(removedImage.id);
        }

        // Create only the genuinely new images (skip ones already saved on
        // the product) sequentially, to avoid racing the backend's
        // "first image is primary" logic and its unique-primary constraint.
        const createdIdByUrl = new Map<string, string>();
        for (const imageUrl of productImages) {
          if (existingByUrl.has(imageUrl)) {
            continue;
          }

          const created = await createProductImage({
            product_id: product.id,
            image: imageUrl,
            is_primary: false,
          });
          createdIdByUrl.set(imageUrl, created.id);
        }

        setPhase("saving");

        // Explicitly (re)assert the chosen primary image; the backend
        // automatically clears the previous primary flag when this is set.
        const finalPrimaryUrl = productImages[primaryImageIndex] ?? productImages[0];
        const finalPrimaryId = existingByUrl.get(finalPrimaryUrl)?.id || createdIdByUrl.get(finalPrimaryUrl);
        const wasAlreadyPrimary = existingByUrl.get(finalPrimaryUrl)?.is_primary && keptUrls.has(finalPrimaryUrl);

        if (finalPrimaryId && !wasAlreadyPrimary) {
          await updateProductImage(finalPrimaryId, { is_primary: true });
        }

        const variantPayloads = (product.variants || []).map((variant) => {
          const nextVariantImage = variantImages[String(variant.id)]?.image || variant.media_url || "";

          return {
            price: variant.price,
            image: nextVariantImage || undefined,
            attributes: (variant.attributes || []).map((attribute) => ({
              attribute_type: attribute.attribute_type,
              value: attribute.value,
            })),
          };
        });

        // Only resend the full variants list (which the backend fully
        // replaces on every update) when a variant image actually changed.
        const variantImagesChanged = (product.variants || []).some((variant) => {
          const nextImage = variantImages[String(variant.id)]?.image || "";
          return nextImage !== (variant.media_url || "");
        });

        if (variantImagesChanged) {
          await updateProduct(product.id, {
            name: product.name,
            description: product.description,
            category: product.category_id || product.category,
            variants: variantPayloads,
          });
        }

        setPhase("done");
      } catch (saveError) {
        setPhase("idle");
        setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الصور الآن.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (phase === "done") {
    return (
      <div className="space-y-6">
        <Panel>
          <SectionHeader
            eyebrow="Completed"
            title="تم إنشاء المنتج بنجاح"
            subtitle="تقدر تراجع بيانات المنتج تحت، وتقرر تعدّل عليه أو تقفل أو تضيف منتج جديد."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>تم الحفظ</span>
              </span>
            }
          />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-[120px_1fr]">
            <div className="h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {productImages[primaryImageIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productImages[primaryImageIndex]} alt={product.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-950">{product.name}</p>
              <p className="text-sm leading-6 text-slate-500">{product.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">التصنيف: {categoryName}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{(product.variants || []).length} Variant</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{productImages.length} صورة</span>
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/products/${product.id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            <span>تعديل المنتج</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            <span>تم، إغلاق</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products/new")}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-400"
          >
            <Plus className="h-4 w-4" />
            <span>تم، إضافة منتج آخر</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeader
          eyebrow="Phase 2"
          title="رفع الصور"
          subtitle="Upload product images first, then persist the Cloudinary URLs and optional variant images."
          action={<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{phase === "idle" ? "جاهز للرفع" : phase}</span>}
        />
        <div className="px-5 py-5">
          <Timeline steps={currentSteps} />
        </div>
      </Panel>

      <Panel>
        <SectionHeader eyebrow="Product Images" title="صور المنتج" subtitle="Multiple images, primary image, and reordering happen here after the product exists." />
        <div className="space-y-4 px-5 py-5">
          <CloudinaryImagePicker
            title="صور المنتج"
            description="ارفع صور المنتج الآن. كل صورة تُرفع مباشرة إلى Cloudinary، ثم نحفظ URL فقط في الباك إند."
            value={productImages}
            onChange={setProductImages}
            primaryIndex={primaryImageIndex}
            onPrimaryIndexChange={setPrimaryImageIndex}
            maxImages={10}
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeader eyebrow="Variant Images" title="صور الـ Variants" subtitle="كل Variant يقدر يأخذ صورة واحدة اختيارية."
        />
        <div className="space-y-4 px-5 py-5">
          {(product.variants || []).map((variant) => (
            <div key={variant.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">Variant #{variant.id}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Price: {variant.price} | {variant.attributes?.map((attribute) => `${attribute.attribute_type}=${attribute.value}`).join(", ")}
                  </p>
                </div>
              </div>
              <CloudinaryImagePicker
                title="Variant Image"
                description="يمكن رفع صورة واحدة للـ variant ثم حفظ رابطها داخل الـ update النهائي للمنتج."
                value={variantImages[String(variant.id)]?.image ? [variantImages[String(variant.id)].image] : []}
                onChange={(nextValue) => updateVariantImage(String(variant.id), nextValue[0] || "")}
                maxImages={1}
              />
            </div>
          ))}
        </div>
      </Panel>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.push(`/admin/products/${product.id}`)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          العودة للتعديل
        </button>
        <button type="button" onClick={handleSave} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>حفظ الصور</span>
        </button>
      </div>
    </div>
  );
}

