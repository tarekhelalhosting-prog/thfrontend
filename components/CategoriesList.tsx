import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "../src/types";

interface CategoriesListProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
}

export default function CategoriesList({ categories, selectedCategory, onCategorySelect }: CategoriesListProps) {
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const desktopFirstItemRef = useRef<HTMLButtonElement>(null);
  const desktopLastItemRef = useRef<HTMLButtonElement>(null);
  const [desktopFirstVisible, setDesktopFirstVisible] = useState(true);
  const [desktopLastVisible, setDesktopLastVisible] = useState(false);

  // Desktop edge arrows: track the first/last card's visibility so each arrow
  // disappears once the user has scrolled to that edge.
  useEffect(() => {
    const scroller = desktopScrollerRef.current;
    const firstItem = desktopFirstItemRef.current;
    const lastItem = desktopLastItemRef.current;
    if (!scroller || !firstItem || !lastItem) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === firstItem) setDesktopFirstVisible(entry.isIntersecting);
          if (entry.target === lastItem) setDesktopLastVisible(entry.isIntersecting);
        });
      },
      { root: scroller, threshold: 0.95 }
    );

    observer.observe(firstItem);
    observer.observe(lastItem);
    return () => observer.disconnect();
  }, [categories.length]);

  const scrollDesktop = (direction: "left" | "right") => {
    const scroller = desktopScrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction === "left" ? -scroller.clientWidth * 0.85 : scroller.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-12 bg-dark-bg border-b border-dark-border">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-10 relative">
          <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">طارق هلال</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white relative inline-block">
            تصفح الأقسام
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gold-400 rounded-full" />
          </h3>
        </div>

        {/* Mobile: two cards per view leave room for each category description. */}
        <div className="md:hidden">
          {categories.length > 2 && (
            <div className="mb-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-gold-500/90">
              <span>اسحب يمين او شمال لعرض باقي الأقسام</span>
            </div>
          )}

          <div
            data-scroller
            className="relative -mx-4 px-4 overflow-x-auto pb-2 touch-pan-x snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="grid grid-flow-col auto-cols-[calc((100%-0.75rem)/2)] gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  className={`snap-start cursor-pointer rounded-2xl p-3 bg-dark-card border transition-all duration-300 text-center flex flex-col items-center group select-none min-h-[168px] ${isSelected ? 'border-gold-400 shadow-lg shadow-gold-500/10' : 'border-dark-border hover:border-gold-400/30'}`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-dark-border group-hover:border-gold-400/40 transition-colors mb-2.5 flex items-center justify-center bg-dark-bg">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold transition-colors leading-snug ${isSelected ? 'text-gold-400' : 'text-gray-200 group-hover:text-gold-400'}`}>
                      {cat.name}
                    </p>
                    {cat.description ? (
                      <p className="mt-1.5 overflow-hidden text-[10px] font-medium leading-4 text-gray-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {cat.description}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
            </div>

          </div>
        </div>

        {/* Desktop/Tablet: horizontal carousel with arrow navigation */}
        <div className="relative hidden md:block">
          <div
            ref={desktopScrollerRef}
            dir="rtl"
            className="overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="grid grid-flow-col auto-cols-[calc((100%-3rem)/4)] lg:auto-cols-[calc((100%-6rem)/7)] gap-4">
              {categories.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    ref={index === 0 ? desktopFirstItemRef : index === categories.length - 1 ? desktopLastItemRef : undefined}
                    onClick={() => onCategorySelect(cat.id)}
                    className={`snap-start min-h-[210px] cursor-pointer rounded-2xl p-4 bg-dark-card border transition-all duration-300 text-center flex flex-col items-center group hover:scale-[1.03] select-none ${isSelected ? 'border-gold-400 shadow-lg shadow-gold-500/10' : 'border-dark-border hover:border-gold-400/30'}`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-dark-border group-hover:border-gold-400/40 transition-colors mb-3 flex items-center justify-center bg-dark-bg">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="mt-2">
                      <p className={`text-xs sm:text-sm font-bold transition-colors ${isSelected ? 'text-gold-400' : 'text-gray-200 group-hover:text-gold-400'}`}>
                        {cat.name}
                      </p>
                      {cat.description ? (
                        <p className="mt-1.5 overflow-hidden text-[10px] font-medium leading-4 text-gray-400 transition-colors group-hover:text-gold-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                          {cat.description}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!desktopLastVisible ? (
            <button
              type="button"
              onClick={() => scrollDesktop("left")}
              aria-label="عرض الأقسام التالية"
              title="عرض الأقسام التالية"
              className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400/40 bg-dark-card/95 text-gold-500 shadow-xl transition-colors hover:bg-gold-400 hover:text-dark-bg"
            >
              <ChevronLeft size={20} />
            </button>
          ) : null}
          {!desktopFirstVisible ? (
            <button
              type="button"
              onClick={() => scrollDesktop("right")}
              aria-label="عرض الأقسام السابقة"
              title="عرض الأقسام السابقة"
              className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400/40 bg-dark-card/95 text-gold-500 shadow-xl transition-colors hover:bg-gold-400 hover:text-dark-bg"
            >
              <ChevronRight size={20} />
            </button>
          ) : null}
        </div>

      </div>
    </section>
  );
}
