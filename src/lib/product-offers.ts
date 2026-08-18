import { CartItem, Offer, Product, ProductVariant } from "@/types";

export type ProductDiscountInfo = {
  offerId: string;
  offerName: string;
  offerType: Offer["offer_type"];
  originalPrice: number;
  discountedPrice: number; // equals originalPrice for BUY_X_GET_Y (no price change, just unlocks a gift)
  badgeText: string;
};

export type BuyXGetYGift = {
  productId: string;
  variantId: string | null;
  productName: string;
  variantDescription: string | null;
  quantity: number;
};

export type BuyXGetYProductOffer = {
  offerId: string;
  offerName: string;
  requiredQuantity: number;
  gifts: BuyXGetYGift[];
};

export type CartGiftPreview = BuyXGetYGift & {
  offerId: string;
  offerName: string;
};

function isOfferCurrentlyActive(offer: Offer): boolean {
  return offer.is_active;
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

function matchesOfferProduct(productId: string, variantId: string, offerProduct: Offer["offer_products"][number]): boolean {
  return (
    offerProduct.product === productId &&
    (offerProduct.variant === null || offerProduct.variant === variantId)
  );
}

function mapGift(offerProduct: Offer["offer_products"][number], quantity = offerProduct.quantity): BuyXGetYGift {
  return {
    productId: offerProduct.product,
    variantId: offerProduct.variant ?? null,
    productName: offerProduct.product_name || "هدية مجانية",
    variantDescription: offerProduct.variant_description ?? null,
    quantity,
  };
}

export function getBuyXGetYOffersForProduct(
  product: Product,
  variant: ProductVariant | null,
  offers: Offer[]
): BuyXGetYProductOffer[] {
  if (!variant) {
    return [];
  }

  return offers.flatMap((offer) => {
    if (offer.offer_type !== "BUY_X_GET_Y" || !isOfferCurrentlyActive(offer)) {
      return [];
    }

    const requiredItem = offer.offer_products.find(
      (item) => item.item_type === "REQUIRED" && matchesOfferProduct(product.id, variant.id, item)
    );
    const gifts = offer.offer_products.filter((item) => item.item_type === "GIFT").map(mapGift);

    if (!requiredItem || gifts.length === 0) {
      return [];
    }

    return [{
      offerId: offer.id,
      offerName: offer.name,
      requiredQuantity: requiredItem.quantity,
      gifts,
    }];
  });
}

export function getCartGiftPreviews(
  cartItems: CartItem[],
  offers: Offer[],
  products: Product[]
): CartGiftPreview[] {
  const productByVariantId = new Map<string, Product>();
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      productByVariantId.set(variant.id, product);
    }
  }

  return offers.flatMap((offer) => {
    if (offer.offer_type !== "BUY_X_GET_Y" || !isOfferCurrentlyActive(offer)) {
      return [];
    }

    const requiredItems = offer.offer_products.filter((item) => item.item_type === "REQUIRED");
    const giftItems = offer.offer_products.filter((item) => item.item_type === "GIFT");
    if (requiredItems.length === 0 || giftItems.length === 0) {
      return [];
    }

    const timesUnlocked = Math.min(
      ...requiredItems.map((requiredItem) => {
        const matchedQuantity = cartItems.reduce((total, cartItem) => {
          const product = productByVariantId.get(cartItem.product_variant_id);
          return product && matchesOfferProduct(product.id, cartItem.product_variant_id, requiredItem)
            ? total + cartItem.quantity
            : total;
        }, 0);
        return Math.floor(matchedQuantity / requiredItem.quantity);
      })
    );

    if (!Number.isFinite(timesUnlocked) || timesUnlocked < 1) {
      return [];
    }

    return giftItems.map((giftItem) => ({
      ...mapGift(giftItem, giftItem.quantity * timesUnlocked),
      offerId: offer.id,
      offerName: offer.name,
    }));
  });
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
  offers: Offer[]
): ProductDiscountInfo | null {
  const primaryVariantId = product.variants?.[0]?.id;
  const basePrice = product.price;

  let exactMatch: Offer | null = null;
  let productWideMatch: Offer | null = null;

  for (const offer of offers) {
    if (!isOfferCurrentlyActive(offer)) {
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
