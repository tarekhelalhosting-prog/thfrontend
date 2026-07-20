"use client";
import React, { useState } from "react";
import { X, CheckCircle2, Phone, Calendar, ArrowRight, ClipboardCheck, CreditCard, ShieldAlert, Coins } from "lucide-react";
import { CartItem, SalonBundle, Order, User } from "../src/types";
import { getCartLineKey, getCartItemUnitPrice, describeCartItemVariant } from "../src/lib/cart";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedBundle: SalonBundle | null;
  onClearCart: () => void;
  currentUser: User | null;
  onOrderSuccess: (order: Order) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  selectedBundle,
  onClearCart,
  currentUser,
  onOrderSuccess
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const displayUserFullName = currentUser 
    ? `${currentUser.first_name} ${currentUser.last_name}`.trim() 
    : "";

  const [formData, setFormData] = useState({
    name: displayUserFullName,
    phone: currentUser?.phone || "",
    city: "الدقهلية",
    address: "",
    notes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');
  const [paymentStep, setPaymentStep] = useState<'form' | 'paymob_processing' | 'success'>('form');
  const [paymobData, setPaymobData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    walletNumber: ""
  });

  const [generatedOrderNo, setGeneratedOrderNo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  // Calculations
  const subtotal = selectedBundle 
    ? selectedBundle.price 
    : cartItems.reduce((acc, item) => acc + getCartItemUnitPrice(item) * item.quantity, 0);
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymobData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      setErrorMessage("الرجاء ملء جميع الحقول المطلوبة للتوصيل.");
      return;
    }
    setErrorMessage("");

    if (paymentMethod === 'cod') {
      processOrder('pending', 'cod');
    } else {
      setPaymentStep('paymob_processing');
    }
  };

  const simulatePaymobPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      if (!paymobData.cardNumber || !paymobData.cardExpiry || !paymobData.cardCvv) {
        setErrorMessage("الرجاء إدخال بيانات بطاقة الائتمان كاملة.");
        return;
      }
    } else if (paymentMethod === 'wallet') {
      if (!paymobData.walletNumber) {
        setErrorMessage("الرجاء إدخال رقم محفظة الهاتف المحمول.");
        return;
      }
    }

    setErrorMessage("");
    // Simulate Paymob request latency
    const loader = document.getElementById("paymob-button-loader");
    if (loader) loader.classList.remove("hidden");

    setTimeout(() => {
      processOrder('paid', paymentMethod);
    }, 2000);
  };

  const processOrder = (paymentStatus: 'pending' | 'paid', method: 'cod' | 'card' | 'wallet') => {
    const orderNo = "TH-" + Math.floor(100000 + Math.random() * 900000);
    setGeneratedOrderNo(orderNo);

    const items = selectedBundle 
      ? [{
          productId: selectedBundle.id,
          productName: selectedBundle.name,
          variantId: null as string | null,
          variantDescription: "",
          price: selectedBundle.price,
          quantity: 1
        }]
      : cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          variantId: item.selectedVariant?.id || null,
          variantDescription: describeCartItemVariant(item),
          price: getCartItemUnitPrice(item),
          quantity: item.quantity
        }));

    // Django + UI compatibility Order mapping
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: currentUser?.id || null,
      address_id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      subtotal: subtotal,
      discount: 0,
      total: total,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // UI compatibility fields
      orderNumber: orderNo,
      customerName: formData.name,
      customerPhone: formData.phone,
      city: formData.city,
      address: formData.address,
      items: items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        order_id: orderNo,
        product_variant_id: item.variantId || item.productId,
        product_name: item.productName,
        variant_description: item.variantDescription || "Default",
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      payment: {
        id: Math.random().toString(36).substr(2, 9),
        order_id: orderNo,
        provider: 'Paymob',
        transaction_id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
        status: paymentStatus === 'paid' ? 'Paid' : 'Pending',
        amount: total,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null
      }
    };

    // Callback to App level database
    onOrderSuccess(newOrder);

    // Format WhatsApp message to send as fallback confirmation
    let messageText = `*طلب جديد من متجر طارق هلال لمستحضرات التجميل وتجهيز الصالونات*\n`;
    messageText += `-------------------------------------------\n`;
    messageText += `*رقم الطلب:* ${orderNo}\n`;
    messageText += `*اسم العميل:* ${formData.name}\n`;
    messageText += `*الهاتف:* ${formData.phone}\n`;
    messageText += `*المحافظة/المدينة:* ${formData.city}\n`;
    messageText += `*العنوان:* ${formData.address}\n`;
    messageText += `*طريقة الدفع:* ${method === 'card' ? 'فيزا/ماستركارد (Paymob)' : method === 'wallet' ? 'محفظة إلكترونية (Paymob)' : 'الدفع عند الاستلام'}\n`;
    messageText += `*حالة الدفع:* ${paymentStatus === 'paid' ? 'تم الدفع بنجاح ✅' : 'قيد الانتظار ⏳'}\n`;
    if (formData.notes) {
      messageText += `*ملاحظات:* ${formData.notes}\n`;
    }
    messageText += `-------------------------------------------\n`;
    messageText += `*المنتجات المطلوبة:*\n`;

    if (selectedBundle) {
      messageText += `- ${selectedBundle.name} (عدد 1) بسعر: ${formatPrice(selectedBundle.price)}\n`;
    } else {
      cartItems.forEach((item, index) => {
        messageText += `${index + 1}. ${item.product.name} (الكمية: ${item.quantity}) - بسعر: ${formatPrice(getCartItemUnitPrice(item) * item.quantity)}\n`;
      });
    }

    messageText += `-------------------------------------------\n`;
    messageText += `*المجموع الفرعي:* ${formatPrice(subtotal)}\n`;
    messageText += `*تكاليف الشحن:* تقدر من خلال الوكيل الخاص بمنطقتك\n`;
    messageText += `*الإجمالي الكلي:* ${formatPrice(total)}\n`;
    messageText += `-------------------------------------------\n`;
    messageText += `_تم تسجيل طلبكم آلياً في لوحة التحكم الخاصة بمعارض طارق هلال._`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappURL = `https://wa.me/201501593962?text=${encodedMessage}`;

    // Open WhatsApp
    try {
      window.open(whatsappURL, "_blank");
    } catch (err) {
      console.log("Could not open WhatsApp window", err);
    }

    setPaymentStep('success');
  };

  const handleFinish = () => {
    onClearCart();
    onClose();
    setPaymentStep('form');
    setFormData({
      name: displayUserFullName,
      phone: currentUser?.phone || "",
      city: "الدقهلية",
      address: "",
      notes: ""
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />

      <div className="relative w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90dvh] bg-dark-bg border border-dark-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden z-10 p-4 sm:p-7 animate-in fade-in zoom-in-95 duration-200 text-right font-sans flex flex-col">
        
        {/* Close Button */}
        {paymentStep !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto pt-10 sm:pt-0">
        {paymentStep === 'success' ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500 text-green-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white mb-1">تم إرسال وتسجيل طلبك بنجاح!</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
              لقد قمنا بتسجيل الطلب في لوحة التحكم وتجهيز الفاتورة، وفتحنا محادثة واتساب لتأكيد الشحن وتفاصيل الألوان.
            </p>

            {/* Receipt card */}
            <div className="max-w-md mx-auto bg-dark-card border border-dark-border rounded-xl p-4 text-right mb-6">
              <div className="flex justify-between items-center pb-2.5 border-b border-dark-border/60 mb-3 text-[10px] font-bold text-gray-400">
                <span>رقم الطلب: <span className="text-white font-mono">{generatedOrderNo}</span></span>
                <span>التاريخ: {new Date().toLocaleDateString("ar-EG")}</span>
              </div>

              <div className="space-y-1.5 mb-3 text-xs">
                <p className="text-gray-400">اسم المستلم: <span className="text-white font-bold">{formData.name}</span></p>
                <p className="text-gray-400">رقم الهاتف: <span className="text-white font-bold font-mono">{formData.phone}</span></p>
                <p className="text-gray-400">عنوان التوصيل: <span className="text-white font-bold">{formData.city} - {formData.address}</span></p>
                <p className="text-gray-400">طريقة الدفع: <span className="text-gold-500 font-bold">
                  {paymentMethod === 'card' ? 'فيزا/ماستركارد (دفع إلكتروني)' : paymentMethod === 'wallet' ? 'محفظة هاتف إلكترونية' : 'الدفع نقداً عند الاستلام'}
                </span></p>
              </div>

              <div className="border-t border-dark-border/40 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span className="text-gray-200 font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>تكلفة الشحن والتوصيل:</span>
                  <span className="text-gray-200 font-bold">تكاليف الشحن تقدر من خلال الوكيل الخاص بمنطقتك</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black pt-2 border-t border-dark-border/20 text-gold-500">
                  <span>المبلغ الإجمالي الكلي:</span>
                  <span>{formatPrice(total)}</span>
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
        ) : paymentStep === 'paymob_processing' ? (
          /* PAYMOB DYNAMIC FORM */
          <div className="py-1 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-dark-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-gold-500">
                <Coins size={20} />
                <h3 className="text-sm sm:text-base font-black text-white">بوابة دفع Paymob الآمنة</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">المبلغ المطلوب: {formatPrice(total)}</span>
            </div>

            <form onSubmit={simulatePaymobPayment} className="max-w-md mx-auto space-y-4">
              {paymentMethod === 'card' ? (
                <div className="space-y-3.5 bg-dark-card border border-dark-border p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200">الدفع بالبطاقة الائتمانية</span>
                    <CreditCard className="text-gold-500 w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">رقم البطاقة (16 رقم) *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={paymobData.cardNumber}
                      onChange={handlePaymobInputChange}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-lg py-2 px-3 text-xs text-white text-left font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">تاريخ الانتهاء (MM/YY) *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        placeholder="12/28"
                        maxLength={5}
                        value={paymobData.cardExpiry}
                        onChange={handlePaymobInputChange}
                        className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-lg py-2 px-3 text-xs text-white text-center font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">الرمز السري (CVV) *</label>
                      <input
                        type="password"
                        name="cardCvv"
                        required
                        maxLength={3}
                        placeholder="123"
                        value={paymobData.cardCvv}
                        onChange={handlePaymobInputChange}
                        className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-lg py-2 px-3 text-xs text-white text-center font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-dark-card border border-dark-border p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200">الدفع عبر المحفظة الإلكترونية</span>
                    <Coins className="text-gold-500 w-5 h-5" />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    ادفع مباشرة من رصيد محفظتك (فودافون كاش، أورنج كاش، اتصالات كاش، إلخ) وسيتم إرسال طلب تأكيد فوري لهاتفك.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">رقم محفظة الهاتف المحمول *</label>
                    <input
                      type="tel"
                      name="walletNumber"
                      required
                      placeholder="01012345678"
                      value={paymobData.walletNumber}
                      onChange={handlePaymobInputChange}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-lg py-2 px-3 text-xs text-white text-left font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="text-red-500 text-xs font-bold text-center">{errorMessage}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('form')}
                  className="bg-dark-card border border-dark-border text-gray-400 hover:text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  تعديل بيانات التوصيل
                </button>
                <button
                  type="submit"
                  className="bg-gold-400 hover:bg-gold-500 text-dark-bg py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <span id="paymob-button-loader" className="hidden w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></span>
                  <span>إتمام الدفع الآمن {formatPrice(total)}</span>
                </button>
              </div>

              <p className="text-[9px] text-gray-500 text-center leading-relaxed mt-2 flex items-center justify-center gap-1">
                <span>🔒 معتمد ومحمي بالكامل بشهادة سكيوريت وبوابة معالجة Paymob مصر.</span>
              </p>
            </form>
          </div>
        ) : (
          /* FORM STEP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start mt-2 sm:mt-4">
            
            {/* Form Column */}
            <div className="lg:col-span-7">
              <h4 className="text-xs sm:text-sm font-bold text-white mb-3">تفاصيل مالك الصالون وبيانات الشحن:</h4>
              
              <form onSubmit={handleFormSubmit} className="space-y-3 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block">الاسم بالكامل لمالك الصالون أو الكوافير *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="مثال: طارق هلال"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">رقم الهاتف للاتصال والواتساب *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="01001234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white text-right font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">المحافظة والمدينة *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="الدقهلية - المنصورة"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block">عنوان الصالون بالتفصيل والشارع *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="الشارع، الدور، بجوار كافيه أو علامة مميزة لتسهيل النقل..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block">ملاحظات أو مواصفات خاصة بالألوان (اختياري)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="مثال: أرغب في تنجيد كراسي الحلاقة بالجلد الطبيعي البني الفاتح..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-dark-border focus:border-gold-500 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:outline-none resize-none"
                  />
                </div>

                {/* Choose Payment Method */}
                <div className="pt-2">
                  <label className="text-[10px] text-gray-400 font-bold block mb-2">طريقة الدفع المناسبة لك:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${paymentMethod === 'card' ? 'bg-gold-500/10 border-gold-400 text-gold-500' : 'bg-dark-card border-dark-border text-gray-400 hover:text-white'}`}
                    >
                      <CreditCard size={18} className="mb-1" />
                      <span className="text-xs font-bold">فيزا / ماستركارد</span>
                      <span className="text-[8px] text-gold-500 font-bold mt-0.5">عبر بوابة Paymob</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${paymentMethod === 'wallet' ? 'bg-gold-500/10 border-gold-400 text-gold-500' : 'bg-dark-card border-dark-border text-gray-400 hover:text-white'}`}
                    >
                      <Coins size={18} className="mb-1" />
                      <span className="text-xs font-bold">محفظة إلكترونية</span>
                      <span className="text-[8px] text-gold-500 font-bold mt-0.5">فودافون كاش / Paymob</span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-xs font-bold text-center">{errorMessage}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-dark-bg font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm"
                  >
                    <span> تأكيد الطلب </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Receipt Summary Column */}
            <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-5 lg:sticky lg:top-0">
              <h4 className="text-[10px] font-bold text-gray-400 mb-3 pb-2 border-b border-dark-border/40">ملخص سلة الشراء:</h4>

              <div className="space-y-2.5 max-h-36 sm:max-h-44 overflow-y-auto mb-3 pr-1">
                {selectedBundle ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-bold block truncate max-w-[150px]">{selectedBundle.name}</span>
                    <span className="text-gold-400 font-bold font-mono">1 x {formatPrice(selectedBundle.price)}</span>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={getCartLineKey(item)} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 block truncate max-w-[150px]">
                        {item.product.name}
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
                <hr className="border-dark-border my-1" />
                <div className="flex justify-between text-sm sm:text-base font-black text-gold-500 pt-1">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono">{formatPrice(total)}</span>
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
