"use client";
import React from "react";
import { Gift, ShoppingCart, Sparkles } from "lucide-react";
import { Product } from "../src/types";
import { getOfferComponents } from "../src/lib/offer-category";

interface OffersShowcaseProps {
  offers: Product[];
  onViewOffer: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-EG") + " جنيه";
}

export default function OffersShowcase({ offers, onViewOffer, onAddToCart }: OffersShowcaseProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section id="offers-section" className="py-10 sm:py-12 bg-dark-bg border-b border-dark-border">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="text-center mb-8 sm:mb-10 relative">
          <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">طارق هلال</span>
          <h3 className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-black text-white relative">
            <Gift className="text-gold-400" size={26} />
            <span className="relative inline-block">
              عروض وباقات حصرية
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gold-400 rounded-full" />
            </span>
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            باقات جاهزة بأسعار مخفضة تجمع لك أكتر من منتج في عرض واحد، وفّر أكتر لما تجهز صالونك بالكامل.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${offers.length > 1 ? "md:grid-cols-2" : ""} gap-4 sm:gap-6`}>
          {offers.map((offer) => {
            const components = getOfferComponents(offer);

            return (
              <div
                key={offer.id}
                onClick={() => onViewOffer(offer)}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-400/25 bg-dark-card shadow-lg shadow-gold-900/10 cursor-pointer select-none"
              >
                <div className="relative aspect-[16/11] sm:aspect-[16/9] w-full">
                  <img
                    src={offer.image}
                    alt={offer.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-7">
                  <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/15 backdrop-blur-sm px-3 py-1 text-[10px] sm:text-xs font-bold text-gold-300">
                    <Sparkles size={12} />
                    <span>عرض خاص وحصري</span>
                  </span>

                  <h4 className="text-base sm:text-2xl font-black text-[rgb(255,255,255)] mb-2 leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] line-clamp-2">
                    {offer.name}
                  </h4>

                  {components.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {components.slice(0, 4).map((item, index) => (
                        <span
                          key={`${offer.id}-${index}`}
                          className="rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-stone-100 backdrop-blur-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-2xl font-black text-gold-400">{formatPrice(offer.price)}</span>
                      {offer.originalPrice ? (
                        <span className="text-xs sm:text-sm text-stone-300 line-through font-bold">
                          {formatPrice(offer.originalPrice)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToCart(offer);
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-gold-400 to-gold-600 text-dark-bg font-extrabold text-[11px] sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-md shadow-gold-500/20 hover:from-gold-300 hover:to-gold-500 transition-all"
                    >
                      <ShoppingCart size={14} />
                      <span>اطلب العرض</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
