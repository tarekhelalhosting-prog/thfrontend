"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Pencil, Plus, X } from "lucide-react";
import CloudinaryImagePicker, { CloudinaryImageValue } from "@/components/admin/CloudinaryImagePicker";
import { createProductImage, deleteProductImage, fetchCategories, updateProduct, updateProductImage } from "@/lib/api";
import { isOfferCategory } from "@/lib/offer-category";
import { Category, Product, ProductImage } from "@/types";
import { Panel, SectionHeader, Timeline } from "@/components/admin/admin-kit";

type ProductImagesPhaseFormProps = {
  product: Product;
};

type VariantImageDraft = {
  id: string;
  image: string;
  public_id?: string;
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
  const [productImages, setProductImages] = useState<CloudinaryImageValue[]>(() =>
    initialImages.length > 0
      ? initialImages.map((image) => ({ url: image.media_url, public_id: image.public_id }))
      : product.image
        ? [{ url: product.image }]
        : []
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
        public_id: variant.public_id || undefined,
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

  const isOfferMode = useMemo(() => {
    const categoryId = product.category_id || product.category;
    return isOfferCategory(categories.find((category) => category.id === categoryId));
  }, [categories, product.category, product.category_id]);

  const currentSteps = useMemo(() => {
    return [
      { title: "Uploading Images", description: "رفع صور المنتج مباشرة إلى Cloudinary", active: phase === "uploading" },
      { title: "Saving Images", description: "حفظ روابط الصور في الباك إند", active: phase === "saving" },
      { title: "Completed", description: "تم حفظ الصور والروابط بنجاح", active: phase === "done" },
    ];
  }, [phase]);

  const updateVariantImage = (variantId: string, image: CloudinaryImageValue | null) => {
    setVariantImages((current) => ({
      ...current,
      [variantId]: {
        id: variantId,
        image: image?.url || "",
        public_id: image?.public_id,
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
        const keptUrls = new Set(productImages.map((image) => image.url));

        // Remove images the admin dropped from the gallery.
        const removedImages = existingImages.filter((image) => !keptUrls.has(image.media_url));
        for (const removedImage of removedImages) {
          await deleteProductImage(removedImage.id);
        }

        // Create only the genuinely new images (skip ones already saved on
        // the product) sequentially, to avoid racing the backend's
        // "first image is primary" logic and its unique-primary constraint.
        const createdIdByUrl = new Map<string, string>();
        for (const image of productImages) {
          if (existingByUrl.has(image.url)) {
            continue;
          }

          const created = await createProductImage({
            product_id: product.id,
            image: image.url,
            public_id: image.public_id,
            is_primary: false,
          });
          createdIdByUrl.set(image.url, created.id);
        }

        setPhase("saving");

        // Explicitly (re)assert the chosen primary image; the backend
        // automatically clears the previous primary flag when this is set.
        const finalPrimaryUrl = productImages[primaryImageIndex]?.url ?? productImages[0]?.url;
        const finalPrimaryId = existingByUrl.get(finalPrimaryUrl)?.id || createdIdByUrl.get(finalPrimaryUrl);
        const wasAlreadyPrimary = existingByUrl.get(finalPrimaryUrl)?.is_primary && keptUrls.has(finalPrimaryUrl);

        if (finalPrimaryId && !wasAlreadyPrimary) {
          await updateProductImage(finalPrimaryId, { is_primary: true });
        }

        const variantPayloads = (product.variants || []).map((variant) => {
          const variantImageDraft = variantImages[String(variant.id)];
          const nextVariantImage = variantImageDraft?.image || variant.media_url || "";

          // The backend now matches variants by `id` on update instead of
          // replacing the whole list, so every entry must include it.
          // Only include image and public_id if they have actual values to avoid
          // clearing variant images when not intended.
          return {
            id: variant.id,
            price: variant.price,
            ...(nextVariantImage ? { image: nextVariantImage } : {}),
            ...(variantImageDraft?.public_id ? { public_id: variantImageDraft.public_id } : {}),
            attributes: (variant.attributes || []).map((attribute) => ({
              attribute_type: attribute.attribute_type,
              value: attribute.value,
            })),
          };
        });

        // Only resend variants (matched by `id`, image-only change) when a
        // variant image actually changed.
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
            title={isOfferMode ? "تم إنشاء العرض بنجاح" : "تم إنشاء المنتج بنجاح"}
            subtitle={isOfferMode ? "تقدر تراجع بيانات العرض تحت، وتقرر تعدّل عليه أو تقفل أو تضيف عرض جديد." : "تقدر تراجع بيانات المنتج تحت، وتقرر تعدّل عليه أو تقفل أو تضيف منتج جديد."}
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
                <img src={productImages[primaryImageIndex].url} alt={product.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-950">{product.name}</p>
              <p className="text-sm leading-6 text-slate-500">{product.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">التصنيف: {categoryName}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{(product.variants || []).length} {isOfferMode ? "باقة" : "Variant"}</span>
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
            <span>{isOfferMode ? "تعديل العرض" : "تعديل المنتج"}</span>
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
            <span>{isOfferMode ? "تم، إضافة عرض آخر" : "تم، إضافة منتج آخر"}</span>
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
          title={isOfferMode ? "رفع صورة العرض" : "رفع الصور"}
          subtitle={isOfferMode ? "ارفع صورة العرض أولاً، ثم نحفظ رابط Cloudinary وصور المكونات الاختيارية." : "Upload product images first, then persist the Cloudinary URLs and optional variant images."}
          action={<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{phase === "idle" ? "جاهز للرفع" : phase}</span>}
        />
        <div className="px-5 py-5">
          <Timeline steps={currentSteps} />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={isOfferMode ? "Offer Banner" : "Product Images"}
          title={isOfferMode ? "صورة العرض (البانر الرئيسي)" : "صور المنتج"}
          subtitle={isOfferMode ? "هذه الصورة الأساسية ستظهر كبانر العرض في القسم المميز أعلى الصفحة الرئيسية، فاختر صورة عريضة واضحة تعبر عن العرض بالكامل." : "Multiple images, primary image, and reordering happen here after the product exists."}
        />
        <div className="space-y-4 px-5 py-5">
          <CloudinaryImagePicker
            title={isOfferMode ? "صورة العرض" : "صور المنتج"}
            description={isOfferMode ? "ارفع صورة بانر مميزة للعرض (يفضل مقاس أفقي عريض)، هتظهر في قسم العروض بالواجهة الرئيسية." : "ارفع صور المنتج الآن. كل صورة تُرفع مباشرة إلى Cloudinary، ثم نحفظ URL فقط في الباك إند."}
            value={productImages}
            onChange={setProductImages}
            primaryIndex={primaryImageIndex}
            onPrimaryIndexChange={setPrimaryImageIndex}
            maxImages={10}
            preserveAspectRatio={isOfferMode}
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={isOfferMode ? "Offer Components" : "Variant Images"}
          title={isOfferMode ? "صور مكونات العرض" : "صور الـ Variants"}
          subtitle={isOfferMode ? "يمكن رفع صورة توضح كل مكون ضمن العرض (اختياري)." : "كل Variant يقدر يأخذ صورة واحدة اختيارية."}
        />
        <div className="space-y-4 px-5 py-5">
          {(product.variants || []).map((variant) => (
            <div key={variant.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{isOfferMode ? "باقة العرض" : `Variant #${variant.id}`}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isOfferMode ? "سعر الباقة" : "Price"}: {variant.price} | {isOfferMode ? "المكونات" : ""} {variant.attributes?.map((attribute) => (isOfferMode ? attribute.value : `${attribute.attribute_type}=${attribute.value}`)).join(", ")}
                  </p>
                </div>
              </div>
              <CloudinaryImagePicker
                title={isOfferMode ? "صورة المكون" : "Variant Image"}
                description={isOfferMode ? "يمكن رفع صورة لهذا المكون ثم حفظها داخل الـ update النهائي للعرض." : "يمكن رفع صورة واحدة للـ variant ثم حفظ رابطها داخل الـ update النهائي للمنتج."}
                value={
                  variantImages[String(variant.id)]?.image
                    ? [{ url: variantImages[String(variant.id)].image, public_id: variantImages[String(variant.id)].public_id }]
                    : []
                }
                onChange={(nextValue) => updateVariantImage(String(variant.id), nextValue[0] || null)}
                maxImages={1}
                preserveAspectRatio={isOfferMode}
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

