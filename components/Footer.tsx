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
  const logoSrc = "/WhatsApp%20Image%202026-07-17%20at%2010.31.27%20PM.jpeg";
  
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
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="فيسبوك"
              >
                {/* Facebook Icon */}
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="إنستغرام"
              >
                {/* insta Icon */}
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-all"
                title="يوتيوب"
              >
                {/* YouTube Icon */}
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
