"use client";

import { useCallback, useEffect, useState } from "react";
import { usePersistentLocalState } from "./usePersistentLocalState";
import { removeStorageValue, STORAGE_KEYS } from "../lib/browser-storage";
import {
  AUTH_SESSION_INVALIDATED_EVENT,
  fetchCurrentUser,
  logoutUser,
} from "../lib/api";
import { User } from "../types";

interface UseAuthSessionResult {
  currentUser: User | null;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  clearSession: () => void;
}

export function useAuthSession(): UseAuthSessionResult {
  const {
    value: currentUser,
    setValue: setCurrentUser,
    isHydrated: isUserHydrated,
  } = usePersistentLocalState<User | null>(STORAGE_KEYS.currentUser, null);
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setIsSessionHydrated(true);
  }, [setCurrentUser]);

  useEffect(() => {
    if (!isUserHydrated) {
      return;
    }

    let cancelled = false;
    removeStorageValue("th_auth_token");

    void (async () => {
      try {
        const freshUser = await fetchCurrentUser();
        if (!cancelled) {
          setCurrentUser(freshUser);
        }
      } catch (error) {
        // Only a confirmed 401/403 (thrown as "AUTH_UNAUTHORIZED") means the
        // session is really gone. A network hiccup or server error here must
        // not wipe an otherwise-valid cached session - that previously forced
        // users to clear cookies/localStorage to recover from a transient blip.
        if (!cancelled && error instanceof Error && error.message === "AUTH_UNAUTHORIZED") {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsSessionHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isUserHydrated, setCurrentUser]);

  useEffect(() => {
    const clearInvalidSession = () => {
      setCurrentUser(null);
      setIsSessionHydrated(true);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.currentUser && event.newValue === null) {
        clearInvalidSession();
      }
    };

    window.addEventListener(AUTH_SESSION_INVALIDATED_EVENT, clearInvalidSession);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_SESSION_INVALIDATED_EVENT, clearInvalidSession);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setCurrentUser]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setIsSessionHydrated(true);

    try {
      await logoutUser();
    } catch {
      // The local session is already cleared even if the network is unavailable.
    }
    // Callers that navigate right after logout should await this promise first -
    // otherwise a freshly-mounted page can call fetchCurrentUser() before the
    // /auth/logout/ cookie-clearing request lands, silently reviving the session.
  }, [setCurrentUser]);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setIsSessionHydrated(true);
  }, [setCurrentUser]);

  return {
    currentUser: isSessionHydrated ? currentUser : null,
    isHydrated: isSessionHydrated,
    login,
    logout,
    clearSession,
  };
}
