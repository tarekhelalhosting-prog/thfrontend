import React from "react";
import { Category } from "../src/types";

interface CategoriesListProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
}

export default function CategoriesList({ categories, selectedCategory, onCategorySelect }: CategoriesListProps) {
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

        {/* Mobile: horizontal scroller with 3 cards visible */}
        <div className="md:hidden">
          {categories.length > 3 && (
            <div className="mb-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-gold-500/90">
              <span>اسحب يمين او شمال لعرض باقي الأقسام</span>
            </div>
          )}

          <div
            className="relative -mx-4 px-4 overflow-x-auto pb-2 touch-pan-x snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="grid grid-flow-col auto-cols-[calc((100%-1.5rem)/3)] gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  className={`snap-start cursor-pointer rounded-2xl p-3 bg-dark-card border transition-all duration-300 text-center flex flex-col items-center justify-between group select-none min-h-[118px] ${isSelected ? 'border-gold-400 shadow-lg shadow-gold-500/10' : 'border-dark-border hover:border-gold-400/30'}`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-dark-border group-hover:border-gold-400/40 transition-colors mb-2.5 flex items-center justify-center bg-dark-bg">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div>
                    <h4 className={`text-[11px] font-bold transition-colors leading-snug ${isSelected ? 'text-gold-400' : 'text-gray-200 group-hover:text-gold-400'}`}>
                      {cat.name}
                    </h4>
                  </div>
                </button>
              );
            })}
            </div>

            {categories.length > 3 && (
              <>
                <div className="pointer-events-none absolute inset-y-0 right-4 w-7 bg-gradient-to-l from-dark-bg to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 left-4 w-7 bg-gradient-to-r from-dark-bg to-transparent" />
              </>
            )}
          </div>
        </div>

        {/* Desktop/Tablet: classic grid */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`cursor-pointer rounded-2xl p-4 bg-dark-card border transition-all duration-300 text-center flex flex-col items-center justify-between group hover:scale-[1.03] select-none ${isSelected ? 'border-gold-400 shadow-lg shadow-gold-500/10' : 'border-dark-border hover:border-gold-400/30'}`}
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
                  <h4 className={`text-xs sm:text-sm font-bold transition-colors ${isSelected ? 'text-gold-400' : 'text-gray-200 group-hover:text-gold-400'}`}>
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 group-hover:text-gold-300 transition-colors mt-1 font-medium">
                    عرض المنتجات المرتبطة بهذا القسم
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
