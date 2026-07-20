"use client";
import React from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { Category, Product } from "../src/types";
import { categories as fallbackCategories } from "../src/data/salondata";

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  categories?: Category[];
}

export default function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  categories,
}: ProductCardProps) {
  
  // Format price helper
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  const categorySource = categories?.length ? categories : fallbackCategories;
  const categoryName = categorySource.find((category) => category.id === product.category)?.name;

  // WhatsApp click handler for this specific product
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    window.open(`https://wa.me/201501593962?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-dark-card border border-dark-border hover:border-gold-400 rounded-2xl overflow-hidden p-3 sm:p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-gold-500/5 cursor-pointer select-none"
    >
      {/* Top actions */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 flex items-center justify-end">
        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`p-1.5 sm:p-2 rounded-xl border border-dark-border/40 backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-black/30 hover:bg-black/60 text-gray-400 hover:text-white'}`}
          title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-dark-bg mb-3 sm:mb-4 flex items-center justify-center border border-dark-border/10">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/20 to-transparent pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="text-right flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <p className="text-[10px] text-gold-400 font-bold mb-1.5 line-clamp-1">
              {categoryName}
            </p>
          )}

          {/* Title */}
          <h4 className="text-[13px] sm:text-sm font-bold text-gray-100 group-hover:text-gold-400 transition-colors leading-snug line-clamp-1">
            {product.name}
          </h4>

          {/* Description Snippet */}
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Buttons */}
        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline justify-start gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
            <span className="text-sm sm:text-base font-black text-gold-400">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-1">
            {/* Add to Cart - takes 4/5 column width */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="col-span-4 flex items-center justify-center gap-1 bg-dark-bg border border-dark-border group-hover:bg-gold-400 group-hover:text-dark-bg text-gray-300 font-extrabold text-[10px] sm:text-xs py-1.5 sm:py-2 rounded-xl transition-all"
            >
              <ShoppingCart size={12} className="sm:w-[13px] sm:h-[13px]" />
              <span>أضف للسلة</span>
            </button>

            {/* Quick WhatsApp contact - 1/5 column width */}
            <button
              onClick={handleWhatsAppClick}
              className="col-span-1 flex items-center justify-center rounded-xl bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 transition-all"
              title="استفسار سريع واتساب"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2.004 6.477 2.004 12C2.004 13.763 2.463 15.42 3.264 16.862L2 21.5L6.772 20.248C8.163 21.004 9.743 21.438 11.417 21.438C12.004 21.438 12.004 21.438 12.004 21.438C17.524 21.438 22.004 16.96 22.004 11.438C22.004 5.915 17.527 2.001 12.004 2ZM17.204 15.71C16.994 16.302 15.984 16.797 15.384 16.869C14.884 16.924 14.284 16.96 12.304 16.159C9.764 15.129 8.114 12.512 7.984 12.342C7.864 12.172 6.964 10.965 6.964 9.715C6.964 8.465 7.614 7.852 7.854 7.611C8.094 7.37 8.374 7.31 8.544 7.31H9.034C9.194 7.31 9.404 7.3 9.604 7.747C9.814 8.212 10.314 9.497 10.384 9.627C10.454 9.757 10.494 9.907 10.404 10.072C10.324 10.237 10.274 10.332 10.154 10.482C10.034 10.632 9.894 10.812 9.784 10.922C9.664 11.042 9.534 11.172 9.684 11.427C9.834 11.682 10.344 12.507 11.084 13.172C12.044 14.027 12.844 14.3 13.114 14.412C13.384 14.524 13.544 14.492 13.694 14.327C13.844 14.162 14.334 13.592 14.504 13.342C14.674 13.092 14.844 13.132 15.084 13.222C15.324 13.312 16.854 14.072 17.174 14.232C17.494 14.392 17.704 14.472 17.784 14.612C17.864 14.752 17.864 15.385 17.204 15.71Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
