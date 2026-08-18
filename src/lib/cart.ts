import { CartItem } from "@/types";

// The backend enforces a unique (cart, product_variant) constraint, so a
// cart line is always uniquely identified by its variant id - both for the
// server-backed cart and the local guest cart mirror.
export function getCartLineKey(item: CartItem): string {
  return item.product_variant_id;
}

// A variant's own price always wins over the product's fallback price.
// If the cart line carries an active offer snapshot, show the discounted
// unit price so the cart/checkout reflect the real amount the customer pays.
export function getCartItemUnitPrice(item: CartItem): number {
  return item.applied_offer?.discounted_unit_price ?? item.unit_price;
}

export function getCartItemOriginalUnitPrice(item: CartItem): number | null {
  return item.applied_offer?.original_unit_price ?? null;
}

export function getCartItemImage(item: CartItem): string {
  return item.image;
}

export function describeCartItemVariant(item: CartItem): string {
  return item.variant_description;
}

// Guest carts persist in localStorage across app versions, so an older/corrupt
// entry (e.g. missing unit_price from a previous schema) must not crash the UI.
export function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const candidate = item as Partial<CartItem>;
  return (
    typeof candidate.product_variant_id === "string" &&
    typeof candidate.unit_price === "number" &&
    Number.isFinite(candidate.unit_price) &&
    typeof candidate.quantity === "number" &&
    Number.isFinite(candidate.quantity)
  );
}
