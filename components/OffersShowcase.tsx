"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const firstItemRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const [firstVisible, setFirstVisible] = useState(true);
  const [lastVisible, setLastVisible] = useState(false);

  // Edge fades should only hint at scrollable content that's actually still
  // hidden - track the first/last card's visibility so each fade disappears
  // once the user has scrolled to that edge, instead of staying on always.
  useEffect(() => {
    if (offers.length <= 2) return;
    const firstEl = firstItemRef.current;
    const lastEl = lastItemRef.current;
    if (!firstEl || !lastEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === firstEl) setFirstVisible(entry.isIntersecting);
          if (entry.target === lastEl) setLastVisible(entry.isIntersecting);
        });
      },
      { root: firstEl.closest("[data-scroller]"), threshold: 0.95 }
    );

    observer.observe(firstEl);
    observer.observe(lastEl);
    return () => observer.disconnect();
  }, [offers.length]);

  if (offers.length === 0) {
    return null;
  }

  function renderOfferCard(offer: Product, layout: "mobile" | "desktop", isFirst?: boolean, isLast?: boolean) {
    const components = getOfferComponents(offer);
    const isMobile = layout === "mobile";

    return (
      <div
        key={offer.id}
        ref={isFirst ? firstItemRef : isLast ? lastItemRef : undefined}
        onClick={() => onViewOffer(offer)}
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-400/25 bg-dark-card shadow-lg shadow-gold-900/10 cursor-pointer select-none ${isMobile ? "snap-start" : ""}`}
      >
        <div className={`relative w-full ${isMobile ? "aspect-[3/4]" : "aspect-[16/9]"}`}>
          <img
            src={offer.image}
            alt={offer.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
        </div>

        {/* Same top-corner position as the discount badge on ProductCard */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/15 backdrop-blur-sm px-2.5 sm:px-3 py-1 text-[9px] sm:text-xs font-bold text-gold-300">
            <Sparkles size={11} />
            <span>عرض خاص وحصري</span>
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-7">
          {/* Plain (non-heading) tag: global CSS forces h1-h6 to dark charcoal via !important, which would hide white text over this dark banner overlay */}
          <p className="text-sm sm:text-2xl font-black text-[rgb(255,255,255)] mb-1.5 sm:mb-2 leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-2">
            {offer.name}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-2xl font-black text-gold-400">{formatPrice(offer.price)}</span>
              {offer.originalPrice ? (
                <span className="text-[10px] sm:text-sm text-stone-300 line-through font-bold">
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
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-gold-400 to-gold-600 text-dark-bg font-extrabold text-[10px] sm:text-sm px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl shadow-md shadow-gold-500/20 hover:from-gold-300 hover:to-gold-500 transition-all"
            >
              <ShoppingCart size={12} />
              <span>اطلب العرض</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="offers-section" className="py-10 sm:py-12 bg-dark-bg border-b border-dark-border">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="text-center mb-8 sm:mb-10 relative">
          <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">طارق هلال</span>
          <h3 className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-black text-white relative">
            <Gift className="text-gold-400" size={26} />
            <span>عروض وباقات حصرية</span>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gold-400 rounded-full" />
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            باقات جاهزة بأسعار مخفضة تجمع لك أكتر من منتج في عرض واحد، وفّر أكتر لما تجهز صالونك بالكامل.
          </p>
        </div>

        {/* Mobile: side-by-side, horizontal scroll like the categories section when more than 2 */}
        <div className="md:hidden">
          {offers.length > 2 && (
            <div className="mb-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-gold-500/90">
              <span>اسحب يمين او شمال لعرض باقي العروض</span>
            </div>
          )}

          <div
            data-scroller
            className="relative -mx-4 px-4 overflow-x-auto pb-2 touch-pan-x snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="grid grid-flow-col auto-cols-[calc((100%-0.75rem)/2)] gap-3">
              {offers.map((offer, index) =>
                renderOfferCard(offer, "mobile", index === 0, index === offers.length - 1)
              )}
            </div>

            {offers.length > 2 && !firstVisible && (
              <div className="pointer-events-none absolute inset-y-0 right-4 w-7 bg-gradient-to-l from-dark-bg to-transparent" />
            )}
            {offers.length > 2 && !lastVisible && (
              <div className="pointer-events-none absolute inset-y-0 left-4 w-7 bg-gradient-to-r from-dark-bg to-transparent" />
            )}
          </div>
        </div>

        {/* Desktop/Tablet: classic grid */}
        <div className={`hidden md:grid grid-cols-1 ${offers.length > 1 ? "md:grid-cols-2" : ""} gap-4 sm:gap-6`}>
          {offers.map((offer) => renderOfferCard(offer, "desktop"))}
        </div>
      </div>
    </section>
  );
}
