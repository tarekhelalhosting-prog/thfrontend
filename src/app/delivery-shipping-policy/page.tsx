"use client";
import React from 'react';
import { Truck } from 'lucide-react';

export default function DeliveryShippingPolicy() {
  const sections = [
    {
      num: "1",
      title: "مناطق التوصيل",
      content: "نوفر خدمة توصيل الطلبات إلى المناطق المتاحة وفقًا لإمكانية التوصيل لكل طلب.\n\nقد تختلف إمكانية التوصيل وطريقته من منطقة إلى أخرى، ويتم تحديد ذلك وفقًا لموقع العميل وطبيعة الطلب."
    },
    {
      num: "2",
      title: "طريقة التوصيل",
      content: "قد يتم توصيل الطلب من خلال شركات شحن موثوقة أو من خلال مندوب تابع لنا، وذلك حسب المنطقة وطبيعة الطلب.\n\nنختار شركات التوصيل بعناية لضمان وصول الطلب بأفضل حالة ممكنة."
    },
    {
      num: "3",
      title: "مدة التوصيل",
      content: "نحرص على توصيل طلباتكم في أسرع وقت ممكن، وتختلف مدة التوصيل حسب موقع العميل.\n\n- الوجه البحري: من 2 إلى 5 أيام عمل.\n- الوجه القبلي: من 3 إلى 7 أيام عمل.\n\nتبدأ مدة التوصيل من تاريخ تأكيد الطلب.\n\nقد يحدث تأخير في موعد التسليم عن المدة المذكورة في بعض الحالات الخارجة عن إرادتنا، مثل الظروف الطارئة أو وجود مشكلات أو تأخيرات لدى شركات الشحن. وفي هذه الحالة، سيتم متابعة الطلب والعمل على توصيله في أقرب وقت ممكن."
    },
    {
      num: "4",
      title: "رسوم التوصيل",
      content: "تختلف رسوم التوصيل حسب موقع العميل، وحجم الطلب، وطريقة التوصيل المستخدمة.\n\nفي حال وجود رسوم توصيل، يتم توضيحها للعميل قبل إتمام الطلب بشكل واضح وشفاف."
    },
    {
      num: "5",
      title: "استلام الطلب",
      content: "يرجى التأكد من صحة بيانات التواصل والعنوان المدخل عند إتمام الطلب، حتى نتمكن من التواصل معكم وتوصيل الطلب بشكل صحيح.\n\nفي حالة وجود أي مشكلة متعلقة بالتوصيل أو الطلب، يمكن التواصل معنا من خلال وسائل التواصل المتاحة على الموقع."
    },
    {
      num: "6",
      title: "تأخر التوصيل",
      content: "قد تحدث بعض التأخيرات الخارجة عن إرادتنا نتيجة لظروف متعلقة بالتوصيل أو المنطقة أو شركة الشحن المستخدمة.\n\nفي هذه الحالات نسعى إلى متابعة الطلب والعمل على إتمام التوصيل في أقرب وقت ممكن مع ضمان وصوله بسلام."
    },
    {
      num: "7",
      title: "المنتجات عند الاستلام",
      content: "نوصي العميل بالتأكد من حالة المنتجات عند استلام الطلب، وفي حالة وجود أي مشكلة أو تلف ظاهر، يرجى التواصل معنا في أقرب وقت ممكن حتى يتم التعامل مع المشكلة بسرعة."
    },
    {
      num: "8",
      title: "ملاحظات عامة",
      content: "قد يتم تحديث إجراءات الشحن والتوصيل من وقت لآخر بما يتناسب مع طبيعة الخدمة وشركات التوصيل المتاحة.\n\nتخضع تفاصيل التوصيل الخاصة بكل طلب للبيانات والمعلومات التي يتم توضيحها للعميل أثناء عملية الطلب."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-dark-card to-dark-bg border-b border-dark-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-gold-400" />
            <h1 className="text-5xl font-black text-white">سياسة الشحن والتوصيل</h1>
          </div>
          <p className="text-lg text-gold-400">نسعى دائماً لتوصيل طلبك بأفضل طريقة ممكنة</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">

          <div className="text-gray-400 text-lg leading-relaxed bg-dark-card border border-dark-border/50 p-8 rounded-xl">
            <p>
              نسعى في طارق هلال لتوصيل طلباتكم بأفضل طريقة ممكنة، مع الحرص على وصول المنتجات إليكم بحالة جيدة وفي أقرب وقت ممكن.
            </p>
          </div>

          {sections.map((section, idx) => (
            <section key={idx}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gold-400 rounded-full"></div>
                <h2 className="text-3xl font-black text-white">{section.num}. {section.title}</h2>
              </div>
              <div className="bg-dark-card border border-dark-border/50 rounded-xl p-8 text-gray-400 space-y-4">
                {section.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ))}

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
    </div>
  );
}
