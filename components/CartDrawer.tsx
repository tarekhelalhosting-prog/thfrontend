"use client";
import React, { useMemo } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Gift } from "lucide-react";
import { CartItem, Offer, Product } from "../src/types";
import { getCartLineKey, getCartItemUnitPrice, getCartItemImage, describeCartItemVariant } from "../src/lib/cart";
import { getCartGiftPreviews } from "../src/lib/product-offers";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  offers?: Offer[];
  products?: Product[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  offers = [],
  products = [],
}: CartDrawerProps) {
  const earnedGifts = useMemo(
    () => getCartGiftPreviews(cartItems, offers, products),
    [cartItems, offers, products]
  );

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + getCartItemUnitPrice(item) * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex pr-0 sm:pr-10">
        <div className="w-screen max-w-md bg-dark-bg border-r border-dark-border shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-gold-400 w-5 h-5" />
              <h3 className="text-base sm:text-lg font-black text-white">سلة المشتريات</h3>
              <span className="bg-gold-400/10 text-gold-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
              title="إغلاق السلة"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-gray-500 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="text-sm font-bold text-gray-300">السلة فارغة حالياً</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  تصفح المنتجات وأضف ما تحتاجه لصالونك للبدء في طلب معداتك.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 text-xs font-bold text-gold-400 hover:text-gold-300 border-b border-gold-400"
                >
                  العودة للتسوق
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const lineKey = getCartLineKey(item);
                const variantDescription = describeCartItemVariant(item);
                const unitPrice = getCartItemUnitPrice(item);
                return (
                <div
                  key={lineKey}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-xl bg-dark-card border border-dark-border"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-dark-border bg-white shrink-0">
                    <img
                      src={getCartItemImage(item)}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-right">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-200 line-clamp-1">
                      {item.product_name}
                    </h4>
                    {variantDescription && (
                      <span className="text-[10px] text-gray-500 mt-0.5 block">
                        {variantDescription}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gold-400 mt-1 block">
                      {formatPrice(unitPrice)}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(lineKey, -1)}
                          className="p-1 text-gray-400 hover:text-white"
                          title="تقليل الكمية"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs text-gray-200 font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(lineKey, 1)}
                          className="p-1 text-gray-400 hover:text-white"
                          title="زيادة الكمية"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Delete Icon */}
                      <button
                        onClick={() => onRemoveItem(lineKey)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="حذف المنتج من السلة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Individual Item Subtotal */}
                  <div className="text-left font-bold text-xs text-gray-200 shrink-0 pt-0.5 sm:pt-0">
                    <span className="hidden sm:inline">{formatPrice(unitPrice * item.quantity)}</span>
                    <span className="sm:hidden text-[10px]">{formatPrice(unitPrice * item.quantity)}</span>
                  </div>
                </div>
                );
              })
            )}

            {earnedGifts.map((gift) => {
              const giftProduct = products.find((product) => product.id === gift.productId);
              const giftVariant = giftProduct?.variants?.find((variant) => variant.id === gift.variantId);
              const giftImage = giftVariant?.media_url || giftProduct?.image;
              const giftName = gift.productName === "هدية مجانية" ? giftProduct?.name || gift.productName : gift.productName;

              return (
                <div key={`${gift.offerId}-${gift.variantId ?? gift.productId}`} className="flex items-start gap-3 sm:gap-4 rounded-xl border border-emerald-400/40 bg-emerald-50 p-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-400/30 bg-white sm:h-16 sm:w-16">
                    {giftImage ? (
                      <img src={giftImage} alt={giftName} className="h-full w-full object-contain" />
                    ) : (
                      <Gift size={22} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700">
                      <Gift size={13} />
                      <span>هدية مجانية من عرض {gift.offerName}</span>
                    </div>
                    <h4 className="mt-1 text-xs font-bold text-emerald-950">{giftName}</h4>
                    {gift.variantDescription ? <span className="mt-0.5 block text-[10px] text-emerald-700">{gift.variantDescription}</span> : null}
                    <span className="mt-1 block text-xs font-black text-emerald-700">مجاني {gift.quantity > 1 ? `x ${gift.quantity}` : ""}</span>
                  </div>
                  <span className="shrink-0 pt-0.5 text-xs font-black text-emerald-700">0 جنيه</span>
                </div>
              );
            })}
          </div>

          {/* Footer Totals */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-dark-border bg-dark-card">
              <div className="space-y-2 text-xs sm:text-sm mb-6">
                <div className="flex justify-between text-gray-200">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-gray-200">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex text-xs justify-between text-gray-500 leading-relaxed">
                  <span>تكاليف الشحن تقدر من خلال الوكيل الخاص بمنطقتك</span>
                </div>

                <hr className="border-dark-border my-2" />

                <div className="flex justify-between text-base font-black">
                  <span className="text-white">الإجمالي الكلي:</span>
                  <span className="text-gold-400">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-dark-bg font-extrabold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>تأكيد وإتمام الطلب</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
