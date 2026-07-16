import React from "react";
import { CreditCard, Gift, Truck, Percent } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "تقسيط ميسر",
    desc: "ادفع على 6 شهور بدون فوائد"
  },
  {
    icon: Gift,
    title: "هدية مع كل طلب",
    desc: "عند شراء منتجات مختارة من المتجر"
  },
  {
    icon: Truck,
    title: "شحن سريع ومجاني",
    desc: "للطلبات بمبلغ فوق 20,000 جنيه"
  },
  {
    icon: Percent,
    title: "خصومات الأسبوع",
    desc: "خصومات حصرية تصل لـ 30%"
  }
];

export default function FeaturesRow() {
  return (
    <section className="bg-dark-card border-b border-dark-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-2xl bg-dark-bg border border-dark-border hover:border-gold-400/40 transition-all duration-300 group hover:scale-[1.01]"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 text-gold-400 group-hover:bg-gold-400 group-hover:text-dark-bg transition-colors duration-300 shrink-0">
                  <IconComponent size={24} />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {feat.desc}
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
