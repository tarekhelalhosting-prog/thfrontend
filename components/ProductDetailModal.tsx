"use client";
import React, { useState } from "react";
import { X, Star, ShoppingCart, CheckCircle, ShieldCheck, HelpCircle, Users } from "lucide-react";
import { Product } from "../src/types";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product, qty: number) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const ratingValue = product.rating ?? 5;
  const reviewsCount = product.reviewsCount ?? 0;
  const originalPrice = product.originalPrice;

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    window.open(`https://wa.me/201021750655?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-dark-bg border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
          title="إغلاق النافذة"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-4">
          
          {/* Image Side (5 Cols) */}
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-dark-border bg-dark-card shadow-inner">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {product.discountBadge && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-gold-400 to-gold-600 text-dark-bg font-black text-xs px-3 py-1.5 rounded-xl">
                  {product.discountBadge}
                </div>
              )}
            </div>

            {/* Micro badges below image */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-dark-card border border-dark-border rounded-xl text-center flex flex-col items-center">
                <ShieldCheck size={20} className="text-gold-400 mb-1" />
                <span className="text-[10px] sm:text-xs text-gray-200 font-bold">ضمان عامين كاملين</span>
              </div>
              <div className="p-3 bg-dark-card border border-dark-border rounded-xl text-center flex flex-col items-center">
                <Users size={20} className="text-gold-400 mb-1" />
                <span className="text-[10px] sm:text-xs text-gray-200 font-bold">قطع غيار متوفرة</span>
              </div>
            </div>
          </div>

          {/* Details Content Side (7 Cols) */}
          <div className="md:col-span-7 text-right">
            
            {/* Tag / Category */}
            <span className="bg-gold-400/10 text-gold-400 text-xs font-bold px-3 py-1 rounded-lg">
              {product.category === 'barber-chairs' ? 'كراسي حلاقة احترافية' : 
               product.category === 'women-chairs' ? 'كراسي صالون نسائي' :
               product.category === 'shampoo-units' ? 'مغاسل شعر فخمة' :
               product.category === 'mirrors' ? 'مرايا صالونات مضيئة' : 'أجهزة وإكسسوارات'}
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white mt-4 mb-2">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-4 justify-start">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(ratingValue) ? "currentColor" : "none"}
                    className="currentColor"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-bold">
                {reviewsCount} تقييم حقيقي من أصحاب الصالونات
              </span>
            </div>

            {/* Price Line */}
            <div className="flex items-baseline gap-3 mb-6 bg-dark-card p-4 rounded-xl border border-dark-border">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold mb-1">سعر العرض الحقيقي</span>
                <span className="text-2xl font-black text-gold-400">
                  {formatPrice(product.price)}
                </span>
              </div>
              {originalPrice && (
                <div className="flex flex-col text-gray-500 line-through">
                  <span className="text-[10px] text-gray-500 font-bold mb-1">السعر الأصلي</span>
                  <span className="text-sm font-bold">
                    {formatPrice(originalPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Key Features/Specs List */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs sm:text-sm font-bold text-white mb-2.5">المواصفات الفنية والمميزات:</h4>
                <ul className="flex flex-col gap-2">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle size={14} className="text-gold-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Order / Add to Cart Actions row */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-dark-border/40">
              
              {/* Quantity input */}
              <div className="flex items-center border border-dark-border bg-dark-card rounded-xl p-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-gray-400 hover:text-white text-lg font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm text-gray-100 font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-gray-400 hover:text-white text-lg font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-500 text-dark-bg font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg transition-colors"
              >
                <ShoppingCart size={16} />
                <span>إضافة إلى سلة المشتريات</span>
              </button>

              {/* WhatsApp direct click */}
              <button
                onClick={handleWhatsAppInquiry}
                className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 hover:border-gold-400 text-white font-bold text-xs py-3.5 px-5 rounded-xl transition-all"
              >
                <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2.004 6.477 2.004 12C2.004 13.763 2.463 15.42 3.264 16.862L2 21.5L6.772 20.248C8.163 21.004 9.743 21.438 11.417 21.438C12.004 21.438 12.004 21.438 12.004 21.438C17.524 21.438 22.004 16.96 22.004 11.438C22.004 5.915 17.527 2.001 12.004 2ZM17.204 15.71C16.994 16.302 15.984 16.797 15.384 16.869C14.884 16.924 14.284 16.96 12.304 16.159C9.764 15.129 8.114 12.512 7.984 12.342C7.864 12.172 6.964 10.965 6.964 9.715C6.964 8.465 7.614 7.852 7.854 7.611C8.094 7.37 8.374 7.31 8.544 7.31H9.034C9.194 7.31 9.404 7.3 9.604 7.747C9.814 8.212 10.314 9.497 10.384 9.627C10.454 9.757 10.494 9.907 10.404 10.072C10.324 10.237 10.274 10.332 10.154 10.482C10.034 10.632 9.894 10.812 9.784 10.922C9.664 11.042 9.534 11.172 9.684 11.427C9.834 11.682 10.344 12.507 11.084 13.172C12.044 14.027 12.844 14.3 13.114 14.412C13.384 14.524 13.544 14.492 13.694 14.327C13.844 14.162 14.334 13.592 14.504 13.342C14.674 13.092 14.844 13.132 15.084 13.222C15.324 13.312 16.854 14.072 17.174 14.232C17.494 14.392 17.704 14.472 17.784 14.612C17.864 14.752 17.864 15.385 17.204 15.71Z" fill="currentColor"/>
                </svg>
                <span>استفسار واتساب</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
