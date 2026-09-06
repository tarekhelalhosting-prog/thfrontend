import type { Metadata } from "next";
import "./globals.css";
import GlobalImageProtection from "../../components/GlobalImageProtection";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "طارق هلال | معدات وتجهيزات صالونات الحلاقة في مصر",
    template: "%s | طارق هلال",
  },
  description: "طارق هلال لتجهيز صالونات الحلاقة والكوافير والتجميل في مصر. اكتشف كراسي الحلاقة الهيدروليك، مغاسل الشعر، وأجهزة ومستلزمات الصالونات بأفضل الأسعار.",
  keywords: [
    "طارق هلال",
    "منصة طارق هلال",
    "معدات حلاقة",
    "تجهيز صالونات حلاقة",
    "معدات صالونات",
    "كراسي حلاقة",
    "كراسي هيدروليك",
    "مغاسل شعر",
    "مستلزمات كوافير",
    "تجهيزات صالونات تجميل",
    "معدات كوافير مصر",
  ],
  applicationName: "طارق هلال",
  category: "معدات وتجهيزات صالونات الحلاقة والتجميل",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName: "طارق هلال",
    title: "طارق هلال | معدات وتجهيزات صالونات الحلاقة في مصر",
    description: "معدات وتجهيزات صالونات الحلاقة والكوافير والتجميل في مصر.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "شعار طارق هلال" }],
  },
  twitter: {
    card: "summary",
    title: "طارق هلال | معدات وتجهيزات صالونات الحلاقة في مصر",
    description: "معدات وتجهيزات صالونات الحلاقة والكوافير والتجميل في مصر.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "zgG88RipO2q408AXkfaSlEWOJy9gDw3IiZ-9oTI3PqA",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-[#0B0C10] text-gray-100 selection:bg-gold-500 selection:text-black">
        <GlobalImageProtection />
        {children}
      </body>
    </html>
  );
}