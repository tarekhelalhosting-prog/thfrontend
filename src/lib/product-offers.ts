import { Offer, Product } from "@/types";

export type ProductDiscountInfo = {
  offerId: string;
  offerName: string;
  offerType: Offer["offer_type"];
  originalPrice: number;
  discountedPrice: number; // equals originalPrice for BUY_X_GET_Y (no price change, just unlocks a gift)
  badgeText: string;
};

function isOfferCurrentlyActive(offer: Offer, now: Date): boolean {
  if (!offer.is_active) {
    return false;
  }

  const startsAt = offer.starts_at ? new Date(offer.starts_at) : null;
  const endsAt = offer.ends_at ? new Date(offer.ends_at) : null;

  if (startsAt && !Number.isNaN(startsAt.getTime()) && now < startsAt) {
    return false;
  }

  if (endsAt && !Number.isNaN(endsAt.getTime()) && now > endsAt) {
    return false;
  }

  return true;
}

function computeDiscountedPrice(offer: Offer, price: number): number {
  if (offer.offer_type === "PERCENTAGE" && offer.value != null) {
    return Math.max(price - (price * offer.value) / 100, 0);
  }

  if (offer.offer_type === "FIXED" && offer.value != null) {
    return Math.max(price - offer.value, 0);
  }

  return price;
}

/**
 * Mirrors the backend's `get_active_offer_product` + `calculate_unit_price`
 * (offers/services.py) purely on the client, so the storefront can show a
 * discount badge/price on product listing cards without any extra
 * per-product backend request - just the one bulk `fetchOffers()` call
 * made once alongside `fetchProducts()`.
 *
 * Only REQUIRED offer_products can discount the product being displayed
 * (GIFT rows describe the free item awarded by a Buy X Get Y offer, not a
 * discount on this product). An exact match on the product's primary
 * (first) variant wins over a product-wide (variant = null) match, same
 * priority order as the backend.
 */
export function getProductDiscount(
  product: Product,
  offers: Offer[],
  now: Date = new Date()
): ProductDiscountInfo | null {
  const primaryVariantId = product.variants?.[0]?.id;
  const basePrice = product.price;

  let exactMatch: Offer | null = null;
  let productWideMatch: Offer | null = null;

  for (const offer of offers) {
    if (!isOfferCurrentlyActive(offer, now)) {
      continue;
    }

    for (const item of offer.offer_products) {
      if (item.item_type !== "REQUIRED" || item.product !== product.id) {
        continue;
      }

      if (primaryVariantId && item.variant === primaryVariantId) {
        exactMatch = offer;
      } else if (!item.variant) {
        productWideMatch = offer;
      }
    }
  }

  const offer = exactMatch || productWideMatch;
  if (!offer) {
    return null;
  }

  if (offer.offer_type === "BUY_X_GET_Y") {
    return {
      offerId: offer.id,
      offerName: offer.name,
      offerType: offer.offer_type,
      originalPrice: basePrice,
      discountedPrice: basePrice,
      badgeText: "اشترِ واحصل على هدية",
    };
  }

  const discountedPrice = computeDiscountedPrice(offer, basePrice);
  if (discountedPrice >= basePrice) {
    return null;
  }

  const badgeText =
    offer.offer_type === "PERCENTAGE" ? `خصم ${offer.value}%` : `وفّر ${Math.round(basePrice - discountedPrice)} جنيه`;

  return {
    offerId: offer.id,
    offerName: offer.name,
    offerType: offer.offer_type,
    originalPrice: basePrice,
    discountedPrice,
    badgeText,
  };
}
