"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePersistentLocalState } from "./usePersistentLocalState";
import { STORAGE_KEYS } from "../lib/browser-storage";
import { addCartItem, clearCart as clearCartApi, fetchCart, removeCartItem, updateCartItem } from "../lib/api";
import { CartItem, Product, ProductVariant, User } from "../types";

interface UseCartResult {
  cartItems: CartItem[];
  isHydrated: boolean;
  cartCount: number;
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void;
  updateQuantity: (productVariantId: string, delta: number) => void;
  removeItem: (productVariantId: string) => void;
  clearCart: () => void;
}

function buildGuestCartItem(product: Product, variant: ProductVariant, quantity: number): CartItem {
  const unitPrice = variant.price ?? product.price;
  const description = variant.attributes?.length
    ? variant.attributes.map((attribute) => attribute.value).join(" - ")
    : "";

  return {
    product_variant_id: variant.id,
    product_name: product.name,
    variant_description: description,
    image: variant.media_url || product.image,
    unit_price: unitPrice,
    quantity,
    subtotal: unitPrice * quantity,
  };
}

// Server-backed cart for authenticated users (Cart API requires auth), with
// a local-storage cart as a fallback/staging area for guests. On login, any
// pending guest cart lines are pushed to the server cart once, then the
// server becomes the single source of truth for the rest of the session.
export function useCart(currentUser: User | null): UseCartResult {
  const {
    value: localCart,
    setValue: setLocalCart,
    isHydrated: isLocalCartHydrated,
  } = usePersistentLocalState<CartItem[]>(STORAGE_KEYS.cart, []);

  const [serverCart, setServerCart] = useState<CartItem[] | null>(null);
  const [isServerCartLoading, setIsServerCartLoading] = useState(false);

  const isAuthenticated = Boolean(currentUser);

  const localCartRef = useRef(localCart);
  useEffect(() => {
    localCartRef.current = localCart;
  }, [localCart]);

  const loggedInUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = currentUser?.id ?? null;

    if (!userId) {
      loggedInUserIdRef.current = null;
      setServerCart(null);
      return;
    }

    const isFreshLogin = userId !== loggedInUserIdRef.current;
    loggedInUserIdRef.current = userId;

    let cancelled = false;

    void (async () => {
      setIsServerCartLoading(true);
      try {
        const pendingGuestItems = localCartRef.current;
        if (isFreshLogin && pendingGuestItems.length > 0) {
          for (const guestItem of pendingGuestItems) {
            await addCartItem(guestItem.product_variant_id, guestItem.quantity);
          }
          setLocalCart([]);
        }

        const items = await fetchCart();
        if (!cancelled) {
          setServerCart(items);
        }
      } catch {
        // Leave serverCart as-is; cartItems below falls back to the
        // (still intact) guest cart until the next successful sync.
      } finally {
        if (!cancelled) {
          setIsServerCartLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, setLocalCart]);

  const cartItems = isAuthenticated ? (serverCart ?? []) : isLocalCartHydrated ? localCart : [];
  const isHydrated = isAuthenticated ? serverCart !== null && !isServerCartLoading : isLocalCartHydrated;

  const addItem = useCallback((product: Product, variant: ProductVariant | null, quantity = 1) => {
    if (!variant) {
      return;
    }

    if (isAuthenticated) {
      void addCartItem(variant.id, quantity).then((updatedItem) => {
        setServerCart((current) => {
          const existingIndex = (current ?? []).findIndex((item) => item.product_variant_id === variant.id);
          if (existingIndex >= 0) {
            const next = [...(current ?? [])];
            next[existingIndex] = updatedItem;
            return next;
          }
          return [...(current ?? []), updatedItem];
        });
      });
      return;
    }

    setLocalCart((current) => {
      const existingIndex = current.findIndex((item) => item.product_variant_id === variant.id);
      if (existingIndex >= 0) {
        const next = [...current];
        const nextQuantity = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: nextQuantity,
          subtotal: next[existingIndex].unit_price * nextQuantity,
        };
        return next;
      }
      return [...current, buildGuestCartItem(product, variant, quantity)];
    });
  }, [isAuthenticated, setLocalCart]);

  const removeItem = useCallback((productVariantId: string) => {
    if (isAuthenticated) {
      setServerCart((current) => {
        const target = (current ?? []).find((item) => item.product_variant_id === productVariantId);
        if (target?.cart_item_id) {
          void removeCartItem(target.cart_item_id);
        }
        return (current ?? []).filter((item) => item.product_variant_id !== productVariantId);
      });
      return;
    }

    setLocalCart((current) => current.filter((item) => item.product_variant_id !== productVariantId));
  }, [isAuthenticated, setLocalCart]);

  const updateQuantity = useCallback((productVariantId: string, delta: number) => {
    if (isAuthenticated) {
      setServerCart((current) => {
        const target = (current ?? []).find((item) => item.product_variant_id === productVariantId);
        if (!target) {
          return current;
        }

        const nextQuantity = target.quantity + delta;
        if (nextQuantity <= 0) {
          if (target.cart_item_id) {
            void removeCartItem(target.cart_item_id);
          }
          return (current ?? []).filter((item) => item.product_variant_id !== productVariantId);
        }

        if (target.cart_item_id) {
          void updateCartItem(target.cart_item_id, nextQuantity).then((updatedItem) => {
            setServerCart((latest) =>
              (latest ?? []).map((item) => (item.product_variant_id === productVariantId ? updatedItem : item))
            );
          });
        }

        return (current ?? []).map((item) =>
          item.product_variant_id === productVariantId
            ? { ...item, quantity: nextQuantity, subtotal: item.unit_price * nextQuantity }
            : item
        );
      });
      return;
    }

    setLocalCart((current) =>
      current
        .map((item) =>
          item.product_variant_id === productVariantId
            ? { ...item, quantity: item.quantity + delta, subtotal: item.unit_price * (item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, [isAuthenticated, setLocalCart]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      void clearCartApi().then(() => setServerCart([]));
      return;
    }

    setLocalCart([]);
  }, [isAuthenticated, setLocalCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isHydrated,
    cartCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
