"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import HeroCarousel from "../../components/HeroCarousel";
import CategoriesList from "../../components/CategoriesList";
import Footer from "../../components/Footer";
import CartDrawer from "../../components/CartDrawer";
import AccountModal from "../../components/AccountModal";
import CheckoutModal from "../../components/CheckoutModal";
import ProductCard from "../../components/ProductCard";
import { Product, CartItem, User } from "../types";
import { products, categories } from "../data/salondata";
import { STORAGE_KEYS } from "../lib/browser-storage";
import { usePersistentLocalState } from "../hooks/usePersistentLocalState";

function StoreFrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { value: currentUser, setValue: setCurrentUser, isHydrated: isUserHydrated } = usePersistentLocalState<User | null>(STORAGE_KEYS.currentUser, null);
  const { value: cart, setValue: setCart, isHydrated: isCartHydrated } = usePersistentLocalState<CartItem[]>(STORAGE_KEYS.cart, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const hydratedUser = isUserHydrated ? currentUser : null;
  const hydratedCart = isCartHydrated ? cart : [];

  const selectedCategory = searchParams.get("category") || "all";
  const searchTerm = searchParams.get("search") || "";

  const scrollToSection = (sectionId: string) => {
    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        updated = [...prev, { product, quantity }];
      }
      localStorage.setItem("th_cart", JSON.stringify(updated));
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev =>
      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
    );
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    window.open(`https://wa.me/201501593962?text=${text}`, "_blank");
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

  const filteredProducts = products.filter((product) => {
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
      : categories.find((category) => category.id === selectedCategory)?.name || "المنتجات";

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col justify-between">
      <Header 
        currentUser={hydratedUser} 
        onAccountClick={() => setIsAccountOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onLogout={() => setCurrentUser(null)} 
        cartCount={hydratedCart.reduce((sum, item) => sum + item.quantity, 0)}
        currentView="home"
        onAdminClick={() => router.push("/admin")}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        categories={categories}
        onContactClick={handleWhatsAppClick}
      />
      
      <main className="flex-grow">
        <HeroCarousel onShopNowClick={() => handleCategorySelect("all")} onWhatsAppClick={handleWhatsAppClick} />
        <div id="categories-section">
          <CategoriesList categories={categories} selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
        </div>
        <section id="catalog-section" className="py-12 bg-dark-bg border-b border-dark-border scroll-mt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-dark-border/40">
              <div className="text-right">
                <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">طارق هلال</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{catalogTitle}</h3>
              </div>
              <span className="text-xs text-gray-400">
                {filteredProducts.length} منتج
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p)}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={handleViewProduct}
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

      <Footer categories={categories} onCategorySelect={handleCategorySelect} onContactClick={handleWhatsAppClick} />

      {/* المودالز والنوافذ المنبثقة التفاعلية */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={hydratedCart} 
        onUpdateQuantity={(id: string, q: number) => {
          const updated = hydratedCart.map(item => item.product.id === id ? { ...item, quantity: q } : item).filter(item => item.quantity > 0);
          setCart(updated);
        }}
        onRemoveItem={(id: string) => {
          const updated = hydratedCart.filter(item => item.product.id !== id);
          setCart(updated);
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
        onLogin={setCurrentUser} 
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

export default function StoreFrontPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg" />}>
      <StoreFrontContent />
    </Suspense>
  );
}