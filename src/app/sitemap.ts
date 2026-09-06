import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

const publicPages = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about-us", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/delivery-shipping-policy", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/refund-cancellation-policy", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency,
    priority,
  }));
}