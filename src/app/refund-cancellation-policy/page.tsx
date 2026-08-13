"use client";
import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function RefundCancellationPolicy() {
  const sections = [
    {
      num: "1",
      title: "إلغاء الطلب",
      content: "يمكن للعميل التواصل معنا لطلب إلغاء الطلب.\n\nتعتمد إمكانية إلغاء الطلب على حالة الطلب في وقت تقديم طلب الإلغاء، وما إذا كان قد تم تجهيزه أو تسليمه لشركة التوصيل.\n\nفي حالة إمكانية إلغاء الطلب، سيتم إبلاغ العميل بالإجراءات المتعلقة بالإلغاء وأي مبالغ مستحقة للاسترداد إن وجدت."
    },
    {
      num: "2",
      title: "طلب الاسترجاع أو الاستبدال",
      content: "في حالة رغبة العميل في استرجاع أو استبدال منتج، يرجى التواصل معنا وتوضيح تفاصيل الطلب وسبب طلب الاسترجاع أو الاستبدال.\n\nيتم مراجعة الطلب وتحديد إمكانية الاسترجاع أو الاستبدال وفقًا لحالة المنتج وطبيعته والظروف المتعلقة بالطلب."
    },
    {
      num: "3",
      title: "حالة المنتج",
      content: "قد يُطلب أن يكون المنتج المراد استرجاعه أو استبداله في حالته الأصلية، وغير مستخدم أو متضرر، مع الاحتفاظ بالعبوة والملحقات متى كان ذلك ممكنًا.\n\nوقد تختلف الشروط المطلوبة حسب طبيعة المنتج والظروف المحيطة بالطلب."
    },
    {
      num: "4",
      title: "المنتجات التالفة أو غير المطابقة",
      content: "في حالة وصول المنتج تالفًا أو وجود اختلاف بين المنتج المستلم والمنتج المطلوب، يرجى التواصل معنا في أقرب وقت ممكن مع توضيح المشكلة.\n\nقد نطلب صورًا أو معلومات إضافية عن المنتج والطلب حتى نتمكن من مراجعة الحالة واتخاذ الإجراء المناسب."
    },
    {
      num: "5",
      title: "المنتجات التي لا يمكن استرجاعها",
      content: "قد تكون بعض المنتجات غير قابلة للاسترجاع أو الاستبدال بسبب طبيعتها أو حالتها، ويتم تحديد ذلك حسب نوع المنتج وحالة الطلب."
    },
    {
      num: "6",
      title: "استرداد المبالغ",
      content: "في حالة الموافقة على استرجاع مبلغ للعميل، يتم توضيح طريقة وقيمة الاسترداد وفقًا لحالة الطلب وطريقة الدفع المستخدمة.\n\nقد تختلف المدة اللازمة لظهور المبلغ المسترد حسب طريقة الدفع والجهة المالية المسؤولة عن معالجة العملية."
    },
    {
      num: "7",
      title: "رسوم الشحن والاسترجاع",
      content: "تختلف مسؤولية وتكلفة الشحن أو الاسترجاع حسب سبب الطلب، وطبيعة المنتج، وحالة الشحنة.\n\nسيتم توضيح أي تكاليف مرتبطة بعملية الاسترجاع أو الاستبدال للعميل قبل إتمام الإجراء، متى كان ذلك منطبقًا."
    },
    {
      num: "8",
      title: "مراجعة طلبات الاسترجاع",
      content: "تتم مراجعة كل طلب استرجاع أو استبدال بشكل منفصل، وقد نطلب من العميل تقديم معلومات أو صور إضافية تساعد في تقييم الحالة.\n\nبعد مراجعة الطلب، سيتم إبلاغ العميل بالإجراء المناسب."
    },
    {
      num: "9",
      title: "التزامنا برضاك",
      content: "نسعى دائمًا إلى التعامل مع طلبات عملائنا بشكل مناسب وواضح، وبما يتناسب مع طبيعة كل حالة. رضاك هو هدفنا الأساسي."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-dark-card to-dark-bg border-b border-dark-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-8 h-8 text-gold-400" />
            <h1 className="text-5xl font-black text-white">سياسة الاسترجاع والإلغاء</h1>
          </div>
          <p className="text-lg text-gold-400">رضاك هو أولويتنا الأولى</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">

          <div className="text-gray-400 text-lg leading-relaxed bg-dark-card border border-dark-border/50 p-8 rounded-xl">
            <p>
              نحرص في طارق هلال على تقديم المنتجات بأفضل جودة ممكنة، ونسعى دائمًا إلى توفير تجربة شراء مرضية لعملائنا. 
              نظرًا لاختلاف طبيعة المنتجات وطريقة التوصيل، يتم التعامل مع طلبات الاسترجاع أو الاستبدال أو الإلغاء وفقًا لحالة كل طلب وطبيعة المنتج.
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

          {/* Contact Section */}
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
