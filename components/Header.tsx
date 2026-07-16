"use client";
import React, { useState } from "react";
import { Search, ShoppingCart, User, Menu, Phone, MapPin, X, ChevronDown, ShieldAlert, LogOut } from "lucide-react";
import { Category, User as UserType } from "../src/types";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  categories: Category[];
  onContactClick: () => void;
  currentUser: UserType | null;
  onAccountClick: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
  currentView: string;
}

export default function Header({
  cartCount,
  onCartClick,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  onContactClick,
  currentUser,
  onAccountClick,
  onAdminClick,
  onLogout,
  currentView
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-dark-border bg-dark-bg/95 backdrop-blur-md">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex items-center justify-between gap-1 sm:gap-4">
            
            {/* Logo with Crown */}
            <div 
              onClick={() => onCategorySelect("all")} 
              className="flex items-center gap-1 sm:gap-3 cursor-pointer select-none group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/10 shrink-0">
                {/* Crown Icon / Logo Monogram */}
                <span className="font-extrabold text-sm sm:text-xl text-dark-bg font-sans tracking-tighter">TH</span>
                {/* Decorative Crown */}
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 text-gold-400 drop-shadow-[0_2px_4px_rgba(197,161,83,0.5)]">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M2 19h20v2H2v-2zm2-2.5l2-6.5 4 4 4-10 4 10 4-4 2 6.5H4z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs xs:text-sm sm:text-lg md:text-xl font-black text-white tracking-tight leading-none group-hover:text-gold-400 transition-colors">
                  طارق هلال
                </h1>
                <p className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] text-gold-400 font-medium tracking-tight mt-0.5 sm:mt-1 max-w-[110px] xs:max-w-[145px] sm:max-w-none leading-tight whitespace-normal sm:whitespace-nowrap">
                  لمستلزمات الكوافير وتجهيز الصالونات
                </p>
              </div>
            </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="ابحث عن منتج، كرسى، كوافير، صالون..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-dark-card border border-dark-border focus:border-gold-400 rounded-xl py-2.5 pr-11 pl-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchTerm && (
              <button 
                onClick={() => onSearchChange("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            {/* Admin Panel Access */}
            <button
              onClick={onAdminClick}
              className={`hidden sm:flex p-1.5 sm:px-3 sm:py-2.5 rounded-xl border items-center gap-1.5 transition-all text-xs font-bold ${currentView === "admin" ? "bg-gold-400 text-dark-bg border-gold-400" : "bg-dark-card border-dark-border text-gold-500 hover:bg-gold-50/50"}`}
              title="لوحة التحكم"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden lg:inline">لوحة التحكم</span>
            </button>

            {/* Account Info */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div 
                  onClick={onAccountClick}
                  className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-dark-card hover:bg-gold-50 cursor-pointer transition-colors border border-dark-border"
                >
                  <User className="text-gold-500 w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                  <div className="text-right max-w-[80px] sm:max-w-none overflow-hidden hidden sm:block">
                    <p className="text-[8px] sm:text-[9px] text-gray-500 leading-none">مرحباً</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-200 mt-0.5 truncate">{currentUser.first_name} {currentUser.last_name}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAccountClick}
                className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-dark-card hover:bg-dark-border/40 text-gray-200 border border-dark-border text-xs font-bold transition-colors"
              >
                <User className="text-gold-500 w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                <span className="hidden sm:inline">دخول / تسجيل</span>
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              className="relative p-1.5 sm:p-2.5 rounded-xl bg-gold-400 text-white hover:bg-gold-500 transition-all font-bold flex items-center gap-1 sm:gap-1.5 shadow-sm"
              id="cart-button"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold">السلة</span>
              <span className="bg-white/25 text-white text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl bg-dark-card border border-dark-border text-gray-300 hover:text-gold-500 md:hidden"
            >
              <Menu className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible only on Mobile */}
        <div className="mt-2.5 md:hidden relative">
          <input
            type="text"
            placeholder="ابحث عن منتج، كرسى، كوافير..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-dark-card border border-dark-border focus:border-gold-400 rounded-xl py-2 pr-10 pl-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Categories Row (Desktop) */}
      <div className="hidden md:block bg-dark-card border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Categories Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-2 bg-gold-400 text-white font-bold text-sm px-5 py-3.5 hover:bg-gold-500 transition-colors select-none"
              >
                <Menu size={16} />
                <span>كل الأقسام</span>
                <ChevronDown size={14} className={`transform transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-0.5 w-64 bg-dark-card border border-dark-border rounded-b-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      onCategorySelect("all");
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 text-sm transition-colors hover:bg-dark-border flex items-center justify-between ${selectedCategory === "all" ? "text-gold-500 font-semibold" : "text-gray-700"}`}
                  >
                    <span>جميع المنتجات</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onCategorySelect(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2.5 text-sm transition-colors hover:bg-dark-border flex items-center justify-between ${selectedCategory === cat.id ? "text-gold-500 font-semibold" : "text-gray-700"}`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => onCategorySelect("all")}
                className={`px-4 py-3.5 text-sm font-medium transition-colors border-b-2 hover:text-gold-500 ${selectedCategory === "all" && currentView === "home" ? "border-gold-400 text-gold-500 font-semibold" : "border-transparent text-gray-600"}`}
              >
                الرئيسية
              </button>
              <button
                onClick={() => onCategorySelect("salon-bundles")}
                className={`px-4 py-3.5 text-sm font-medium transition-colors border-b-2 hover:text-gold-500 ${selectedCategory === "salon-bundles" ? "border-gold-400 text-gold-500 font-semibold" : "border-transparent text-gray-600"}`}
              >
                العروض والباقات
              </button>
              <button
                onClick={() => onCategorySelect("barber-chairs")}
                className={`px-4 py-3.5 text-sm font-medium transition-colors border-b-2 hover:text-gold-500 ${selectedCategory === "barber-chairs" ? "border-gold-400 text-gold-500 font-semibold" : "border-transparent text-gray-600"}`}
              >
                كراسي حلاقة
              </button>
              <button
                onClick={() => onCategorySelect("women-chairs")}
                className={`px-4 py-3.5 text-sm font-medium transition-colors border-b-2 hover:text-gold-500 ${selectedCategory === "women-chairs" ? "border-gold-400 text-gold-500 font-semibold" : "border-transparent text-gray-600"}`}
              >
                كراسي حريمي
              </button>
              <button
                onClick={() => onCategorySelect("shampoo-units")}
                className={`px-4 py-3.5 text-sm font-medium transition-colors border-b-2 hover:text-gold-500 ${selectedCategory === "shampoo-units" ? "border-gold-400 text-gold-500 font-semibold" : "border-transparent text-gray-600"}`}
              >
                مغاسل وشامبو
              </button>
              <button
                onClick={onContactClick}
                className="px-4 py-3.5 text-sm font-medium transition-colors border-b-2 border-transparent text-gray-600 hover:text-gold-500"
              >
                تواصل معنا
              </button>
            </nav>

            {/* Quick Contact Info */}
            <div className="flex items-center gap-2 text-gold-500">
              <Phone size={16} />
              <a 
                href="https://wa.me/201501593962?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A7%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A7%D8%B9%D8%B1%D9%81%20%D8%A7%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%87%D9%84%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%20%D9%86%D8%AA%D9%83%D9%84%D9%85" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold font-mono hover:text-gold-400 transition-colors"
                dir="ltr"
              >
                +20 150 159 3962
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Drawer Navigation */}
    {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-4/5 max-w-xs bg-dark-bg border-l border-dark-border p-5 shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-gold-400">طارق هلال</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 flex flex-col gap-2.5">
              {/* User Account / Session Status on Mobile */}
              {currentUser ? (
                <div className="p-3 mb-2 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400">
                      <User size={16} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 leading-none">مرحباً بك</p>
                      <p className="text-xs font-bold text-gray-200 mt-1">{currentUser.first_name} {currentUser.last_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-medium flex items-center gap-1"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={12} />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onAccountClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-400 text-dark-bg font-bold text-xs hover:bg-gold-500 transition-colors"
                >
                  <User size={16} />
                  <span>دخول / تسجيل حساب</span>
                </button>
              )}

              <p className="text-[10px] text-gray-400 font-bold px-2">أقسام المتجر الرئيسية</p>
              <button
                onClick={() => {
                  onCategorySelect("all");
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right px-4 py-2.5 rounded-xl transition-colors text-xs ${selectedCategory === "all" ? "bg-gold-400/10 text-gold-400 font-bold border border-gold-400/20" : "hover:bg-dark-card/50 text-gray-300"}`}
              >
                جميع المنتجات
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategorySelect(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2.5 rounded-xl transition-colors text-xs ${selectedCategory === cat.id ? "bg-gold-400/10 text-gold-400 font-bold border border-gold-400/20" : "hover:bg-dark-card/50 text-gray-300"}`}
                >
                  {cat.name}
                </button>
              ))}

              <hr className="border-dark-border my-2" />
              <p className="text-[10px] text-gray-400 font-bold px-2">روابط سريعة</p>
              <button
                onClick={() => {
                  onAdminClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl hover:bg-dark-card/50 text-gray-300 text-xs flex items-center justify-between"
              >
                <span>لوحة تحكم المدير</span>
                <span className="bg-gold-400/10 text-gold-400 border border-gold-400/20 px-2 py-0.5 rounded text-[9px] font-bold">تجريبي</span>
              </button>
              <button
                onClick={() => {
                  onContactClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl hover:bg-dark-card/50 text-gray-300 text-xs"
              >
                تواصل معنا مباشر
              </button>
              <div className="mt-6 p-4 rounded-xl bg-dark-card border border-dark-border flex flex-col gap-2.5">
                <div className="flex items-center gap-3 text-gray-300 text-xs">
                  <Phone size={14} className="text-gold-500 shrink-0" />
                  <a href="https://wa.me/201501593962?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A7%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A7%D8%B9%D8%B1%D9%81%20%D8%A7%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%87%D9%84%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%20%D9%86%D8%AA%D9%83%D9%84%D9%85" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors font-mono" dir="ltr">
                    +20 150 159 3962
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-xs">
                  <Phone size={14} className="text-gold-500 shrink-0" />
                  <a href="https://wa.me/201061420833?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A7%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A7%D8%B9%D8%B1%D9%81%20%D8%A7%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%87%D9%84%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%20%D9%86%D8%AA%D9%83%D9%84%D9%85" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors font-mono" dir="ltr">
                    +20 106 142 0833
                  </a>
                </div>
                <div className="flex items-start gap-3 text-gray-300 text-xs">
                  <MapPin size={14} className="text-gold-500 shrink-0 mt-0.5" />
                  <span className="text-right">
                    المنصورة - شارع الجمهورية برج السوسن
                  </span>
                </div>
                <div className="flex items-start gap-3 text-gray-300 text-xs">
                  <MapPin size={14} className="text-gold-500 shrink-0 mt-0.5" />
                  <a 
                    href="https://maps.app.goo.gl/yabfjH64eTrtc8NN8" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-gold-400 transition-colors text-right"
                  >
                    القاهرة - النزهة الجديدة ش طه حسين أمام مستشفى السعودي الألماني
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
