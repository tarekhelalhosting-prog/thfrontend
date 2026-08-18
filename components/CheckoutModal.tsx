"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, Calendar, ArrowRight, ClipboardCheck, CreditCard, Coins, MapPin, Plus, Loader2 } from "lucide-react";
import { Address, CartItem, SalonBundle, Order, User } from "../src/types";
import { getCartLineKey, getCartItemUnitPrice, describeCartItemVariant } from "../src/lib/cart";
import { createOrder, createPaymentIntention, createUserAddress, fetchUserAddresses } from "../src/lib/api";
import PageState from "../src/components/ui/PageState";
import InlineBanner from "../src/components/ui/InlineBanner";
import {
  hasValidationErrors,
  validateAddressTitle,
  validateCity,
  validateCountry,
  validateStreet,
} from "../src/lib/form-validation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedBundle: SalonBundle | null;
  onClearCart: () => void;
  currentUser: User | null;
  onOrderSuccess: (order: Order) => void;
  onRequireLogin: () => void;
}

type AddressFormState = {
  title: string;
  country: string;
  city: string;
  street: string;
};

type AddressField = keyof AddressFormState;

const emptyAddressForm: AddressFormState = {
  title: "",
  country: "Egypt",
  city: "",
  street: "",
};

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  selectedBundle,
  onClearCart,
  currentUser,
  onOrderSuccess,
  onRequireLogin,
}: CheckoutModalProps) {
  const displayUserFullName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
    : "";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [addressFieldErrors, setAddressFieldErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"details" | "success">("details");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingAddresses(true);
      setAddressesError("");
      try {
        const result = await fetchUserAddresses();
        if (cancelled) {
          return;
        }
        setAddresses(result);
        setSelectedAddressId((current) => current || result.find((address) => address.is_default)?.id || result[0]?.id || null);
      } catch (error) {
        if (!cancelled) {
          setAddressesError(error instanceof Error ? error.message : "تعذر تحميل العناوين المحفوظة.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const formatPrice = (price: number) => `${price.toLocaleString("en-EG")} جنيه`;

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + getCartItemUnitPrice(item) * item.quantity, 0),
    [cartItems]
  );
  const processingFee = createdOrder?.processing_fee ?? 0;
  const displayTotal = createdOrder?.total ?? subtotal;
  const isBundleOnlyCheckout = Boolean(selectedBundle) && cartItems.length === 0;
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || null;
  const createdOrderDateLabel = useMemo(
    () => (createdOrder?.created_at ? new Date(createdOrder.created_at).toLocaleDateString("ar-EG") : ""),
    [createdOrder]
  );

  const paymentMethodLabel = () => "دفع إلكتروني (فيزا / ماستركارد / محفظة) عبر Paymob";

  const handleAddressFieldChange = (field: AddressField, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    setAddressFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddAddressSubmit = () => {
    const nextErrors: Partial<Record<AddressField, string>> = {
      title: validateAddressTitle(addressForm.title),
      country: validateCountry(addressForm.country),
      city: validateCity(addressForm.city),
      street: validateStreet(addressForm.street),
    };
    setAddressFieldErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    void (async () => {
      setIsSavingAddress(true);
      setErrorMessage("");
      try {
        const created = await createUserAddress({
          title: addressForm.title.trim(),
          country: addressForm.country.trim(),
          city: addressForm.city.trim(),
          street: addressForm.street.trim(),
          is_default: addresses.length === 0,
        });
        setAddresses((current) => [...current, created]);
        setSelectedAddressId(created.id);
        setIsAddingAddress(false);
        setAddressForm(emptyAddressForm);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر إضافة العنوان الجديد.");
      } finally {
        setIsSavingAddress(false);
      }
    })();
  };

  const handleConfirmOrder = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!createdOrder) {
      if (isBundleOnlyCheckout) {
        setErrorMessage("الرجاء إضافة عناصر الباقة إلى سلة الشراء أولاً ثم إتمام الطلب.");
        return;
      }

      if (cartItems.length === 0) {
        setErrorMessage("سلة الشراء فارغة، أضف منتجات أولاً.");
        return;
      }

      if (!selectedAddressId) {
        setErrorMessage("الرجاء اختيار عنوان توصيل أو إضافة عنوان جديد.");
        return;
      }
    }

    setErrorMessage("");
    setIsSubmitting(true);

    void (async () => {
      try {
        let order = createdOrder;

        if (!order) {
          order = await createOrder(selectedAddressId as string);
          setCreatedOrder(order);
          onClearCart();
          onOrderSuccess(order);
        }

        const intention = await createPaymentIntention(order.id);
        window.location.href = intention.checkoutUrl;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر إتمام العملية، الرجاء المحاولة مرة أخرى.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const handleFinish = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const shouldShowAddressForm = isAddingAddress || (!isLoadingAddresses && addresses.length === 0);
  const confirmButtonLabel = isSubmitting
    ? "جاري المعالجة..."
    : createdOrder
      ? "إعادة محاولة الدفع الإلكتروني"
      : "المتابعة للدفع الإلكتروني الآمن";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90dvh] bg-dark-bg border border-dark-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden z-10 p-4 sm:p-7 animate-in fade-in zoom-in-95 duration-200 text-right font-sans flex flex-col">

        {/* Close Button */}
        {step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto pt-10 sm:pt-0">
        {!currentUser ? (
          /* LOGIN REQUIRED */
          <div className="text-center py-10 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-full bg-gold-400/10 border border-gold-400 text-gold-400 flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-2">سجل الدخول لإتمام طلبك</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-5">
              يلزم تسجيل الدخول لحفظ عنوان التوصيل وربط الطلب بحسابك ومتابعته لاحقاً من صفحة الملف الشخصي.
            </p>
            <button
              onClick={onRequireLogin}
              className="bg-gold-400 hover:bg-gold-500 text-dark-bg font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              تسجيل الدخول / إنشاء حساب
            </button>
          </div>
        ) : step === 'success' ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500 text-green-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mb-1">تم إرسال وتسجيل طلبك بنجاح!</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
              لقد قمنا بتسجيل الطلب في لوحة التحكم، ويمكنك متابعة حالته من صفحة الملف الشخصي، وفتحنا محادثة واتساب لتأكيد الشحن وتفاصيل الألوان.
            </p>

            {/* Receipt card */}
            <div className="max-w-md mx-auto bg-dark-card border border-dark-border rounded-xl p-4 text-right mb-6">
              <div className="flex justify-between items-center pb-2.5 border-b border-dark-border/60 mb-3 text-[10px] font-bold text-gray-400">
                <span>رقم الطلب: <span className="text-white font-mono">{createdOrder?.orderNumber || createdOrder?.id}</span></span>
                <span>التاريخ: {createdOrderDateLabel}</span>
              </div>

              <div className="space-y-1.5 mb-3 text-xs">
                <p className="text-gray-400">اسم المستلم: <span className="text-white font-bold">{displayUserFullName}</span></p>
                <p className="text-gray-400">رقم الهاتف: <span className="text-white font-bold font-mono">{currentUser.phone}</span></p>
                {selectedAddress && (
                  <p className="text-gray-400">عنوان التوصيل: <span className="text-white font-bold">{selectedAddress.title} - {selectedAddress.city}, {selectedAddress.street}</span></p>
                )}
                <p className="text-gray-400">طريقة الدفع: <span className="text-gold-500 font-bold">{paymentMethodLabel()}</span></p>
              </div>

              <div className="border-t border-dark-border/40 pt-3 space-y-2 text-xs">
                {processingFee > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>رسوم معالجة الدفع:</span>
                    <span className="text-gray-200 font-bold font-mono">{formatPrice(processingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-black pt-2 text-gold-500">
                  <span>المبلغ الإجمالي الكلي:</span>
                  <span>{formatPrice(displayTotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-dark-bg font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl mx-auto transition-colors"
            >
              <span>العودة للمتجر الرئيسي</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* DETAILS STEP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start mt-2 sm:mt-4">

            {/* Form Column */}
            <div className="lg:col-span-7">
              <h4 className="text-xs sm:text-sm font-bold text-white mb-3">عنوان التوصيل وطريقة الدفع:</h4>

              <form onSubmit={handleConfirmOrder} className="space-y-4 text-right">
                {/* Address selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5">
                      <MapPin size={13} className="text-gold-500" />
                      عنوان التوصيل *
                    </label>
                    {addresses.length > 0 && !createdOrder && (
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress((prev) => !prev)}
                        className="text-[10px] font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1"
                      >
                        <Plus size={12} />
                        {isAddingAddress ? "إلغاء" : "إضافة عنوان جديد"}
                      </button>
                    )}
                  </div>

                  {isLoadingAddresses ? (
                    <PageState variant="loading" title="جاري تحميل العناوين المحفوظة..." className="p-4" />
                  ) : addressesError ? (
                    <InlineBanner tone="error" message={addressesError} />
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? "border-gold-400 bg-gold-400/10"
                              : "border-dark-border bg-dark-card hover:border-gold-400/40"
                          } ${createdOrder ? "opacity-60 pointer-events-none" : ""}`}
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            className="mt-0.5 accent-gold-400"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            disabled={Boolean(createdOrder)}
                          />
                          <span className="space-y-0.5">
                            <span className="block font-bold text-gray-200">
                              {address.title}
                              {address.is_default && <span className="mr-1.5 text-[9px] text-gold-500">(افتراضي)</span>}
                            </span>
                            <span className="block text-gray-500">{address.country} - {address.city}, {address.street}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {shouldShowAddressForm && !createdOrder && (
                    <div className="rounded-xl border border-dark-border bg-dark-card p-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-bold block">عنوان مختصر (Home/Office) *</label>
                          <input
                            type="text"
                            value={addressForm.title}
                            onChange={(e) => handleAddressFieldChange("title", e.target.value)}
                            className={`w-full bg-dark-bg border rounded-lg py-2 px-3 text-xs text-white focus:outline-none ${addressFieldErrors.title ? "border-red-500" : "border-dark-border focus:border-gold-400"}`}
                          />
                          {addressFieldErrors.title && <p className="text-[10px] font-bold text-red-500">{addressFieldErrors.title}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-bold block">المحافظة / المدينة *</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => handleAddressFieldChange("city", e.target.value)}
                            className={`w-full bg-dark-bg border rounded-lg py-2 px-3 text-xs text-white focus:outline-none ${addressFieldErrors.city ? "border-red-500" : "border-dark-border focus:border-gold-400"}`}
                          />
                          {addressFieldErrors.city && <p className="text-[10px] font-bold text-red-500">{addressFieldErrors.city}</p>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold block">الدولة *</label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => handleAddressFieldChange("country", e.target.value)}
                          className={`w-full bg-dark-bg border rounded-lg py-2 px-3 text-xs text-white focus:outline-none ${addressFieldErrors.country ? "border-red-500" : "border-dark-border focus:border-gold-400"}`}
                        />
                        {addressFieldErrors.country && <p className="text-[10px] font-bold text-red-500">{addressFieldErrors.country}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold block">الشارع بالتفصيل *</label>
                        <input
                          type="text"
                          placeholder="الشارع، الدور، علامة مميزة..."
                          value={addressForm.street}
                          onChange={(e) => handleAddressFieldChange("street", e.target.value)}
                          className={`w-full bg-dark-bg border rounded-lg py-2 px-3 text-xs text-white focus:outline-none ${addressFieldErrors.street ? "border-red-500" : "border-dark-border focus:border-gold-400"}`}
                        />
                        {addressFieldErrors.street && <p className="text-[10px] font-bold text-red-500">{addressFieldErrors.street}</p>}
                      </div>
                      <button
                        type="button"
                        disabled={isSavingAddress}
                        onClick={handleAddAddressSubmit}
                        className="w-full bg-gold-400/10 border border-gold-400 text-gold-400 hover:bg-gold-400/20 rounded-lg py-2 text-xs font-bold disabled:opacity-60"
                      >
                        {isSavingAddress ? "جاري الحفظ..." : "حفظ العنوان واستخدامه"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment method */}
                <div className="pt-1">
                  <label className="text-[10px] text-gray-400 font-bold block mb-2">طريقة الدفع:</label>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gold-400 bg-gold-500/10 text-gold-500">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={16} />
                      <Coins size={16} />
                    </div>
                    <span className="text-xs font-bold">دفع إلكتروني عبر Paymob (فيزا / ماستركارد / محفظة)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block">ملاحظات إضافية (اختياري - لا تُحفظ مع الطلب، تُرسل عبر واتساب فقط)</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: أرغب في تنجيد كراسي الحلاقة بالجلد الطبيعي البني الفاتح..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none resize-none"
                  />
                </div>

                {createdOrder && (
                  <p className="text-[10px] text-gold-400 font-bold text-center bg-gold-400/5 border border-gold-400/30 rounded-lg py-2">
                    تم إنشاء الطلب رقم {createdOrder.orderNumber || createdOrder.id} بنجاح، أكمل الدفع الإلكتروني لإتمام العملية.
                  </p>
                )}

                {errorMessage && <InlineBanner tone="error" message={errorMessage} />}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-dark-bg font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    <span>{confirmButtonLabel}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Receipt Summary Column */}
            <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-5 lg:sticky lg:top-0">
              <h4 className="text-[10px] font-bold text-gray-400 mb-3 pb-2 border-b border-dark-border/40">ملخص سلة الشراء:</h4>

              <div className="space-y-2.5 max-h-36 sm:max-h-44 overflow-y-auto mb-3 pr-1">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-gray-500">سلة الشراء فارغة حالياً.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={getCartLineKey(item)} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 block truncate max-w-[150px]">
                        {item.product_name}
                        {describeCartItemVariant(item) && (
                          <span className="text-gray-500"> ({describeCartItemVariant(item)})</span>
                        )}
                      </span>
                      <span className="text-gold-400 font-bold font-mono">
                        {item.quantity} x {formatPrice(getCartItemUnitPrice(item))}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-dark-border/40 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span className="text-gray-200 font-bold font-mono">{formatPrice(subtotal)}</span>
                </div>
                {processingFee > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>رسوم معالجة الدفع:</span>
                    <span className="text-gray-200 font-bold font-mono">{formatPrice(processingFee)}</span>
                  </div>
                )}
                <hr className="border-dark-border my-1" />
                <div className="flex justify-between text-sm sm:text-base font-black text-gold-500 pt-1">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono">{formatPrice(displayTotal)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-dark-bg border border-dark-border/60 text-[9px] text-gray-500 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 justify-start">
                  <ClipboardCheck size={12} className="text-gold-400 shrink-0" />
                  <span>تأكيد المبيعات فوري عبر واتساب وهاتف</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <Calendar size={12} className="text-gold-400 shrink-0" />
                  <span>شحن وتثبيت فني للصالونات خلال 48 ساعة</span>
                </div>
              </div>
            </div>

          </div>
        )}
        </div>

      </div>
    </div>
  );
}
