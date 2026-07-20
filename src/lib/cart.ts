import { CartItem } from "@/types";

// Two cart lines for the same product but different variants (e.g. Color:
// Black vs Color: Red) must stay separate, so the cart is keyed by
// product id + variant id instead of just the product id.
export function getCartLineKey(item: CartItem): string {
  return item.selectedVariant ? `${item.product.id}::${item.selectedVariant.id}` : item.product.id;
}

// A variant's own price always wins over the product's fallback price.
export function getCartItemUnitPrice(item: CartItem): number {
  return item.selectedVariant?.price ?? item.product.price;
}

export function getCartItemImage(item: CartItem): string {
  return item.selectedVariant?.media_url || item.product.image;
}

export function describeCartItemVariant(item: CartItem): string {
  const attributes = item.selectedVariant?.attributes;

  if (!attributes || attributes.length === 0) {
    return "";
  }

  return attributes.map((attribute) => attribute.value).join(" - ");
}
