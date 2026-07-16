import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة معارض طارق هلال | لتجهيز صالونات و لوازم الكوافير",
  description: "المنصة الأولى والراقية لتجهيز صالونات الحلاقة والتجميل الفاخرة بأحدث الكراسي والمعدات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-[#0B0C10] text-gray-100 selection:bg-gold-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}