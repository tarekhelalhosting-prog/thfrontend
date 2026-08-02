import { Category, Product } from "@/types";

// A "special offers" product is just a normal Product whose category name
// contains one of these keywords - no backend/schema change needed. Admins
// create/rename a category (e.g. "العروض") from the existing Categories
// admin page, and any product placed under it is automatically treated as
// a bundle/offer across the storefront + admin UI.
const OFFER_CATEGORY_KEYWORDS = ["عروض", "عرض", "offer", "bundle", "deal"];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function isOfferCategory(category: Category | null | undefined): boolean {
  if (!category?.name) {
    return false;
  }

  const normalizedName = normalize(category.name);
  return OFFER_CATEGORY_KEYWORDS.some((keyword) => normalizedName.includes(keyword));
}

export function findOfferCategory(categories: Category[]): Category | undefined {
  return categories.find((category) => isOfferCategory(category));
}

function resolveCategoryId(product: Product): string {
  return product.category_id || product.category;
}

export function isOfferProduct(product: Product, categories: Category[]): boolean {
  const categoryId = resolveCategoryId(product);
  const category = categories.find((item) => item.id === categoryId);
  return isOfferCategory(category);
}

export function getOfferProducts(products: Product[], categories: Category[]): Product[] {
  return products.filter((product) => isOfferProduct(product, categories));
}

// The offer's "مكونات العرض" (bundle components) list shown in the storefront
// banner + product page - derived from the primary variant's attribute
// values (the admin dashboard repurposes variant attributes as the list of
// items included in the bundle, e.g. "استشوار", "كرسي حلاقة").
export function getOfferComponents(product: Product): string[] {
  const primaryVariant = product.variants?.[0];
  if (!primaryVariant?.attributes) {
    return [];
  }

  return primaryVariant.attributes
    .map((attribute) => attribute.value?.trim())
    .filter((value): value is string => Boolean(value));
}
