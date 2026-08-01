import React from "react";
import { Quote, Star } from "lucide-react";
import { Review } from "../src/types";

interface CustomerReviewsProps {
  reviews: Review[];
}

const defaultReviews: Review[] = [
  {
    id: "rev-1",
    name: "كابتن أحمد حسن",
    city: "القاهرة - الدقي",
    text: "بصراحة الكراسي الهيدروليك اللي أخدتها من طارق هلال حاجة محترمة جداً وشغالة الله ينور في المحل بقالها سنة وزي الفل، والزبائن دايماً بيشكروا في راحتها.",
    rating: 5,
    image: ""
  },
  {
    id: "rev-2",
    name: "الأسطورة مصطفى صابر",
    city: "الإسكندرية - سموحة",
    text: "التعامل مع الحاج طارق في قمة الأمانة والمصداقية. جهزت الصالون بالكامل من عنده (كراسي، مغاسل ومرايا مضيئة) وجالي الشحن لغاية الإسكندرية مغلف بطريقة ممتازة وبدون أي خدش.",
    rating: 5,
    image: ""
  },
  {
    id: "rev-3",
    name: "المعلم محمود الجارحي",
    city: "المنصورة - شارع الجلاء",
    text: "أفضل أسعار تجهيزات في مصر وضمان حقيقي. لسه جايب باقة التأسيس الذهبية وبجد وفرت عليا كتير جداً مقارنة بأسعار السوق برة، والتوصيل كان سريع جداً.",
    rating: 5,
    image: ""
  },
  {
    id: "rev-4",
    name: "الأسطى تامر عاشور",
    city: "الجيزة - الهرم",
    text: "خدمة ما بعد البيع عندهم ممتازة، اتصلت بيهم عشان قطعة غيار بسيطة بعتوها لي تاني يوم علطول. ناس محترمة وبتخاف على زبائنها بجد، أنصح أي حد بيفتح محل جديد يشتري منهم وهو مغمض.",
    rating: 5,
    image: ""
  }
];

export default function CustomerReviews({ reviews }: CustomerReviewsProps) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-12 bg-dark-bg border-b border-dark-border">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-gold-400 font-bold text-xs uppercase tracking-widest block mb-1">آراء عملائنا</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white relative inline-block">
            ماذا يقولون عن طارق هلال؟
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gold-400 rounded-full" />
          </h3>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="relative p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-gold-400/40 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Quote Icon Background */}
              <Quote size={40} className="absolute top-4 left-4 text-gold-400/5 group-hover:text-gold-400/10 transition-colors pointer-events-none" />

              <div>
                {/* Star rating */}
                <div className="flex text-yellow-500 gap-0.5 mb-4 justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="currentColor"
                      className="text-yellow-500"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-right mb-6 italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 border-t border-dark-border/40 pt-4 mt-auto">
                {/* Avatar with placeholder initials inside premium circle (No images as requested) */}
                <div className="w-10 h-10 rounded-full border border-gold-400/30 bg-gradient-to-br from-gold-500/10 to-gold-600/30 shrink-0 flex items-center justify-center font-extrabold text-gold-400 text-sm select-none">
                  {rev.name ? rev.name.replace(/^(كابتن|الأسطورة|المعلم|الأسطى)\s+/, "").trim().charAt(0) : "م"}
                </div>

                <div className="text-right">
                  <h4 className="text-sm font-bold text-gray-100 group-hover:text-gold-400 transition-colors">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                    {rev.city}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
