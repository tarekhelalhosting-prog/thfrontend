"use client";
import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      num: "1",
      title: "المعلومات التي نجمعها",
      content: "معلومات التسجيل: عند إنشاء حساب، نجمع اسمك والبريد الإلكتروني وكلمة المرور.\n\nمعلومات الشحن: نجمع عنوانك وهاتفك لتنفيذ الطلبيات.\n\nملفات تعريف الارتباط: نستخدم الكوكيز لتحسين تجربتك على الموقع."
    },
    {
      num: "2",
      title: "كيف نستخدم معلوماتك",
      content: "• تنفيذ طلبياتك وتوصيل المنتجات\n• التواصل معك بخصوص الطلبيات والتحديثات\n• تحسين خدماتنا وتجربة المستخدم\n• منع الاحتيال والحفاظ على أمان الموقع\n• الامتثال للقوانين واللوائح المعمول بها"
    },
    {
      num: "3",
      title: "حماية البيانات",
      content: "نستخدم تقنيات التشفير المتقدمة (SSL/TLS) لحماية البيانات الشخصية والمالية. جميع المعاملات تتم عبر اتصالات آمنة محمية.\n\nنقتصر على الوصول إلى بياناتك على الموظفين المخولين فقط الذين يحتاجون إليها لتقديم الخدمات التي تطلبها.\n\nعلى الرغم من التدابير الأمنية لدينا، لا توجد طريقة آمنة بنسبة 100٪ لنقل البيانات عبر الإنترنت، لكننا نبذل قصارى جهدنا."
    },
    {
      num: "4",
      title: "الكشف عن البيانات",
      content: "لن نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة بدون إذنك، إلا في الحالات التالية:\n\n• شركات الشحن والتوصيل لتنفيذ الطلبيات\n• بوابات الدفع الموثوقة لمعالجة المدفوعات\n• السلطات المختصة إذا كان مطلوباً بموجب القانون"
    },
    {
      num: "5",
      title: "حقوقك",
      content: "الوصول: لديك الحق في طلب نسخة من البيانات الشخصية التي لدينا عنك.\n\nالتعديل: يمكنك تعديل بيانات حسابك في أي وقت من لوحة التحكم.\n\nالحذف: يمكنك حذف حسابك والبيانات المرتبطة به."
    },
    {
      num: "6",
      title: "ملفات تعريف الارتباط (Cookies)",
      content: "نستخدم الكوكيز لتخزين تفضيلاتك وتحسين تجربة التصفح. يمكنك تعطيل الكوكيز من إعدادات متصفحك، لكن قد يؤثر ذلك على وظائف الموقع.\n\nأنواع الكوكيز التي نستخدمها:\n• كوكيز الجلسة: لتتبع حالة جلستك\n• كوكيز التفضيلات: لتذكر إعداداتك"
    },
    {
      num: "7",
      title: "الروابط الخارجية",
      content: "قد يحتوي موقعنا على روابط لمواقع خارجية. نحن لسنا مسؤولين عن سياسات الخصوصية لهذه المواقع. ننصحك بمراجعة سياسات الخصوصية الخاصة بها قبل مشاركة أي معلومات شخصية."
    },
    {
      num: "8",
      title: "تحديثات السياسة",
      content: "قد نحدّث هذه السياسة من وقت لآخر لعكس التغييرات في ممارساتنا أو الأسباب الأخرى. سيتم إعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-dark-card to-dark-bg border-b border-dark-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-gold-400" />
            <h1 className="text-5xl font-black text-white">سياسة الخصوصية</h1>
          </div>
          <p className="text-lg text-gold-400">حماية بيانات عملائنا هي أولويتنا الأولى</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">

          <div className="text-gray-400 text-lg leading-relaxed bg-dark-card border border-dark-border/50 p-8 rounded-xl">
            <p>
              تُقدّر سياسة الخصوصية هذه حماية خصوصيتك وبياناتك الشخصية. نحن ملتزمون بحماية المعلومات التي تقدمها لنا وتوفير تجربة تسوق آمنة وموثوقة.
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
                  <p key={i} className="whitespace-pre-line">{para}</p>
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
          </div>
        </section>

        </div>
      </div>
    </div>
  );
}
