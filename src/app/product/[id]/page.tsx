"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { categories as fallbackCategories, products as fallbackProducts } from "../../../data/salondata";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import CartDrawer from "../../../../components/CartDrawer";
import AccountModal from "../../../../components/AccountModal";
import CheckoutModal from "../../../../components/CheckoutModal";
import { CartItem, Product, ProductVariant } from "../../../types";
import { STORAGE_KEYS } from "../../../lib/browser-storage";
import { usePersistentLocalState } from "../../../hooks/usePersistentLocalState";
import { useAuthSession } from "../../../hooks/useAuthSession";
import { fetchCategories, fetchProductById, fetchProducts } from "../../../lib/api";
import { getCartLineKey } from "../../../lib/cart";

function ProductDetailsContent({
  product,
  categories,
  allProducts,
  onAddToCart,
}: {
  product: Product;
  categories: typeof fallbackCategories;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity: number, variant: ProductVariant | null) => void;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.variants?.[0]?.id ?? null);

  const formatPrice = (price: number) => `${price.toLocaleString("en-EG")} جنيه`;

  const relatedProducts = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  const galleryImages = product.images?.length
    ? product.images
        .slice()
        .sort((firstImage, secondImage) => firstImage.sort_order - secondImage.sort_order)
        .map((image) => image.media_url)
    : [product.image];
  const categoryName = categories.find((category) => category.id === product.category)?.name || "غير محدد";
  const variants = product.variants || [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0] || null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const variantsCount = variants.length;
  const imagesCount = product.images?.length || 1;

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.media_url) {
      setActiveImage(variant.media_url);
    }
  };

  const describeVariant = (variant: ProductVariant) =>
    variant.attributes?.length
      ? variant.attributes.map((attribute) => `${attribute.attribute_type}: ${attribute.value}`).join(" / ")
      : `نسخة #${variant.id}`;

  return (
    <div className="bg-dark-bg text-gray-100 py-5 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans text-right">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-dark-border/60">
          <button
            onClick={() => router.push("/")}
            className="w-fit flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-gold-400 transition-colors font-bold"
          >
            <ArrowRight size={16} />
            <span>العودة لجميع المنتجات والمعروضات</span>
          </button>

          <span className="text-[10px] sm:text-xs text-gray-500 break-words">
            الرئيسية / {categories.find((category) => category.id === product.category)?.name || "أقسام أخرى"} / {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-2xl bg-dark-card border border-dark-border overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage === image ? "border-gold-400" : "border-dark-border"} bg-dark-card`}
                >
                  <img src={image} alt={`${product.name}-${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] text-gold-400 font-bold tracking-wider uppercase block">
                {categoryName}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">
                  {formatPrice(displayPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-400 pt-2">
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">كود المنتج</span>
                  <span className="font-mono text-gray-200">{product.id}</span>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">عدد الصور</span>
                  <span className="font-mono text-gray-200">{imagesCount}</span>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">عدد النسخ</span>
                  <span className="font-mono text-gray-200">{variantsCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-300">وصف المنتج:</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-300">اختر النسخة المطلوبة:</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const isActive = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`rounded-xl border px-3 py-2 text-right text-xs font-bold transition-colors ${
                          isActive
                            ? "border-gold-400 bg-gold-400/10 text-gold-400"
                            : "border-dark-border bg-dark-card text-gray-300 hover:border-gold-400/60"
                        }`}
                      >
                        <span className="block">{describeVariant(variant)}</span>
                        <span className="mt-0.5 block text-[10px] text-gray-500">{formatPrice(variant.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-b border-dark-border/60 py-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-dark-card border border-dark-border rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                  className="w-10 h-10 rounded-lg bg-dark-bg text-gray-300 hover:text-white font-bold flex items-center justify-center border border-dark-border/40"
                >
                  -
                </button>
                <span className="text-sm font-bold px-4 font-mono w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
                  className="w-10 h-10 rounded-lg bg-dark-bg text-gray-300 hover:text-white font-bold flex items-center justify-center border border-dark-border/40"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onAddToCart(product, quantity, selectedVariant)}
                className="flex-grow flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-dark-bg font-black py-3.5 px-6 rounded-xl shadow-lg transition-all text-xs sm:text-sm"
              >
                <ShoppingCart size={18} />
                <span>إضافة {quantity} من هذا الصنف إلى السلة</span>
              </button>
            </div>

            <div className="sm:hidden sticky bottom-3 z-20">
              <div className="rounded-2xl border border-gold-400/20 bg-dark-card/95 backdrop-blur-md p-3 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500">سعر القطعة</p>
                    <p className="text-sm font-black text-gold-400">{formatPrice(displayPrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product, quantity, selectedVariant)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 text-dark-bg font-black py-3 px-4 rounded-xl text-xs"
                  >
                    <ShoppingCart size={16} />
                    <span>أضف للسلة</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-dark-border/40 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-black text-white">منتجات ومعدات نقترحها لصالونك:</h3>
              <span className="text-[10px] sm:text-xs text-gold-500 font-bold">باقة تأسيس متكاملة</span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  type="button"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                  className="bg-dark-card border border-dark-border rounded-xl p-3 text-right cursor-pointer group hover:border-gold-400 transition-all duration-300"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border/40 mb-3 relative">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[9px] text-gold-400 font-bold">{categories.find((category) => category.id === relatedProduct.category)?.name}</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-gray-200 mt-1 line-clamp-1 group-hover:text-gold-400 transition-colors">
                    {relatedProduct.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1.5 font-mono">
                    <span className="text-xs font-bold text-white">{formatPrice(relatedProduct.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, login, logout, isHydrated: isUserHydrated } = useAuthSession();
  const { value: cart, setValue: setCart } = usePersistentLocalState<CartItem[]>(STORAGE_KEYS.cart, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackProducts);
  const [catalogCategories, setCatalogCategories] = useState(fallbackCategories);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const hydratedUser = isUserHydrated ? currentUser : null;
  const hydratedCart = cart;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [productResult, productsResult, categoriesResult] = await Promise.allSettled([
          fetchProductById(params.id),
          fetchProducts(),
          fetchCategories(),
        ]);

        if (cancelled) {
          return;
        }

        const nextProducts = productsResult.status === "fulfilled" && productsResult.value.length > 0
          ? productsResult.value
          : fallbackProducts;
        const nextCategories = categoriesResult.status === "fulfilled" && categoriesResult.value.length > 0
          ? categoriesResult.value
          : fallbackCategories;
        const nextProduct = productResult.status === "fulfilled"
          ? productResult.value
          : nextProducts.find((item) => item.id === params.id) ?? fallbackProducts.find((item) => item.id === params.id) ?? null;

        setCatalogProducts(nextProducts);
        setCatalogCategories(nextCategories);
        setActiveProduct(nextProduct);
      } catch {
        if (!cancelled) {
          setCatalogProducts(fallbackProducts);
          setCatalogCategories(fallbackCategories);
          setActiveProduct(fallbackProducts.find((item) => item.id === params.id) ?? null);
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleAddToCart = (nextProduct: Product, quantity = 1, variant: ProductVariant | null = null) => {
    setCart((currentCart) => {
      const nextItem: CartItem = { product: nextProduct, quantity, selectedVariant: variant ?? undefined };
      const nextLineKey = getCartLineKey(nextItem);
      const matchingItem = currentCart.find((item) => getCartLineKey(item) === nextLineKey);
      const updatedCart = matchingItem
        ? currentCart.map((item) =>
            getCartLineKey(item) === nextLineKey
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...currentCart, nextItem];
      return updatedCart;
    });

    setIsCartOpen(true);
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    window.open(`https://wa.me/201501593962?text=${text}`, "_blank");
  };

  const navigateToStore = (categoryId = "all", search = "") => {
    const params = new URLSearchParams();

    if (categoryId !== "all") {
      params.set("category", categoryId);
    }

    if (search.trim()) {
      params.set("search", search);
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  if (isCatalogLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-gray-100 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white">جاري تحميل المنتج</h1>
          <p className="text-sm text-gray-400">نحاول جلب بيانات المنتج من الخادم الآن.</p>
        </div>
      </div>
    );
  }

  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-dark-bg text-gray-100 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white">المنتج غير موجود</h1>
          <p className="text-sm text-gray-400">قد يكون الرابط غير صحيح أو تم حذف المنتج من القائمة الحالية.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col justify-between">
      <Header
        currentUser={hydratedUser}
        onAccountClick={() => {
          if (hydratedUser) {
            router.push("/profile");
            return;
          }

          setIsAccountOpen(true);
        }}
        onCartClick={() => setIsCartOpen(true)}
        onLogout={logout}
        cartCount={hydratedCart.reduce((sum, item) => sum + item.quantity, 0)}
        currentView="home"
        onAdminClick={() => router.push("/admin")}
        searchTerm=""
        onSearchChange={(value) => navigateToStore("all", value)}
        selectedCategory={activeProduct.category}
        onCategorySelect={(categoryId) => navigateToStore(categoryId)}
        categories={catalogCategories}
        onContactClick={handleWhatsAppClick}
      />

      <main className="flex-grow">
        <ProductDetailsContent
          key={activeProduct.id}
          product={activeProduct}
          categories={catalogCategories}
          allProducts={catalogProducts}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer
        categories={catalogCategories}
        onCategorySelect={(categoryId) => navigateToStore(categoryId)}
        onContactClick={handleWhatsAppClick}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={hydratedCart}
        onUpdateQuantity={(id: string, delta: number) => {
          const updatedCart = hydratedCart
            .map((item) =>
              getCartLineKey(item) === id ? { ...item, quantity: item.quantity + delta } : item
            )
            .filter((item) => item.quantity > 0);
          setCart(updatedCart);
        }}
        onRemoveItem={(id: string) => {
          const updatedCart = hydratedCart.filter((item) => getCartLineKey(item) !== id);
          setCart(updatedCart);
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={hydratedUser}
        onLogin={login}
        orders={[]}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={hydratedCart}
          selectedBundle={null}
          currentUser={hydratedUser}
          onClearCart={() => {
            setCart([]);
          }}
          onOrderSuccess={() => {
            setCart([]);
            setIsCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
}
