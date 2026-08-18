"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import HeroCarousel from "../../components/HeroCarousel";
import CategoriesList from "../../components/CategoriesList";
import OffersShowcase from "../../components/OffersShowcase";
import Footer from "../../components/Footer";
import CartDrawer from "../../components/CartDrawer";
import AccountModal from "../../components/AccountModal";
import CheckoutModal from "../../components/CheckoutModal";
import ProductCard from "../../components/ProductCard";
import PageState from "../components/ui/PageState";
import InlineBanner from "../components/ui/InlineBanner";
import { Product, ProductVariant, Order, Category, Offer } from "../types";
import { fetchCategories, fetchOffers, fetchOrders, fetchStorefrontProducts } from "../lib/api";
import { isProductUnavailable } from "../lib/product-availability";
import { getProductDiscount } from "../lib/product-offers";
import { getOfferProducts } from "../lib/offer-category";
import { STORAGE_KEYS } from "../lib/browser-storage";
import { usePersistentLocalState } from "../hooks/usePersistentLocalState";
import { useAuthSession } from "../hooks/useAuthSession";
import { useCart } from "../hooks/useCart";

function StoreFrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isHydrated: isUserHydrated, login, logout } = useAuthSession();
  const hydratedUser = isUserHydrated ? currentUser : null;
  const { cartItems: hydratedCart, cartCount, addItem: addCartItem, updateQuantity: updateCartQuantity, removeItem: removeCartItem, clearCart } = useCart(hydratedUser);
  const { value: favorites, setValue: setFavorites } = usePersistentLocalState<string[]>(STORAGE_KEYS.favorites, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  const selectedCategory = searchParams.get("category") || "all";
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [productsResult, categoriesResult, offersResult] = await Promise.allSettled([
          fetchStorefrontProducts(),
          fetchCategories(),
          fetchOffers(),
        ]);

        if (cancelled) {
          return;
        }

        if (productsResult.status === "fulfilled") {
          setCatalogProducts(productsResult.value);
        }

        if (categoriesResult.status === "fulfilled") {
          setCatalogCategories(categoriesResult.value);
        }

        // Offers are best-effort here: a failed/empty fetch just means no
        // discount badges show up, it should never block the product grid.
        if (offersResult.status === "fulfilled") {
          setActiveOffers(offersResult.value);
        }

        if (productsResult.status === "rejected" || categoriesResult.status === "rejected") {
          setCatalogError("تعذر تحميل بيانات المنتجات من الخادم، حاول تحديث الصفحة مرة أخرى.");
        } else {
          setCatalogError(null);
        }
      } catch {
        if (!cancelled) {
          setCatalogError("تعذر تحميل بيانات المنتجات من الخادم، حاول تحديث الصفحة مرة أخرى.");
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
  }, []);

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

  const scrollToSection = (sectionId: string) => {
    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const handleAddToCart = (product: Product, quantity = 1, variant: ProductVariant | null = null) => {
    if (isProductUnavailable(product)) {
      return;
    }

    addCartItem(product, variant, quantity);
    setIsCartOpen(true);
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev =>
      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
    );
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    const url = `https://wa.me/201021750655?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleContactClick = () => {
    document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateStoreUrl = (nextCategory: string, nextSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory && nextCategory !== "all") {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    if (nextSearch.trim()) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    const queryString = params.toString();
    router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    updateStoreUrl(categoryId, searchTerm);

    scrollToSection("catalog-section");
  };

  const handleSearchChange = (value: string) => {
    updateStoreUrl("all", value);
    if (value.trim()) {
      scrollToSection("catalog-section");
    }
  };

  // Discount badge/price is computed purely client-side from the one bulk
  // `fetchOffers()` call above - no extra per-product backend requests.
  // `product.price` is overridden here for display only; the original
  // `product`/`variant` objects (and their real prices) are still what get
  // passed to `handleAddToCart`, so cart/order pricing (computed server-side)
  // is completely unaffected by this.
  const discountedCatalogProducts = useMemo(
    () =>
      catalogProducts.map((product) => {
        const discount = getProductDiscount(product, activeOffers);
        if (!discount) {
          return product;
        }

        const hasPriceDrop = discount.discountedPrice < discount.originalPrice;

        return {
          ...product,
          price: discount.discountedPrice,
          originalPrice: hasPriceDrop ? discount.originalPrice : undefined,
          discountBadge: discount.badgeText,
          isOnOffer: true,
        };
      }),
    [catalogProducts, activeOffers]
  );

  // Bundle/offer products live under a dedicated "Offers" category (see
  // src/lib/offer-category.ts) - shown in their own distinct banner section
  // right under the Hero, on top of the normal category grid/catalog below.
  const bundleOffers = useMemo(
    () => getOfferProducts(discountedCatalogProducts, catalogCategories),
    [discountedCatalogProducts, catalogCategories]
  );

  const filteredProducts = discountedCatalogProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      selectedCategory === "salon-bundles" ||
      product.category === selectedCategory;

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const catalogTitle =
    selectedCategory === "all"
      ? searchTerm.trim()
        ? "نتائج البحث"
        : "كل المنتجات"
      : catalogCategories.find((category) => category.id === selectedCategory)?.name || "المنتجات";

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
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        categories={catalogCategories}
        onContactClick={handleContactClick}
      />
      
      <main className="flex-grow">
        <HeroCarousel onShopNowClick={() => handleCategorySelect("all")} onWhatsAppClick={handleWhatsAppClick} />
        <OffersShowcase
          offers={bundleOffers}
          onViewOffer={handleViewProduct}
          onAddToCart={(product) => handleAddToCart(product, 1, product.variants?.[0] ?? null)}
        />
        <div id="categories-section">
          <CategoriesList categories={catalogCategories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
        </div>
        <section id="catalog-section" className="py-12 bg-dark-bg border-b border-dark-border scroll-mt-28">
          <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
            {catalogError && <InlineBanner tone="error" message={catalogError} className="mb-6" />}
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-dark-border/40">
              <div className="text-right">
                <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">طارق هلال</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{catalogTitle}</h3>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-[10px] sm:text-xs text-gold-400 font-bold">
                  <span>المفضلة</span>
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-gold-400 text-dark-bg flex items-center justify-center font-black">
                    {favorites.length}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {filteredProducts.length} منتج
              </span>
            </div>

            {isCatalogLoading ? (
              <PageState variant="loading" title="جاري تحميل المنتجات والأقسام..." />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1, p.variants?.[0] ?? null)}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={handleViewProduct}
                    categories={catalogCategories}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dark-border bg-dark-card p-8 text-center text-gray-400">
                لا توجد منتجات مطابقة لهذا القسم أو البحث الحالي.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer categories={catalogCategories} onCategorySelect={handleCategorySelect} />

      {/* المودالز والنوافذ المنبثقة التفاعلية */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={hydratedCart} 
        offers={activeOffers}
        products={catalogProducts}
        onUpdateQuantity={(id: string, q: number) => updateCartQuantity(id, q)}
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

export default function StoreFrontPage() {
  return (
    <Suspense fallback={<PageState variant="loading" title="جاري تحميل المتجر..." fullPage />}>
      <StoreFrontContent />
    </Suspense>
  );
}