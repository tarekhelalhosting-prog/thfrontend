"use client";
import React from "react";
import Image from "next/image";
import { Phone, MapPin, ChevronUp, ArrowLeft } from "lucide-react";
import { Category } from "../src/types";

interface FooterProps {
  categories: Category[];
  onCategorySelect: (id: string) => void;
  onContactClick: () => void;
}

export default function Footer({ categories, onCategorySelect, onContactClick }: FooterProps) {
  const logoSrc = "/file.png";
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsAppFloat = () => {
    const text = encodeURIComponent("مرحبا استاذ طارق انا مهتم اعرف اكتر عن باقات التجهيز هل مناسب نتكلم");
    window.open(`https://wa.me/201501593962?text=${text}`, "_blank");
  };

  return (
    <footer className="relative bg-dark-bg border-t border-dark-border text-gray-400 text-xs sm:text-sm pt-16 pb-8">
      
      {/* Scroll to Top floating Button (Desktop-only visual) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
          onClick={scrollToTop}
          className="p-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-dark-bg transition-all shadow-xl hover:scale-105 active:scale-95"
          title="صعود للأعلى"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12 pb-12 border-b border-dark-border/40">
          
          {/* Logo & About Column (4 columns) */}
          <div className="lg:col-span-4 text-right">
            <div className="flex items-center gap-3 mb-4 select-none">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gold-400/30 shadow-md shadow-gold-500/10 bg-dark-card shrink-0">
                <Image
                  src={logoSrc}
                  alt="شعار طارق هلال"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base sm:text-lg font-black text-white leading-none">
                  طارق هلال
                </h3>
                <p className="text-[8px] text-gold-400 font-bold tracking-widest mt-1">
                  لمعدات وتجهيزات صالونات الحلاقة
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-sm">
              نحن في طارق هلال نوفر كل ما تحتاجه صالونات الحلاقة والتجميل في مصر من كراسي هيدروليك، مغاسل شعر، مرايا مضيئة، وأجهزة كهربائية أصلية بأعلى جودة وأفضل الأسعار مع الضمان الحقيقي وقطع الغيار.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-2.5">
              <a
                href="https://www.facebook.com/tarek.helal.store/?locale=ar_AR"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="فيسبوك"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M13.5 22V12.9H16.6L17.1 9.4H13.5V7.2C13.5 6.2 13.8 5.5 15.3 5.5H17.2V2.3C16.3 2.2 15.4 2.1 14.5 2.1C11.8 2.1 10 3.8 10 7V9.4H7V12.9H10V22H13.5Z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@tarek.helal.center"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="تيك توك"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M14.4 3H17.2C17.3 4 17.8 4.9 18.6 5.5C19.4 6.1 20.4 6.4 21.4 6.4V9.2C20.1 9.2 18.8 8.8 17.7 8V14.2C17.7 18.1 14.5 21.3 10.6 21.3C6.7 21.3 3.5 18.1 3.5 14.2C3.5 10.3 6.7 7.1 10.6 7.1C11.1 7.1 11.5 7.1 12 7.2V10.2C11.6 10.1 11.1 10 10.6 10C8.3 10 6.4 11.9 6.4 14.2C6.4 16.5 8.3 18.4 10.6 18.4C12.9 18.4 14.8 16.6 14.8 14.2V3H14.4Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column (2 columns) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-4 relative pb-2 inline-block">
              روابط سريعة
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-gold-400 rounded" />
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <button onClick={() => onCategorySelect("salon-bundles")} className="hover:text-gold-400 transition-colors">عروض التجهيز</button>
              </li>
              <li>
                <span className="hover:text-gold-400 transition-colors cursor-pointer">سياسة الضمان</span>
              </li>
              <li>
                <span className="hover:text-gold-400 transition-colors cursor-pointer">سياسة الاستبدال والاسترجاع</span>
              </li>
            </ul>
          </div>

          {/* Categories Column (2 columns) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-4 relative pb-2 inline-block">
              الأقسام
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-gold-400 rounded" />
            </h4>
            <ul className="flex flex-col gap-3">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategorySelect(cat.id)}
                    className="hover:text-gold-400 transition-colors text-right"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info Column (2 columns) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-4 relative pb-2 inline-block">
              تواصل معنا
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-gold-400 rounded" />
            </h4>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-center gap-2 justify-start font-mono">
                <Phone size={14} className="text-gold-400 shrink-0" />
                <a 
                  href="https://wa.me/201501593962?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A7%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A7%D8%B9%D8%B1%D9%81%20%D8%A7%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%87%D9%84%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%20%D9%86%D8%AA%D9%83%D9%84%D9%85" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold-400 transition-colors"
                  dir="ltr"
                >
                  +20 150 159 3962
                </a>
              </li>
              <li className="flex items-center gap-2 justify-start font-mono">
                <Phone size={14} className="text-gold-400 shrink-0" />
                <a 
                  href="https://wa.me/201061420833?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A7%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A7%D8%B9%D8%B1%D9%81%20%D8%A7%D9%83%D8%AA%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%87%D9%84%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%20%D9%86%D8%AA%D9%83%D9%84%D9%85" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold-400 transition-colors"
                  dir="ltr"
                >
                  +20 106 142 0833
                </a>
              </li>
            </ul>
          </div>

          {/* Branches Column (2 columns) */}
          <div className="lg:col-span-2 text-right">
            <h4 className="text-sm font-bold text-white mb-4 relative pb-2 inline-block">
              فروعنا
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-gold-400 rounded" />
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li className="flex items-start gap-1.5 justify-start">
                <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" />
                <span>المنصورة - شارع الجمهورية برج السوسن</span>
              </li>
              <li className="flex items-start gap-1.5 justify-start">
                <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/yabfjH64eTrtc8NN8" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold-400 transition-colors text-right"
                >
                  القاهرة - النزهة الجديدة ش طه حسين أمام مستشفى السعودي الألماني
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>
            جميع الحقوق محفوظة © 2026 متجر طارق هلال لمعدات الصالونات.
          </p>
          <p className="flex items-center gap-1">
            <span>تم التطوير بكل حب لأجل صالونات الحلاقة الفاخرة</span>
          </p>
        </div>

      </div>

    </footer>
  );
}
