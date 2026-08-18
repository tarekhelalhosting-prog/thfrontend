"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { createProduct, createProductVariant, deleteProductVariant, updateProduct } from "@/lib/api";
import { isOfferCategory } from "@/lib/offer-category";
import { Category, Product } from "@/types";
import { Panel, SectionHeader } from "@/components/admin/admin-kit";

type ProductVariantAttributeDraft = {
  id: string;
  attribute_type: string;
  value: string;
};

type VariantDraft = {
  id: string;
  price: string;
  existingImage?: string;
  existingPublicId?: string;
  attributes: ProductVariantAttributeDraft[];
};

type ProductManagementFormProps = {
  mode: "create" | "edit";
  categories: Category[];
  initialProduct?: Product | null;
  defaultCategoryId?: string;
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeEmptyAttribute(): ProductVariantAttributeDraft {
  return {
    id: makeId("attribute"),
    attribute_type: "",
    value: "",
  };
}

function makeEmptyVariant(): VariantDraft {
  return {
    id: makeId("variant"),
    price: "",
    attributes: [makeEmptyAttribute()],
  };
}

function normalizeAttributeType(value: string) {
  return value.trim().toLowerCase();
}

function buildAttributeKey(attributes: ProductVariantAttributeDraft[]) {
  return attributes
    .map((attribute) => `${normalizeAttributeType(attribute.attribute_type)}=${attribute.value.trim().toLowerCase()}`)
    .sort()
    .join("|");
}

function mapVariants(product: Product): VariantDraft[] {
  if (!product.variants || product.variants.length === 0) {
    return [makeEmptyVariant()];
  }

  return product.variants.map((variant) => {
    const attributeSource = (variant.attributes || []) as Array<{ id?: number; type?: string; attribute_type?: string; value?: string }>;

    return {
      id: variant.id || makeId("variant"),
      price: String(variant.price ?? ""),
      existingImage: variant.media_url || undefined,
      existingPublicId: variant.public_id || undefined,
      attributes: attributeSource.length > 0
        ? attributeSource.map((attribute) => ({
            id: makeId("attribute"),
            attribute_type: attribute.attribute_type || attribute.type || "",
            value: attribute.value || "",
          }))
        : [makeEmptyAttribute()],
    };
  });
}

function phaseLabel(mode: "create" | "edit", isOfferMode: boolean) {
  if (isOfferMode) {
    return mode === "create" ? "إضافة عرض" : "تعديل العرض";
  }

  return mode === "create" ? "إضافة منتج" : "تعديل المنتج";
}

// Shared shape sent to both the nested product update (existing variants)
// and the standalone /product-variants/ endpoint (new variants).
function mapVariantToPayload(variant: VariantDraft) {
  return {
    price: Number(variant.price),
    ...(variant.existingImage ? { image: variant.existingImage } : {}),
    ...(variant.existingPublicId ? { public_id: variant.existingPublicId } : {}),
    attributes: variant.attributes
      .filter((attribute) => attribute.attribute_type.trim() || attribute.value.trim())
      .map((attribute) => ({
        attribute_type: attribute.attribute_type.trim(),
        value: attribute.value.trim(),
      })),
  };
}

export default function ProductManagementForm({ mode, categories, initialProduct, defaultCategoryId }: ProductManagementFormProps) {
  const router = useRouter();
  const [name, setName] = useState(() => initialProduct?.name || "");
  const [description, setDescription] = useState(() => initialProduct?.description || "");
  const [categoryId, setCategoryId] = useState(() => initialProduct?.category_id || initialProduct?.category || defaultCategoryId || "");
  const [variants, setVariants] = useState<VariantDraft[]>(() => (initialProduct ? mapVariants(initialProduct) : [makeEmptyVariant()]));
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveCategoryId = categoryId || defaultCategoryId || categories[0]?.id || "";

  const initialSnapshot = useMemo(
    () => ({
      name: initialProduct?.name || "",
      description: initialProduct?.description || "",
      categoryId: initialProduct?.category_id || initialProduct?.category || defaultCategoryId || "",
      variants: initialProduct ? mapVariants(initialProduct) : [makeEmptyVariant()],
    }),
    [initialProduct, defaultCategoryId]
  );

  const isDirty = useMemo(() => {
    const current = { name, description, categoryId: effectiveCategoryId, variants };
    return JSON.stringify(current) !== JSON.stringify(initialSnapshot);
  }, [name, description, effectiveCategoryId, variants, initialSnapshot]);

  useEffect(() => {
    if (!isDirty || isSubmitting) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Modern browsers show a generic message regardless of the return value,
      // but assigning a string keeps older browsers happy.
      event.returnValue = "لديك بيانات لم تحفظها. هل أنت متأكد أنك تريد المغادرة؟";
      return event.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);
  const selectedCategoryObj = categories.find((category) => category.id === effectiveCategoryId);
  const isOfferMode = isOfferCategory(selectedCategoryObj);

  // Ids of variants that already existed on the product when this form
  // loaded. Used on submit to tell apart variants that must be sent through
  // the nested product update (existing, need an `id`) from ones that must
  // be created/removed through the dedicated /product-variants/ endpoint.
  const existingVariantIds = new Set((initialProduct?.variants || []).map((variant) => variant.id));

  const updateVariant = (variantId: string, updater: (variant: VariantDraft) => VariantDraft) => {
    setVariants((current) => current.map((variant) => (variant.id === variantId ? updater(variant) : variant)));
  };

  const addVariant = () => {
    setVariants((current) => [...current, makeEmptyVariant()]);
  };

  const removeVariant = (variantId: string) => {
    setVariants((current) => (current.length > 1 ? current.filter((variant) => variant.id !== variantId) : current));
  };

  const validateForm = () => {
    if (!name.trim() || !description.trim() || !effectiveCategoryId) {
      throw new Error("يرجى إدخال الاسم والوصف والتصنيف.");
    }

    if (variants.length === 0) {
      throw new Error("يرجى إضافة Variant واحد على الأقل.");
    }

    const seenCombos = new Set<string>();

    for (const variant of variants) {
      const parsedPrice = Number(variant.price);
      if (!variant.price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error("كل Variant يحتاج سعراً صالحاً أكبر من صفر.");
      }

      const normalizedAttributes = variant.attributes.filter((attribute) => attribute.attribute_type.trim() || attribute.value.trim());
      if (normalizedAttributes.length === 0) {
        throw new Error("يجب إضافة خاصية واحدة على الأقل لكل فاريانت (مثل اللون أو الحجم).");
      }

      const duplicateType = normalizedAttributes.some((attribute, index) => {
        const currentType = normalizeAttributeType(attribute.attribute_type);
        return currentType && normalizedAttributes.findIndex((item) => normalizeAttributeType(item.attribute_type) === currentType) !== index;
      });

      if (duplicateType) {
        throw new Error("لا يمكن تكرار attribute_type داخل نفس Variant.");
      }

      const missingFields = normalizedAttributes.some((attribute) => !attribute.attribute_type.trim() || !attribute.value.trim());
      if (missingFields) {
        throw new Error("attribute_type و value لا يمكن أن يكونا فارغين.");
      }

      const comboKey = buildAttributeKey(normalizedAttributes);
      if (seenCombos.has(comboKey)) {
        throw new Error("يوجد Variant مكرر بنفس مجموعة attributes.");
      }

      seenCombos.add(comboKey);
    }
  };

  const buildProductPayload = () => ({
    name: name.trim(),
    description: description.trim(),
    category: effectiveCategoryId,
    variants: variants.map(mapVariantToPayload),
  });

  const handleSubmit = () => {
    void (async () => {
      setFormError("");

      try {
        validateForm();
        setIsSubmitting(true);

        if (mode === "create") {
          const savedProduct = await createProduct(buildProductPayload());
          router.push(`/admin/products/${savedProduct.id}/images`);
          return;
        }

        const productId = initialProduct?.id || "";

        // Existing variants must keep their `id` so the backend can locate
        // them; new ones (added via "add variant" in this session) and
        // removed ones can no longer be inferred from the array diff, so
        // they're handled through /product-variants/ explicitly.
        const existingVariants = variants.filter((variant) => existingVariantIds.has(variant.id));
        const newVariants = variants.filter((variant) => !existingVariantIds.has(variant.id));
        const removedVariantIds = [...existingVariantIds].filter(
          (variantId) => !variants.some((variant) => variant.id === variantId)
        );

        await updateProduct(productId, {
          name: name.trim(),
          description: description.trim(),
          category: effectiveCategoryId,
          ...(existingVariants.length > 0
            ? { variants: existingVariants.map((variant) => ({ id: variant.id, ...mapVariantToPayload(variant) })) }
            : {}),
        });

        for (const variantId of removedVariantIds) {
          await deleteProductVariant(variantId);
        }

        for (const variant of newVariants) {
          await createProductVariant({ product_id: productId, ...mapVariantToPayload(variant) });
        }

        router.push("/admin/products");
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "تعذر حفظ المنتج الآن.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeader
          eyebrow={isOfferMode ? "Offer" : "Product"}
          title={phaseLabel(mode, isOfferMode)}
          subtitle={
            mode === "create"
              ? isOfferMode
                ? "Phase 1: احفظ بيانات العرض وباقاته أولاً بدون صور، وسيتم تحويلك بعدها لصفحة رفع صورة العرض."
                : "Phase 1: احفظ بيانات المنتج والفاريانت أولاً بدون صور، وسيتم تحويلك بعدها لصفحة رفع الصور."
              : isOfferMode
                ? "عدّل بيانات العرض وباقاته. لإدارة صورة العرض استخدم صفحة الصور المخصصة."
                : "عدّل بيانات المنتج والفاريانت. لإدارة صور المنتج والفاريانت استخدم صفحة الصور المخصصة."
          }
          action={
            mode === "edit" && initialProduct ? (
              <Link
                href={`/admin/products/${initialProduct.id}/images`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{isOfferMode ? "إدارة صورة العرض" : "إدارة صور المنتج"}</span>
              </Link>
            ) : null
          }
        />
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={isOfferMode ? "Offer Basics" : "Basic Information"}
          title={isOfferMode ? "بيانات العرض" : "البيانات الأساسية"}
          subtitle={isOfferMode ? "اسم العرض، تفاصيله، وربطه بتصنيف العروض." : "اسم المنتج، الوصف، والتصنيف."}
        />
        {isOfferMode ? (
          <div className="mx-5 mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
            <span>🎁</span>
            <span>هذا المنتج مصنّف كعرض/باقة، وسيظهر تلقائياً في قسم &quot;عروض وباقات حصرية&quot; أعلى الصفحة الرئيسية.</span>
          </div>
        ) : null}
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            {isOfferMode ? "اسم العرض" : "الاسم"}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400"
              placeholder={isOfferMode ? "مثال: عرض الأصحاب - استشوار + كرسيين حلاقة" : "مثال: كرسي حلاقة فاخر"}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            التصنيف
            <select
              value={effectiveCategoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            {isOfferMode ? "تفاصيل العرض" : "الوصف"}
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-amber-400"
              placeholder={isOfferMode ? "اكتب تفاصيل العرض وما يشمله من منتجات ومميزات..." : "وصف تفصيلي للمنتج..."}
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={isOfferMode ? "Offer Bundle" : "Product Variants"}
          title={isOfferMode ? "باقات وأسعار العرض" : "النوع"}
          subtitle={
            isOfferMode
              ? "كل صف يمثل باقة سعر كاملة للعرض، وكل عنصر تحته يمثل منتج/مكون ضمن هذا العرض (زي استشوار، كرسي حلاقة...)."
              : "كل نوع يدعم سعر و اختلافات غير محدودة. الصور تُدار من صفحة الصور بعد الحفظ."
          }
        />
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">{isOfferMode ? "سعر الباقة" : "السعر"}</th>
                <th className="py-3 pl-4">{isOfferMode ? "مكونات العرض" : "الصفة"}</th>
                <th className="py-3 pl-4">حذف</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="py-4 pl-4">
                    <input
                      value={variant.price}
                      onChange={(event) => updateVariant(variant.id, (current) => ({ ...current, price: event.target.value }))}
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400"
                      placeholder="350"
                    />
                  </td>
                  <td className="py-4 pl-4">
                    <div className="space-y-3">
                      {variant.attributes.map((attribute, attributeIndex) => (
                        <div key={attribute.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_1fr_auto]">
                          <input
                            value={attribute.attribute_type}
                            onChange={(event) => {
                              updateVariant(variant.id, (current) => ({
                                ...current,
                                attributes: current.attributes.map((item) => (item.id === attribute.id ? { ...item, attribute_type: event.target.value } : item)),
                              }));
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400"
                            placeholder={isOfferMode ? "اسم المكون (مثال: استشوار)" : "وصف جديد (لون او حجم)"}
                          />
                          <input
                            value={attribute.value}
                            onChange={(event) => {
                              updateVariant(variant.id, (current) => ({
                                ...current,
                                attributes: current.attributes.map((item) => (item.id === attribute.id ? { ...item, value: event.target.value } : item)),
                              }));
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400"
                            placeholder={isOfferMode ? "تفاصيل المكون (مثال: استشوار 2000 وات)" : "القيمه (أحمر، كبير)"}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => updateVariant(variant.id, (current) => ({
                                ...current,
                                attributes: current.attributes.length > 1 ? current.attributes.filter((item) => item.id !== attribute.id) : current.attributes,
                              }))}
                              className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {attributeIndex === variant.attributes.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => updateVariant(variant.id, (current) => ({ ...current, attributes: [...current.attributes, makeEmptyAttribute()] }))}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 lg:col-span-3"
                            >
                              <Plus className="h-4 w-4" />
                              <span>{isOfferMode ? "إضافة مكون للعرض" : "إضافة صفه جديده"}</span>
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => removeVariant(variant.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 pb-5">
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Plus className="h-4 w-4" />
            <span>{isOfferMode ? "إضافة باقة سعر جديدة" : "إضافة نوع جديد"}</span>
          </button>
        </div>
      </Panel>

      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{formError}</div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (isDirty && !window.confirm("لديك بيانات لم تحفظها. هل أنت متأكد أنك تريد المغادرة دون حفظ؟")) {
              return;
            }
            router.push("/admin/products");
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          إلغاء
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{isOfferMode ? (mode === "create" ? "حفظ العرض" : "حفظ تعديلات العرض") : mode === "create" ? "حفظ المنتج" : "حفظ التعديلات"}</span>
        </button>
      </div>
    </div>
  );
}
