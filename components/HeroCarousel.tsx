"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroCarouselProps {
  onShopNowClick: () => void;
  onWhatsAppClick: () => void;
}

const slides = [
  {
    id: 1,
    title: "كل ما تحتاجه لصالونك",
    subtitle: "جودة.. ثقة.. فخامة",
    description: "أكبر تشكيلة من كراسي الحلاقة والمغاسل والمعدات الاحترافية في مصر بأسعار خيالية وضمان حقيقي وضمان قطع الغيار.",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop",
    tagline: "الكراسي الهيدروليكية الفاخرة بأسعار مميزة"
  },
  {
    id: 2,
    title: "جهز صالونك بالكامل ووفر 10,000 جنيه",
    subtitle: "باقات التجهيز الذكية",
    description: "اختر بين باقة VIP أو الباقة الاحترافية الجاهزة، ووفر الكثير مع الهدايا والميزات الحصرية والتوصيل المجاني لكافة المحافظات.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
    tagline: "تأسيس الصالونات من الألف إلى الياء"
  },
  {
    id: 3,
    title: "الأجهزة الكهربائية والكماليات الأصلية",
    subtitle: "ماركات عالمية وأصلية 100%",
    description: "مجففات شعر، ماكينات تدريج احترافية، أجهزة بخار وعربات تنظيم لتسهيل عملك اليومي وضمان رضا عملائك.",
    image: "https://i.pinimg.com/originals/c4/14/41/c414414c44e5a76a11e841db88e91a23.jpg",
    tagline: "تقسيط ميسر يصل لـ 6 شهور بدون فوائد"
  }
];

export default function HeroCarousel({ onShopNowClick, onWhatsAppClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-dark-bg via-dark-bg to-dark-card border-b border-dark-border py-4 sm:py-6 md:py-10">
      {/* Visual background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-400/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-600/5 blur-3xl -z-10 pointer-events-none" />
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative min-h-[460px] xs:min-h-[490px] sm:min-h-[520px] md:min-h-[480px] lg:min-h-[500px] w-full flex items-center justify-center overflow-hidden">
          
          {/* Slide items */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center"
            >
              {/* Content Side */}
              <div className="flex flex-col text-center lg:text-right items-center lg:items-start order-2 lg:order-1 w-full relative z-10">
                <span className="text-gold-400 text-sm sm:text-base md:text-xl font-bold tracking-wide mb-1 sm:mb-2 block">
                  {slides[currentSlide].subtitle}
                </span>
                
                <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 sm:mb-4 tracking-tight">
                  {slides[currentSlide].title}
                </h2>
                
                <p className="text-xs sm:text-base md:text-lg text-gray-400 mb-3 sm:mb-5 max-w-xl leading-relaxed">
                  {slides[currentSlide].description}
                </p>
 
                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2.5 sm:gap-4">
                  <button
                    onClick={onShopNowClick}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 text-dark-bg font-extrabold text-xs sm:text-base px-5 py-3 sm:px-8 sm:py-3.5 rounded-xl shadow-lg shadow-gold-500/10 hover:from-gold-300 hover:to-gold-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>تسوق الآن</span>
                  </button>
                  
                  <button
                    onClick={onWhatsAppClick}
                    className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold text-xs sm:text-base px-5 py-3 sm:px-8 sm:py-3.5 rounded-xl hover:border-gold-400 transition-all duration-200"
                  >
                    {/* WhatsApp Icon */}
                    <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2.004 6.477 2.004 12C2.004 13.763 2.463 15.42 3.264 16.862L2 21.5L6.772 20.248C8.163 21.004 9.743 21.438 11.417 21.438C12.004 21.438 12.004 21.438 12.004 21.438C17.524 21.438 22.004 16.96 22.004 11.438C22.004 5.915 17.527 2.001 12.004 2ZM17.204 15.71C16.994 16.302 15.984 16.797 15.384 16.869C14.884 16.924 14.284 16.96 12.304 16.159C9.764 15.129 8.114 12.512 7.984 12.342C7.864 12.172 6.964 10.965 6.964 9.715C6.964 8.465 7.614 7.852 7.854 7.611C8.094 7.37 8.374 7.31 8.544 7.31H9.034C9.194 7.31 9.404 7.3 9.604 7.747C9.814 8.212 10.314 9.497 10.384 9.627C10.454 9.757 10.494 9.907 10.404 10.072C10.324 10.237 10.274 10.332 10.154 10.482C10.034 10.632 9.894 10.812 9.784 10.922C9.664 11.042 9.534 11.172 9.684 11.427C9.834 11.682 10.344 12.507 11.084 13.172C12.044 14.027 12.844 14.3 13.114 14.412C13.384 14.524 13.544 14.492 13.694 14.327C13.844 14.162 14.334 13.592 14.504 13.342C14.674 13.092 14.844 13.132 15.084 13.222C15.324 13.312 16.854 14.072 17.174 14.232C17.494 14.392 17.704 14.472 17.784 14.612C17.864 14.752 17.864 15.385 17.204 15.71Z" fill="currentColor"/>
                    </svg>
                    <span>تواصل واتساب</span>
                  </button>
                </div>
              </div>
 
              {/* Image Side */}
              <div className="flex relative order-1 lg:order-2 justify-center w-full mb-4 lg:mb-0">
                <div className="relative w-44 h-44 xs:w-52 xs:h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-[400px] lg:h-[400px] rounded-2xl overflow-hidden border border-gold-400/20 shadow-2xl bg-dark-card group">
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
 
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-card/60 hover:bg-gold-400 hover:text-dark-bg text-gray-300 border border-dark-border transition-all hidden md:block"
          title="الشريحة السابقة"
        >
          <ChevronRight size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-card/60 hover:bg-gold-400 hover:text-dark-bg text-gray-300 border border-dark-border transition-all hidden md:block"
          title="الشريحة التالية"
        >
          <ChevronLeft size={24} />
        </button>
 
        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-gold-400' : 'w-2 bg-dark-border hover:bg-gray-600'}`}
              title={`الذهاب للشريحة ${idx + 1}`}
            />
          ))}
        </div>
 
      </div>
    </section>
  );
}
