import { CartItem } from "@/types";

// The backend enforces a unique (cart, product_variant) constraint, so a
// cart line is always uniquely identified by its variant id - both for the
// server-backed cart and the local guest cart mirror.
export function getCartLineKey(item: CartItem): string {
  return item.product_variant_id;
}

// A variant's own price always wins over the product's fallback price.
export function getCartItemUnitPrice(item: CartItem): number {
  return item.unit_price;
}

export function getCartItemImage(item: CartItem): string {
  return item.image;
}

export function describeCartItemVariant(item: CartItem): string {
  return item.variant_description;
}
