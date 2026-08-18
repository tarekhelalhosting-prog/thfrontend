"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Gift, ShoppingCart } from "lucide-react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import CartDrawer from "../../../../components/CartDrawer";
import AccountModal from "../../../../components/AccountModal";
import CheckoutModal from "../../../../components/CheckoutModal";
import ProductCard from "../../../../components/ProductCard";
import PageState from "../../../components/ui/PageState";
import { Category, Offer, Order, Product, ProductVariant } from "../../../types";
import { useAuthSession } from "../../../hooks/useAuthSession";
import { useCart } from "../../../hooks/useCart";
import { usePersistentLocalState } from "../../../hooks/usePersistentLocalState";
import { fetchCategories, fetchOffers, fetchOrders, fetchProductById, fetchStorefrontProducts, isApiRequestError } from "../../../lib/api";
import { STORAGE_KEYS } from "../../../lib/browser-storage";
import { getOfferComponents, isOfferCategory } from "../../../lib/offer-category";
import { getBuyXGetYOffersForProduct, getProductDiscount, getProductVariantDiscount } from "../../../lib/product-offers";
import { isProductUnavailable } from "../../../lib/product-availability";

function ProductDetailsContent({
  product,
  categories,
  allProducts,
  offers,
  favorites,
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
}: {
  product: Product;
  categories: Category[];
  allProducts: Product[];
  offers: Offer[];
  favorites: string[];
  onAddToCart: (product: Product, quantity: number, variant: ProductVariant | null) => void;
  onToggleFavorite: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.variants?.[0]?.id ?? null);

  const formatPrice = (price: number) => `${price.toLocaleString("en-EG")} جنيه`;

  const relatedProducts = useMemo(
    () =>
      allProducts
        .filter((item) => item.category === product.category && item.id !== product.id)
        .slice(0, 4)
        .map((item) => {
          const discount = getProductDiscount(item, offers);
          if (!discount) {
            return item;
          }

          const hasPriceDrop = discount.discountedPrice < discount.originalPrice;

          return {
            ...item,
            price: discount.discountedPrice,
            originalPrice: hasPriceDrop ? discount.originalPrice : undefined,
            discountBadge: discount.badgeText,
            isOnOffer: true,
          };
        }),
    [allProducts, offers, product.category, product.id]
  );

  const galleryImages = product.images?.length
    ? product.images
        .slice()
        .sort((firstImage, secondImage) => firstImage.sort_order - secondImage.sort_order)
        .map((image) => image.media_url)
    : [product.image];
  const categoryName = categories.find((category) => category.id === product.category)?.name || "غير محدد";
  const isOfferMode = isOfferCategory(categories.find((category) => category.id === product.category));
  const offerComponents = isOfferMode ? getOfferComponents(product) : [];
  const variants = product.variants || [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0] || null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const buyXGetYGifts = useMemo(
    () => getBuyXGetYOffersForProduct(product, selectedVariant, offers),
    [offers, product, selectedVariant]
  );
  const variantsCount = variants.length;
  const imagesCount = product.images?.length || 1;
  const isUnavailable = isProductUnavailable(product);

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
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-8">
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
            <div className="relative aspect-square rounded-2xl bg-white border border-dark-border overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage === image ? "border-gold-400" : "border-dark-border"} bg-white`}
                >
                  <img src={image} alt={`${product.name}-${index + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              {isOfferMode ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[10px] font-bold text-gold-300">
                  🎁 عرض حصري
                </span>
              ) : null}
              <span className="text-[11px] text-gold-400 font-bold tracking-wider uppercase block">
                {categoryName}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>
              {isUnavailable ? (
                <p className="w-fit rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-800">
                  المنتج غير متوفر حاليًا
                </p>
              ) : null}
            </div>

            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">
                  {formatPrice(displayPrice)}
                </span>
              </div>

              {offerComponents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {offerComponents.map((item, index) => (
                    <span
                      key={`${product.id}-component-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 px-2.5 py-1 text-[10px] font-bold text-gold-300"
                    >
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-400 pt-2">
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">{isOfferMode ? "كود العرض" : "كود المنتج"}</span>
                  <span className="font-mono text-gray-200">{product.id}</span>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">عدد الصور</span>
                  <span className="font-mono text-gray-200">{imagesCount}</span>
                </div>
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2">
                  <span className="block text-[10px] text-gray-500 mb-1">{isOfferMode ? "عدد الباقات" : "عدد النسخ"}</span>
                  <span className="font-mono text-gray-200">{variantsCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-300">{isOfferMode ? "تفاصيل وما يشمله العرض:" : "وصف المنتج:"}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {buyXGetYGifts.map((offer) => (
              <div key={offer.offerId} className="rounded-2xl border border-emerald-400/40 bg-emerald-50 p-4 text-right">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <Gift size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-emerald-800">{offer.offerName}</p>
                    <p className="mt-1 text-xs font-bold text-emerald-700">
                      اشترِ {offer.requiredQuantity} من هذا الصنف واحصل على:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.gifts.map((gift) => (
                        <span key={`${offer.offerId}-${gift.variantId ?? gift.productId}`} className="rounded-lg border border-emerald-400/30 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                          {gift.quantity > 1 ? `${gift.quantity} x ` : ""}{gift.productName}{gift.variantDescription ? ` - ${gift.variantDescription}` : ""} مجانا
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-300">{isOfferMode ? "باقات وخيارات العرض المتاحة:" : "اختر النسخة المطلوبة:"}</h3>
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

            {isUnavailable ? (
              <div className="border-y border-dark-border/60 py-5">
                <div className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-center text-sm font-extrabold text-stone-700">
                  المنتج غير متوفر حاليًا ولا يمكن إضافته إلى السلة
                </div>
              </div>
            ) : (
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
            )}

            {!isUnavailable && <div className="sm:hidden sticky bottom-3 z-20">
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
            </div>}

          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-dark-border/40 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-black text-white">منتجات ومعدات نقترحها لصالونك:</h3>
              <span className="text-[10px] sm:text-xs text-gold-500 font-bold">باقة تأسيس متكاملة</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={(p) => onAddToCart(p, 1, p.variants?.[0] ?? null)}
                  isFavorite={favorites.includes(relatedProduct.id)}
                  onToggleFavorite={onToggleFavorite}
                  onViewDetails={onViewDetails}
                  categories={categories}
                />
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
  const hydratedUser = isUserHydrated ? currentUser : null;
  const { cartItems: hydratedCart, cartCount, addItem: addCartItem, updateQuantity: updateCartQuantity, removeItem: removeCartItem, clearCart } = useCart(hydratedUser);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<"offline" | "server" | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const { value: favorites, setValue: setFavorites } = usePersistentLocalState<string[]>(STORAGE_KEYS.favorites, []);

  useEffect(() => {
    const userId = hydratedUser?.id ?? null;

    if (!userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const ordersResult = await fetchOrders();
        if (!cancelled) {
          setMyOrders(ordersResult);
        }
      } catch {
        if (!cancelled) {
          setMyOrders([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydratedUser?.id]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [productResult, productsResult, categoriesResult, offersResult] = await Promise.allSettled([
          fetchProductById(params.id),
          fetchStorefrontProducts(),
          fetchCategories(),
          fetchOffers(),
        ]);

        if (cancelled) {
          return;
        }

        const nextProducts = productsResult.status === "fulfilled" ? productsResult.value : [];
        const nextCategories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
        const nextProduct = productResult.status === "fulfilled"
          ? productResult.value
          : nextProducts.find((item) => item.id === params.id) ?? null;
        const productRequestFailed = productResult.status === "rejected";
        const productNotFound = productRequestFailed
          && isApiRequestError(productResult.reason)
          && productResult.reason.status === 404;
        const networkRequestFailed = productRequestFailed && productResult.reason instanceof TypeError;
        let nextCatalogError: "offline" | "server" | null = null;

        if (!nextProduct && productRequestFailed && !productNotFound) {
          nextCatalogError = !navigator.onLine || networkRequestFailed ? "offline" : "server";
        }

        setCatalogProducts(nextProducts);
        setCatalogCategories(nextCategories);
        setActiveOffers(offersResult.status === "fulfilled" ? offersResult.value : []);
        setActiveProduct(nextProduct);
        setCatalogError(nextCatalogError);
      } catch {
        if (!cancelled) {
          setCatalogProducts([]);
          setCatalogCategories([]);
          setActiveProduct(null);
          setCatalogError(navigator.onLine ? "server" : "offline");
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
    if (isProductUnavailable(nextProduct)) {
      return;
    }

    const discount = variant ? getProductVariantDiscount(nextProduct, variant, activeOffers) : getProductDiscount(nextProduct, activeOffers);
    const activeOffer = discount && discount.discountedPrice < discount.originalPrice
      ? {
          offer_id: discount.offerId,
          offer_name: discount.offerName,
          offer_type: discount.offerType,
          original_unit_price: discount.originalPrice,
          discounted_unit_price: discount.discountedPrice,
        }
      : undefined;

    addCartItem(nextProduct, variant, quantity, activeOffer);
    setIsCartOpen(true);
  };

  const handleToggleFavorite = (nextProduct: Product) => {
    setFavorites((prev) =>
      prev.includes(nextProduct.id) ? prev.filter((id) => id !== nextProduct.id) : [...prev, nextProduct.id]
    );
  };

  const handleViewProduct = (nextProduct: Product) => {
    router.push(`/product/${nextProduct.id}`);
  };

  const handleContactClick = () => {
    document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <PageState
        variant="loading"
        title="جاري تحميل المنتج"
        message="نحاول جلب بيانات المنتج من الخادم الآن."
        fullPage
      />
    );
  }

  if (catalogError) {
    const isOffline = catalogError === "offline";

    return (
      <PageState
        variant="error"
        title={isOffline ? "انقطع الاتصال بالإنترنت" : "تعذر تحميل المنتج"}
        message={isOffline
          ? "تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى."
          : "تعذر الاتصال بالخادم حاليًا. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى."}
        fullPage
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gold-400 px-6 py-2.5 text-xs font-extrabold text-dark-bg transition-colors hover:bg-gold-500"
          >
            إعادة المحاولة
          </button>
        }
      />
    );
  }

  if (!activeProduct) {
    return (
      <PageState
        variant="error"
        title="المنتج غير موجود"
        message="قد يكون الرابط غير صحيح أو تم حذف المنتج من القائمة الحالية."
        fullPage
        action={
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl bg-gold-400 px-6 py-2.5 text-xs font-extrabold text-dark-bg transition-colors hover:bg-gold-500"
          >
            العودة للمتجر الرئيسي
          </button>
        }
      />
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
        cartCount={cartCount}
        currentView="home"
        onAdminClick={() => router.push("/admin")}
        searchTerm=""
        onSearchChange={(value) => navigateToStore("all", value)}
        selectedCategory={activeProduct.category}
        onCategorySelect={(categoryId) => navigateToStore(categoryId)}
        categories={catalogCategories}
        onContactClick={handleContactClick}
      />

      <main className="flex-grow">
        <ProductDetailsContent
          key={activeProduct.id}
          product={activeProduct}
          categories={catalogCategories}
          allProducts={catalogProducts}
          offers={activeOffers}
          favorites={favorites}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          onViewDetails={handleViewProduct}
        />
      </main>

      <Footer
        categories={catalogCategories}
        onCategorySelect={(categoryId) => navigateToStore(categoryId)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={hydratedCart}
        offers={activeOffers}
        products={catalogProducts}
        onUpdateQuantity={(id: string, delta: number) => updateCartQuantity(id, delta)}
        onRemoveItem={(id: string) => removeCartItem(id)}
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
        orders={hydratedUser ? myOrders : []}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={hydratedCart}
          selectedBundle={null}
          currentUser={hydratedUser}
          onClearCart={() => {
            clearCart();
          }}
          onOrderSuccess={(order) => {
            clearCart();
            setMyOrders((current) => [order, ...current]);
          }}
          onRequireLogin={() => {
            setIsCheckoutOpen(false);
            setIsAccountOpen(true);
          }}
        />
      )}
    </div>
  );
}
