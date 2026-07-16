import React, { useState } from "react";
import { Sparkles, ArrowLeft, Phone, ShoppingCart, CheckCircle, Shield } from "lucide-react";
import { Product, SalonBundle } from "../src/types";

interface SpecialOffersProps {
  products: Product[];
  bundles: SalonBundle[];
  onAddToCart: (p: Product) => void;
  onBundleOrder: (b: SalonBundle) => void;
  onViewProduct: (p: Product) => void;
}

export default function SpecialOffers({
  products,
  bundles,
  onAddToCart,
  onBundleOrder,
  onViewProduct
}: SpecialOffersProps) {
  const [selectedBundleTab, setSelectedBundleTab] = useState(bundles[0]?.id || "b1");

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  const activeBundle = bundles.find(b => b.id === selectedBundleTab) || bundles[0];

  // Get some promotional products (not necessarily marked best sellers)
  const promoProducts = products.filter(p => !p.isBestSeller).slice(0, 5);

  return (
    <section className="py-12 bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Special Offers (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-6 bg-gold-400 rounded-full" />
                <h3 className="text-xl font-black text-white">عروض وتخفيضات مميزة</h3>
              </div>

              {/* Promo List */}
              <div className="flex flex-col gap-4">
                {promoProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onViewProduct(prod)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-dark-bg border border-dark-border/60 hover:border-gold-400/40 transition-all cursor-pointer group"
                  >
                    {/* Tiny Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-dark-border">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Product Name & Pricing */}
                    <div className="flex-1 text-right">
                      <span className="bg-gold-400/10 text-gold-400 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        {prod.discountBadge || "خصم مميز"}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-200 mt-1.5 group-hover:text-gold-400 transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-black text-gold-400">
                          {formatPrice(prod.price)}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-gray-500 line-through font-bold">
                            {formatPrice(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart quick button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(prod);
                      }}
                      className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-300 hover:bg-gold-400 hover:text-dark-bg transition-colors"
                      title="إضافة سريعة للسلة"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gold-400/5 border border-gold-400/10 flex items-center gap-3">
              <Shield className="text-gold-400 shrink-0" size={24} />
              <div className="text-right">
                <h5 className="text-xs font-bold text-gold-400">ضمان وكلاء معتمدين</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">نوفر قطع غيار أصلية وصيانة دورية لجميع الأجهزة الكبيرة.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Salon Setup Bundles (7 columns) */}
          <div className="lg:col-span-7 bg-dark-bg border border-dark-border p-6 rounded-2xl flex flex-col justify-between">
            {activeBundle ? (
              <>
                <div>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-dark-border/40">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-gold-400" size={20} />
                      <h3 className="text-xl font-black text-white">جهز صالونك بالكامل</h3>
                    </div>
                    
                    {/* Bundle Tabs */}
                    {bundles.length > 1 && (
                      <div className="flex bg-dark-card border border-dark-border p-1 rounded-xl">
                        {bundles.map((bundle) => (
                          <button
                            key={bundle.id}
                            onClick={() => setSelectedBundleTab(bundle.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedBundleTab === bundle.id ? 'bg-gold-400 text-dark-bg' : 'text-gray-400 hover:text-white'}`}
                          >
                            {bundle.badge || bundle.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Bundle content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Details side (7 cols) */}
                    <div className="md:col-span-7 text-right">
                      <span className="text-xs font-bold text-gold-400 tracking-wider">وفر الكثير مع باقات طارق هلال</span>
                      <h4 className="text-lg font-extrabold text-white mt-1 mb-2">
                        {activeBundle.name}
                      </h4>
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        {activeBundle.description}
                      </p>

                      {/* List of items included in the bundle */}
                      {activeBundle.itemsList && activeBundle.itemsList.length > 0 && (
                        <>
                          <h5 className="text-xs font-bold text-gray-200 mb-2">محتويات الباقة بالتفصيل:</h5>
                          <ul className="flex flex-col gap-2 mb-6">
                            {activeBundle.itemsList.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                <CheckCircle size={14} className="text-gold-400 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    {/* Picture side (5 cols) */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="w-full aspect-[4/3] md:aspect-square rounded-xl overflow-hidden border border-dark-border mb-4 bg-dark-card shadow-lg">
                        <img
                          src={activeBundle.image}
                          alt={activeBundle.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Price info for active bundle */}
                      <div className="text-center bg-dark-card p-4 rounded-xl border border-dark-border w-full">
                        <span className="text-[10px] text-gray-500 font-bold block">سعر التأسيس الخاص</span>
                        <div className="flex items-baseline justify-center gap-2 mt-1">
                          <span className="text-xl font-black text-gold-400">
                            {formatPrice(activeBundle.price)}
                          </span>
                          {activeBundle.originalPrice && (
                            <span className="text-xs text-gray-500 line-through font-semibold">
                              {formatPrice(activeBundle.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Order/Checkout CTA Button */}
                <div className="mt-8 pt-4 border-t border-dark-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold">باقات التجهيز تشمل</p>
                    <p className="text-xs text-gray-300 font-semibold">توصيل وتركيب مجاني بواسطة مهندسينا المختصين</p>
                  </div>

                  <button
                    onClick={() => onBundleOrder(activeBundle)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-dark-bg font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
                  >
                    <span>طلب باقة التجهيز الآن</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
                  <Sparkles size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-white">باقات تأسيس الصالونات المتكاملة</h4>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                    لا تتوفر باقات جاهزة حالياً في هذا القسم. متجرنا مهيأ للربط بالـ API واستيراد الباقات الحية فوراً!
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
                    window.open(`https://wa.me/201501593962?text=${text}`, "_blank");
                  }}
                  className="flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-dark-bg font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  <span>صمم باقتك المخصصة عبر واتساب</span>
                  <Phone size={14} />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
