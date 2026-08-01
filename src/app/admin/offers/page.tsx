"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Edit3, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Modal, Panel, SectionHeader, StatusPill } from "@/components/admin/admin-kit";
import { createOffer, deleteOffer, fetchOffers, fetchProducts, toggleOfferActive, updateOffer } from "@/lib/api";
import type { OfferPayload, OfferProductPayload } from "@/lib/api";
import { Offer, Product } from "@/types";

const OFFER_TYPE_LABELS: Record<Offer["offer_type"], string> = {
  PERCENTAGE: "نسبة مئوية",
  FIXED: "خصم ثابت",
  BUY_X_GET_Y: "اشترِ واحصل على هدية",
};

const ITEM_TYPE_LABELS: Record<"REQUIRED" | "GIFT", string> = {
  REQUIRED: "منتج مطلوب",
  GIFT: "هدية",
};

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function toDatetimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

type OfferProductRow = {
  key: string;
  product: string;
  variant: string;
  item_type: "REQUIRED" | "GIFT";
  quantity: string;
};

function createEmptyRow(): OfferProductRow {
  return {
    key: Math.random().toString(36).slice(2, 10),
    product: "",
    variant: "",
    item_type: "REQUIRED",
    quantity: "1",
  };
}

const emptyForm = {
  name: "",
  offer_type: "PERCENTAGE" as Offer["offer_type"],
  value: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState<OfferProductRow[]>([createEmptyRow()]);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const [offersResult, productsResult] = await Promise.all([fetchOffers(), fetchProducts()]);

        if (!cancelled) {
          setOffers(offersResult);
          setProducts(productsResult);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات العروض");
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

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setRows([createEmptyRow()]);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingId(offer.id);
    setForm({
      name: offer.name,
      offer_type: offer.offer_type,
      value: offer.value != null ? String(offer.value) : "",
      starts_at: toDatetimeLocalValue(offer.starts_at),
      ends_at: toDatetimeLocalValue(offer.ends_at),
      is_active: offer.is_active,
    });
    setRows(
      offer.offer_products.length > 0
        ? offer.offer_products.map((item) => ({
            key: item.id || Math.random().toString(36).slice(2, 10),
            product: item.product,
            variant: item.variant || "",
            item_type: item.item_type,
            quantity: String(item.quantity),
          }))
        : [createEmptyRow()]
    );
    setFormError("");
    setModalOpen(true);
  };

  const updateRow = (key: string, patch: Partial<OfferProductRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addRow = () => setRows((current) => [...current, createEmptyRow()]);

  const removeRow = (key: string) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) {
      return "اسم العرض مطلوب.";
    }

    if (!form.starts_at || !form.ends_at) {
      return "تاريخ البداية والنهاية مطلوبان.";
    }

    if (fromDatetimeLocalValue(form.ends_at) < fromDatetimeLocalValue(form.starts_at)) {
      return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.";
    }

    const numericValue = form.value.trim() === "" ? null : Number(form.value);

    if (form.offer_type === "PERCENTAGE") {
      if (numericValue === null || Number.isNaN(numericValue) || numericValue <= 0 || numericValue > 100) {
        return "عروض النسبة المئوية يجب أن تكون قيمتها بين 1 و100.";
      }
    } else if (form.offer_type === "FIXED") {
      if (numericValue === null || Number.isNaN(numericValue) || numericValue <= 0) {
        return "عروض الخصم الثابت يجب أن تكون قيمتها موجبة.";
      }
    } else if (numericValue !== null && (Number.isNaN(numericValue) || numericValue <= 0)) {
      return "قيمة العرض (لو موجودة) يجب أن تكون موجبة.";
    }

    const validRows = rows.filter((row) => row.product);
    if (validRows.length === 0) {
      return "يجب إضافة منتج واحد على الأقل للعرض.";
    }

    if (form.offer_type === "BUY_X_GET_Y") {
      const hasRequired = validRows.some((row) => row.item_type === "REQUIRED");
      const hasGift = validRows.some((row) => row.item_type === "GIFT");

      if (!hasRequired) {
        return "عرض (اشترِ واحصل على) يجب أن يحتوي على منتج مطلوب واحد على الأقل.";
      }

      if (!hasGift) {
        return "عرض (اشترِ واحصل على) يجب أن يحتوي على منتج هدية واحد على الأقل.";
      }
    } else if (validRows.some((row) => row.item_type === "GIFT")) {
      return "منتجات الهدية مسموح بها فقط في عروض (اشترِ واحصل على).";
    }

    for (const row of validRows) {
      if (row.item_type === "GIFT" && !row.variant) {
        return "منتجات الهدية يجب أن تحدد Variant معين.";
      }

      const quantity = Number(row.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) {
        return "الكمية يجب أن تكون رقم صحيح 1 أو أكثر.";
      }
    }

    const seen = new Set<string>();
    for (const row of validRows) {
      const key = `${row.product}|${row.variant || ""}|${row.item_type}`;
      if (seen.has(key)) {
        return "لا يمكن تكرار نفس المنتج/الـ Variant بنفس نوع العنصر داخل نفس العرض.";
      }
      seen.add(key);
    }

    return null;
  };

  const handleSave = () => {
    void (async () => {
      const validationError = validate();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      const offerProducts: OfferProductPayload[] = rows
        .filter((row) => row.product)
        .map((row) => ({
          product: row.product,
          variant: row.variant || null,
          item_type: row.item_type,
          quantity: Number(row.quantity),
        }));

      const payload: OfferPayload = {
        name: form.name.trim(),
        offer_type: form.offer_type,
        value: form.value.trim() === "" ? null : Number(form.value),
        starts_at: fromDatetimeLocalValue(form.starts_at),
        ends_at: fromDatetimeLocalValue(form.ends_at),
        is_active: form.is_active,
        offer_products: offerProducts,
      };

      try {
        setIsSaving(true);
        setFormError("");

        if (editingId) {
          const updated = await updateOffer(editingId, payload);
          setOffers((current) => current.map((item) => (item.id === editingId ? updated : item)));
        } else {
          const created = await createOffer(payload);
          setOffers((current) => [created, ...current]);
        }

        setModalOpen(false);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "فشل حفظ العرض");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = (offerId: string) => {
    void (async () => {
      if (!window.confirm("هل تريد حذف هذا العرض؟")) {
        return;
      }

      try {
        await deleteOffer(offerId);
        setOffers((current) => current.filter((item) => item.id !== offerId));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "فشل حذف العرض");
      }
    })();
  };

  const handleToggleActive = (offerId: string) => {
    void (async () => {
      try {
        setTogglingId(offerId);
        const updated = await toggleOfferActive(offerId);
        setOffers((current) => current.map((item) => (item.id === offerId ? updated : item)));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "فشل تغيير حالة العرض");
      } finally {
        setTogglingId(null);
      }
    })();
  };

  return (
    <AdminShell
      title="العروض"
      subtitle="جدول العروض والانواع: نسبة مئوية، خصم ثابت، اشترِ واحصل على هدية."
      actions={
        <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-400">
          <Plus className="h-4 w-4" />
          <span>إضافة عرض</span>
        </button>
      }
    >
      <Panel>
        <SectionHeader eyebrow="Offers" title="جدول العروض" subtitle="اسم العرض، النوع، القيمة، البداية، النهاية، والحالة." action={<BadgePercent className="h-4 w-4 text-slate-500" />} />
        <div className="overflow-x-auto px-5 py-5">
          {loadError ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loadError}</p> : null}
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">اسم العرض</th>
                <th className="py-3 pl-4">نوع العرض</th>
                <th className="py-3 pl-4">القيمة</th>
                <th className="py-3 pl-4">البداية</th>
                <th className="py-3 pl-4">النهاية</th>
                <th className="py-3 pl-4">الحالة</th>
                <th className="py-3 pl-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">جاري تحميل العروض...</td>
                </tr>
              ) : offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pl-4 font-bold text-slate-950">{offer.name}</td>
                    <td className="py-4 pl-4 text-slate-600">{OFFER_TYPE_LABELS[offer.offer_type]}</td>
                    <td className="py-4 pl-4 text-slate-600">
                      {offer.value == null ? "—" : offer.offer_type === "PERCENTAGE" ? `${offer.value}%` : `${offer.value.toLocaleString("ar-EG")} جنيه`}
                    </td>
                    <td className="py-4 pl-4 text-slate-600">{formatDate(offer.starts_at)}</td>
                    <td className="py-4 pl-4 text-slate-600">{formatDate(offer.ends_at)}</td>
                    <td className="py-4 pl-4">
                      <StatusPill status={offer.is_active ? "Completed" : "Cancelled"} />
                    </td>
                    <td className="py-4 pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => openEditModal(offer)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(offer.id)}
                          disabled={togglingId === offer.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                        >
                          <span>{offer.is_active ? "إيقاف" : "تفعيل"}</span>
                        </button>
                        <button type="button" onClick={() => handleDelete(offer.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10">
                    <EmptyState title="لا توجد عروض بعد" description="ابدأ بإضافة أول عرض وحدد المنتجات المرتبطة به." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        title={editingId ? "تعديل العرض" : "إضافة عرض"}
        subtitle="حدد بيانات العرض والمنتجات المرتبطة به."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">إلغاء</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {isSaving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </>
        }
      >
        <div className="grid gap-4">
          {formError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{formError}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              اسم العرض
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              نوع العرض
              <select
                value={form.offer_type}
                onChange={(event) => setForm((current) => ({ ...current, offer_type: event.target.value as Offer["offer_type"] }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              >
                <option value="PERCENTAGE">{OFFER_TYPE_LABELS.PERCENTAGE}</option>
                <option value="FIXED">{OFFER_TYPE_LABELS.FIXED}</option>
                <option value="BUY_X_GET_Y">{OFFER_TYPE_LABELS.BUY_X_GET_Y}</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              القيمة {form.offer_type === "BUY_X_GET_Y" ? "(اختياري)" : ""}
              <input
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                type="number"
                min={0}
                step="0.01"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              بداية العرض
              <input
                value={form.starts_at}
                onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))}
                type="datetime-local"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              نهاية العرض
              <input
                value={form.ends_at}
                onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))}
                type="datetime-local"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              العرض مفعل
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">المنتجات المرتبطة بالعرض</p>
              <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة منتج</span>
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row) => {
                const selectedProduct = productsById.get(row.product);
                const variants = selectedProduct?.variants || [];

                return (
                  <div key={row.key} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-5">
                    <select
                      value={row.product}
                      onChange={(event) => updateRow(row.key, { product: event.target.value, variant: "" })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400 sm:col-span-2"
                    >
                      <option value="">اختر منتج</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>

                    <select
                      value={row.variant}
                      onChange={(event) => updateRow(row.key, { variant: event.target.value })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400 disabled:opacity-50"
                      disabled={variants.length === 0}
                    >
                      <option value="">{row.item_type === "GIFT" ? "اختر Variant" : "كل الـ Variants"}</option>
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {(variant.attributes || []).map((attribute) => attribute.value).join(" / ") || `#${variant.id}`} - {variant.price} ج
                        </option>
                      ))}
                    </select>

                    <select
                      value={row.item_type}
                      onChange={(event) => updateRow(row.key, { item_type: event.target.value as "REQUIRED" | "GIFT" })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400"
                    >
                      <option value="REQUIRED">{ITEM_TYPE_LABELS.REQUIRED}</option>
                      <option value="GIFT">{ITEM_TYPE_LABELS.GIFT}</option>
                    </select>

                    <input
                      value={row.quantity}
                      onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                      type="number"
                      min={1}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400"
                      placeholder="الكمية"
                    />

                    <button type="button" onClick={() => removeRow(row.key)} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                      حذف
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
