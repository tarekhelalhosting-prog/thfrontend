import { Product } from "../types";

export function isProductUnavailable(product: Product): boolean {
  return product.isUnavailable === true || Boolean(product.deleted_at);
}