import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Product } from "../src/types";
import ProductCard from "./ProductCard";

interface BestSellersProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  favorites: string[];
  onToggleFavorite: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onShowAllClick: () => void;
}

export default function BestSellers({
  products,
  onAddToCart,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onShowAllClick
}: BestSellersProps) {
  // Use first products as featured list when best-seller flag is unavailable.
  const bestSellers = products.slice(0, 5);

  return (
    <section className="py-12 bg-dark-bg border-b border-dark-border">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-border/40">
          {/* Section Title */}
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gold-400 rounded-full" />
            <h3 className="text-xl sm:text-2xl font-black text-white">الأكثر مبيعاً</h3>
          </div>

          {/* Links and navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={onShowAllClick}
              className="text-xs sm:text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors"
            >
              عرض الكل
            </button>
            
            {/* Slide Arrows for visuals */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button 
                className="p-1.5 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="السابق"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                className="p-1.5 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
              isFavorite={favorites.includes(prod.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
