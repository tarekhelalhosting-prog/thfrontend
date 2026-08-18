import React, { useState, useEffect } from "react";
import { ArrowRight, ShoppingCart, ShieldCheck, Truck, Clock, Sparkles, Star, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { Product, Category } from "../src/types";
import ProtectedImage from "./ProtectedImage";

interface ProductDetailPageProps {
  product: Product;
  categories: Category[];
  allProducts: Product[];
  onBackToStore: () => void;
  onAddToCart: (product: Product, qty: number) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailPage({
  product,
  categories,
  allProducts,
  onBackToStore,
  onAddToCart,
  onSelectProduct
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);

  // Update active image when product changes
  useEffect(() => {
    setActiveImage(product.image);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  // Find related products in the same category (excluding current)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const ratingValue = product.rating ?? 5;
  const reviewsCount = product.reviewsCount ?? 0;
  const originalPrice = product.originalPrice;

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-dark-bg text-gray-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans text-right">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-8">
        
        {/* Back navigation bar */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border/60">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-gold-400 transition-colors font-bold"
          >
            <ArrowRight size={16} />
            <span>العودة لجميع المنتجات والمعروضات</span>
          </button>
          
          <span className="text-[10px] sm:text-xs text-gray-500">
            الرئيسية / {categories.find(c => c.id === product.category)?.name || "أقسام أخرى"} / {product.name}
          </span>
        </div>

        {/* Product Details Section (Image on Left/Right depending on direction - Arabic uses Right to Left) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Images Column (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl bg-dark-card border border-dark-border overflow-hidden group">
              <ProtectedImage
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.discountBadge && (
                <span className="absolute top-4 right-4 bg-red-600 text-white font-bold text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-md animate-pulse">
                  {product.discountBadge}
                </span>
              )}
            </div>

            {/* Simulated Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage === product.image ? 'border-gold-400' : 'border-dark-border'} bg-dark-card`}
              >
                <ProtectedImage src={product.image} alt="main" className="w-full h-full object-cover" />
              </button>
              {/* Fallback Unsplash details placeholders to make UI spectacular */}
              <button 
                onClick={() => setActiveImage("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop")}
                className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage.includes("photo-1503951914875") ? 'border-gold-400' : 'border-dark-border'} bg-dark-card`}
              >
                <ProtectedImage src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop" alt="detail 2" className="w-full h-full object-cover" />
              </button>
              <button 
                onClick={() => setActiveImage("https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop")}
                className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage.includes("photo-1621605815971") ? 'border-gold-400' : 'border-dark-border'} bg-dark-card`}
              >
                <ProtectedImage src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop" alt="detail 3" className="w-full h-full object-cover" />
              </button>
              <button 
                onClick={() => setActiveImage("https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop")}
                className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage.includes("photo-1596178065887") ? 'border-gold-400' : 'border-dark-border'} bg-dark-card`}
              >
                <ProtectedImage src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop" alt="detail 4" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          {/* Product Info Description Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title Block */}
            <div className="space-y-2">
              <span className="text-[11px] text-gold-400 font-bold tracking-wider uppercase block">
                {categories.find(c => c.id === product.category)?.name || "معارض طارق هلال الأصيلة"}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>
              
              {/* Ratings */}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="flex items-center text-yellow-500">
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                  <Star size={16} className="fill-current" />
                </div>
                <span className="text-xs font-bold text-gray-300 font-mono">({ratingValue})</span>
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-xs text-gray-400">{reviewsCount} تقييماً من صالونات مصر</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">
                  {formatPrice(product.price)}
                </span>
                {originalPrice && (
                  <span className="text-sm sm:text-base text-gray-500 line-through font-mono">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              
              {discountPercentage > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                  <Sparkles size={14} />
                  <span>توفير بقيمة {formatPrice((originalPrice ?? product.price) - product.price)} ({discountPercentage}%) للصالونات حالياً!</span>
                </div>
              )}
            </div>

            {/* Specifications Details */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-300">مواصفات تهمك في التأسيس:</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {product.description}
              </p>
              
              {product.features && product.features.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stepper + Purchase Actions */}
            <div className="border-t border-b border-dark-border/60 py-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              
              {/* Stepper qty */}
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-dark-card border border-dark-border rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-dark-bg text-gray-300 hover:text-white font-bold flex items-center justify-center border border-dark-border/40"
                >
                  -
                </button>
                <span className="text-sm font-bold px-4 font-mono w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 rounded-lg bg-dark-bg text-gray-300 hover:text-white font-bold flex items-center justify-center border border-dark-border/40"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Primary Button */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-grow flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-dark-bg font-black py-3.5 px-6 rounded-xl shadow-lg transition-all text-xs sm:text-sm"
              >
                <ShoppingCart size={18} />
                <span>إضافة {quantity} من هذا الصنف إلى السلة</span>
              </button>
            </div>

            {/* Quality Seals / Trust Info Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-gray-400 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-dark-card border border-dark-border/50">
                <ShieldCheck className="text-gold-500 shrink-0" size={18} />
                <div>
                  <span className="font-bold text-white block text-[10px]">ضمان معتمد حقيقي</span>
                  <span className="text-[9px] text-gray-500 mt-0.5 block">ضمان صيانة لجميع الأجهزة</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-dark-card border border-dark-border/50">
                <Truck className="text-gold-500 shrink-0" size={18} />
                <div>
                  <span className="font-bold text-white block text-[10px]">توصيل لجميع المحافظات</span>
                  <span className="text-[9px] text-gray-500 mt-0.5 block">تغليف آمن وسيارات مجهزة</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-dark-card border border-dark-border/50">
                <Clock className="text-gold-500 shrink-0" size={18} />
                <div>
                  <span className="font-bold text-white block text-[10px]">دعم مبيعات 24 ساعة</span>
                  <span className="text-[9px] text-gray-500 mt-0.5 block">تواصل وتنسيق مباشر فوري</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS RECOMMENDATIONS CONTAINER */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-dark-border/40 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-black text-white">منتجات ومعدات نقترحها لصالونك:</h3>
              <span className="text-[10px] sm:text-xs text-gold-500 font-bold">باقة تأسيس متكاملة</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  onClick={() => onSelectProduct(relProduct)}
                  className="bg-dark-card border border-dark-border rounded-xl p-3 text-right cursor-pointer group hover:border-gold-400 transition-all duration-300"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border/40 mb-3 relative">
                    <ProtectedImage
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[9px] text-gold-400 font-bold">{categories.find(c => c.id === relProduct.category)?.name}</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-gray-200 mt-1 line-clamp-1 group-hover:text-gold-400 transition-colors">
                    {relProduct.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1.5 font-mono">
                    <span className="text-xs font-bold text-white">{formatPrice(relProduct.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
