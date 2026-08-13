"use client";
import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-dark-card to-dark-bg border-b border-dark-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            عن <span className="text-gold-400">طارق هلال</span>
          </h1>
          <p className="text-xl text-gold-400 font-semibold">
            متخصصون في معدات وتجهيزات صالونات الحلاقة والتجميل
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* من نحن */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gold-400 rounded-full"></div>
            <h2 className="text-4xl font-black text-white">من نحن</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-gray-400">
              مرحباً بك في متجر طارق هلال! نحن متخصصون في توفير أفضل معدات وتجهيزات صالونات الحلاقة والتجميل في مصر، 
              حيث نقدم لك كل ما تحتاجه من كراسي هيدروليك فاخرة، مغاسل شعر احترافية، وأجهزة كهربائية أصلية بأعلى جودة.
            </p>
            <p className="text-gray-400">
              بدأنا رحلتنا برؤية واضحة وهي توفير تجربة تسوق ممتازة وآمنة لجميع أصحاب الصالونات والعاملين بمجال التجميل. 
              مع سنوات من الخبرة، أصبحنا اسماً موثوقاً يعتمد عليه الآلاف من العملاء في جميع أنحاء مصر.
            </p>
          </div>
        </section>

        {/* الرؤية والرسالة */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gold-400 rounded-full"></div>
            <h2 className="text-4xl font-black text-white">رسالتنا وقيمنا</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-card border border-dark-border/50 p-8 rounded-2xl hover:border-gold-400/30 transition-all">
              <h3 className="text-2xl font-black text-gold-400 mb-4">رسالتنا</h3>
              <p className="text-gray-400 leading-relaxed">
                تقديم معدات وخدمات عالية الجودة لصالونات الحلاقة والتجميل بأسعار منافسة وعادلة، 
                مع الالتزام الكامل بخدمة عملاء متميزة وضمان الرضا التام.
              </p>
            </div>
            <div className="bg-dark-card border border-dark-border/50 p-8 rounded-2xl hover:border-gold-400/30 transition-all">
              <h3 className="text-2xl font-black text-gold-400 mb-4">رؤيتنا</h3>
              <p className="text-gray-400 leading-relaxed">
                أن نكون الخيار الأول والموثوق لكل من يبحث عن معدات متميزة واحترافية، 
                معروفين بالثقة والجودة والخدمة المتفوقة.
              </p>
            </div>
          </div>
        </section>

        {/* لماذا تختارنا */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gold-400 rounded-full"></div>
            <h2 className="text-4xl font-black text-white">لماذا تختارنا</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'جودة عالية', desc: 'منتجات أصلية بمعايير عالمية' },
              { title: 'أسعار عادلة', desc: 'أفضل الأسعار مع ضمان الجودة' },
              { title: 'خدمة متميزة', desc: 'فريق محترف يساعدك 24/7' },
              { title: 'ضمان كامل', desc: 'ضمان شامل على جميع المنتجات' },
              { title: 'توصيل آمن', desc: 'تجهيزات كاملة وآمنة وسريعة' },
              { title: 'فروع متعددة', desc: 'المنصورة والقاهرة (النزهة)' },
            ].map((item, idx) => (
              <div key={idx} className="bg-dark-card border border-dark-border/50 p-6 rounded-lg hover:border-gold-400/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center shrink-0 group-hover:bg-gold-400/20 transition-all">
                    <ChevronRight className="text-gold-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-dark-card border border-gold-400/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">عندك أي استفسار؟</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            فريقنا جاهز لمساعدتك والإجابة على جميع أسئلتك في أي وقت
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/201021750655" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gold-400 hover:bg-gold-500 text-dark-bg font-black px-8 py-3 rounded-lg transition-all"
            >
              واتس آب
            </a>
            <a
              href="mailto:tarekhelalstore@gmail.com"
              className="border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-dark-bg font-black px-8 py-3 rounded-lg transition-all"
              dir="ltr"
            >
              tarekhelalstore@gmail.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
