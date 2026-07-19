export const STORAGE_KEYS = {
  cart: "th_cart",
  currentUser: "th_user",
  authAccessToken: "th_access_token",
  authRefreshToken: "th_refresh_token",
  favorites: "th_favorites",
} as const;

export function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

export function readStorageValue<T>(key: string, fallbackValue: T): T {
  if (!isBrowserEnvironment()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeStorageValue<T>(key: string, value: T) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageValue(key: string) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.removeItem(key);
}