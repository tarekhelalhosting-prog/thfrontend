import { Product, Category } from "../types";

// --- فئات وأقسام صالون التجهيز (Categories List matching database layout) ---
export const categories: Category[] = [
  {
    id: "cat-1",
    name: "كراسي صالونات حلاقة وتجميل",
    media_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600",
    description: "كراسي حلاقة هيدروليكية وكلاسيكية فاخرة مجهزة لأقصى درجات الراحة والتحمل."
  },
  {
    id: "cat-2",
    name: "مغاسل شامبو متكاملة",
    media_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600",
    description: "وحدات غسيل شعر متكاملة مع أحواض سيراميك فاخرة وخلاطات مياه ساخنة وباردة."
  },
  {
    id: "cat-3",
    name: "أجهزة ومعدات ومجففات",
    media_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600",
    description: "أجهزة البخار الحرارية وأجهزة معالجة وتجفيف الشعر للصالونات العصرية."
  },
  {
    id: "cat-4",
    name: "أثاث ومرايا ديكور",
    media_url: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?q=80&w=600",
    image: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?q=80&w=600",
    description: "مرايا صالون مضيئة ليد تاتش وخزائن وديكورات مخصصة لتجهيز بيئة العمل."
  },
  {
    id: "cat-5",
    name: "إكسسوارات وأدوات احترافية",
    media_url: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=600",
    image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=600",
    description: "مقصات يابانية فاخرة، فرش حلاقة، حقائب حفظ مستلزمات الحلاقة."
  }
];

// --- قائمة المنتجات الفاخرة (Products List matching exact User-Intent and types.ts constraints) ---
export const products: Product[] = [
  {
    id: "p1",
    category_id: "cat-1",
    name: "كرسي حلاقة هيدروليك أسود ملكي",
    description: "كرسي حلاقة احترافي عالي الجودة مزود بمضخة هيدروليكية قوية لتعديل الارتفاع وسهولة الدوران 360 درجة مع إمكانية إمالة الظهر لتوفير أقصى درجات الراحة للعميل.",
    price: 12500,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600",
    category: "cat-1",
    variants: [
      { id: "v1-1", product_id: "p1", price: 12500 }
    ],
    images: [
      { id: "img1-1", product_id: "p1", media_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p2",
    category_id: "cat-1",
    name: "كرسي صالون حلاقة جلد أحمر كلاسيك",
    description: "تصميم كلاسيكي عتيق يضيف لمسة من الفخامة والأناقة لصالونك. مبطن بالإسفنج عالي الكثافة لراحة تدوم طويلاً وهيكل معدني معزز بالكروم اللامع.",
    price: 9500,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600",
    category: "cat-1",
    variants: [
      { id: "v2-1", product_id: "p2", price: 9500 }
    ],
    images: [
      { id: "img2-1", product_id: "p2", media_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p3",
    category_id: "cat-2",
    name: "مغسلة شامبو صالون متكاملة سيراميك",
    description: "وحدة غسيل شعر متكاملة لصالونات التجميل الفاخرة، تتميز بحوض سيراميك عميق قابل للتعديل ومقعد مبطن مريح جداً بكسوة جلدية فاخرة مقاومة للبقع والرطوبة.",
    price: 9800,
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfea00f4d?q=80&w=600",
    category: "cat-2",
    variants: [
      { id: "v3-1", product_id: "p3", price: 9800 }
    ],
    images: [
      { id: "img3-1", product_id: "p3", media_url: "https://images.unsplash.com/photo-1521590832167-7bcbfea00f4d?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p4",
    category_id: "cat-3",
    name: "جهاز بخار للشعر ومجفف احترافي",
    description: "جهاز معالجة وبخار الشعر الاحترافي لتقديم علاجات ترطيب عميق وصبغات شعر مثالية وسريعة. يتميز بواجهة تحكم رقمية كاملة لضبط الوقت ودرجة الحرارة.",
    price: 4200,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600",
    category: "cat-3",
    variants: [
      { id: "v4-1", product_id: "p4", price: 4200 }
    ],
    images: [
      { id: "img4-1", product_id: "p4", media_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p5",
    category_id: "cat-5",
    name: "طقم مقصات حلاقة احترافية ياباني",
    description: "طقم مقصات حلاقة وتخفيف الشعر مصنوع من الفولاذ الياباني المقاوم للصدأ 440C، شفرات حادة للغاية تضمن قصاً نظيفاً ودقيقاً دون إلحاق أي ضرر بالشعر.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=600",
    category: "cat-5",
    variants: [
      { id: "v5-1", product_id: "p5", price: 1800 }
    ],
    images: [
      { id: "img5-1", product_id: "p5", media_url: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p6",
    category_id: "cat-4",
    name: "مرايا صالون مضيئة ليد تاتش مستطيلة",
    description: "مرآة حائط مستطيلة فاخرة لصالونات الحلاقة والتجميل مزودة بإضاءة LED ثلاثية الألوان قابلة للتعتيم والتحكم الكامل باللمس، تعطي وضوحاً فائقاً وتبرز أدق التفاصيل.",
    price: 3400,
    image: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?q=80&w=600",
    category: "cat-4",
    variants: [
      { id: "v6-1", product_id: "p6", price: 3400 }
    ],
    images: [
      { id: "img6-1", product_id: "p6", media_url: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p7",
    category_id: "cat-1",
    name: "كرسي حلاقة هيدروليك عريض فضي",
    description: "نسخة عريضة من كراسي الحلاقة الحديثة، مخصصة لتوفير أقصى ثبات ومساحة جلوس ممتازة. مطعمة بالكامل بحديد مكسو بطلاء الفضة اللامع والكروم.",
    price: 14500,
    image: "https://images.unsplash.com/photo-1593121925329-7a33a044709a?q=80&w=600",
    category: "cat-1",
    variants: [
      { id: "v7-1", product_id: "p7", price: 14500 }
    ],
    images: [
      { id: "img7-1", product_id: "p7", media_url: "https://images.unsplash.com/photo-1593121925329-7a33a044709a?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  },
  {
    id: "p8",
    category_id: "cat-2",
    name: "مغسلة شامبو إيطالية فخمة متحركة",
    description: "مغسلة فاخرة بتصميم إيطالي حديث مع حوض متأرجح لتوفير ملامسة مريحة لرقبة العميل دون التسبب في أي آلام أثناء عمليات الغسيل الطويلة وصباغة الشعر.",
    price: 13900,
    image: "https://images.unsplash.com/photo-1600948836101-f9ffdb5965eb?q=80&w=600",
    category: "cat-2",
    variants: [
      { id: "v8-1", product_id: "p8", price: 13900 }
    ],
    images: [
      { id: "img8-1", product_id: "p8", media_url: "https://images.unsplash.com/photo-1600948836101-f9ffdb5965eb?q=80&w=600", is_primary: true, sort_order: 1 }
    ]
  }
];
