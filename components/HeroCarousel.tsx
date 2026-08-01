"use client";
import React from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface HeroCarouselProps {
  onShopNowClick: () => void;
  onWhatsAppClick: () => void;
}

const heroContent = {
  title: "كل ما تحتاجه لصالونك",
  subtitle: "جودة.. ثقة.. فخامة",
  description:
    "أكبر تشكيلة من كراسي الحلاقة والمغاسل والمعدات الاحترافية في مصر بأسعار خيالية وضمان حقيقي وضمان قطع الغيار.",
  image: "/luxury-coffee-shop-table-inside-barista-bar-generated-by-ai.jpg",
};

export default function HeroCarousel({ onShopNowClick, onWhatsAppClick }: HeroCarouselProps) {
  return (
    <section className="relative bg-dark-bg py-5 sm:py-8 md:py-10">
      <div className="max-w-7xl 2xl:max-w-[2500px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-400/20 shadow-xl shadow-gold-900/5">
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={heroContent.image}
              alt={heroContent.title}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 min-h-[400px] sm:min-h-[440px] md:min-h-[480px] w-full flex items-center px-5 py-10 sm:px-10 sm:py-14 md:px-14">
            <div className="w-full max-w-3xl mx-auto lg:mr-0 lg:ml-auto text-center lg:text-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 backdrop-blur-sm px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-[11px] sm:text-sm font-bold tracking-wide text-gold-300 mb-4 sm:mb-5">
                {heroContent.subtitle}
              </span>

              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[rgb(255,255,255)] leading-tight mb-3 sm:mb-4 tracking-tight drop-shadow-[0_3px_14px_rgba(0,0,0,0.5)]">
                {heroContent.title}
              </div>

              <p className="text-sm sm:text-base md:text-lg !text-stone-100 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                {heroContent.description}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2.5 sm:gap-4">
                <button
                  onClick={onShopNowClick}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 text-dark-bg font-extrabold text-xs sm:text-base px-5 py-3 sm:px-8 sm:py-3.5 rounded-xl shadow-lg shadow-gold-500/20 hover:from-gold-300 hover:to-gold-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>تسوق الآن</span>
                </button>

                <button
                  onClick={onWhatsAppClick}
                  className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/25 text-[rgb(255,255,255)] font-bold text-xs sm:text-base px-5 py-3 sm:px-8 sm:py-3.5 rounded-xl hover:border-gold-400 transition-all duration-200"
                >
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2.004 6.477 2.004 12C2.004 13.763 2.463 15.42 3.264 16.862L2 21.5L6.772 20.248C8.163 21.004 9.743 21.438 11.417 21.438C12.004 21.438 12.004 21.438 12.004 21.438C17.524 21.438 22.004 16.96 22.004 11.438C22.004 5.915 17.527 2.001 12.004 2ZM17.204 15.71C16.994 16.302 15.984 16.797 15.384 16.869C14.884 16.924 14.284 16.96 12.304 16.159C9.764 15.129 8.114 12.512 7.984 12.342C7.864 12.172 6.964 10.965 6.964 9.715C6.964 8.465 7.614 7.852 7.854 7.611C8.094 7.37 8.374 7.31 8.544 7.31H9.034C9.194 7.31 9.404 7.3 9.604 7.747C9.814 8.212 10.314 9.497 10.384 9.627C10.454 9.757 10.494 9.907 10.404 10.072C10.324 10.237 10.274 10.332 10.154 10.482C10.034 10.632 9.894 10.812 9.784 10.922C9.664 11.042 9.534 11.172 9.684 11.427C9.834 11.682 10.344 12.507 11.084 13.172C12.044 14.027 12.844 14.3 13.114 14.412C13.384 14.524 13.544 14.492 13.694 14.327C13.844 14.162 14.334 13.592 14.504 13.342C14.674 13.092 14.844 13.132 15.084 13.222C15.324 13.312 16.854 14.072 17.174 14.232C17.494 14.392 17.704 14.472 17.784 14.612C17.864 14.752 17.864 15.385 17.204 15.71Z" fill="currentColor" />
                  </svg>
                  <span>تواصل واتساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
