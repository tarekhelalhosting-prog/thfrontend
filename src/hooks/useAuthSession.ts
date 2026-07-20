"use client";

import { useCallback, useEffect } from "react";
import { usePersistentLocalState } from "./usePersistentLocalState";
import { STORAGE_KEYS } from "../lib/browser-storage";
import { logoutUser } from "../lib/api";
import { User } from "../types";

interface UseAuthSessionResult {
  currentUser: User | null;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  clearSession: () => void;
}

export function useAuthSession(): UseAuthSessionResult {
  const {
    value: currentUser,
    setValue: setCurrentUser,
    isHydrated: isUserHydrated,
  } = usePersistentLocalState<User | null>(STORAGE_KEYS.currentUser, null);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
  }, [setCurrentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("th_auth_token");
    }
  }, []);

  const logout = useCallback(() => {
    void (async () => {
      try {
        await logoutUser();
      } finally {
        setCurrentUser(null);
      }
    })();
  }, [setCurrentUser]);

  const clearSession = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  return {
    currentUser,
    isHydrated: isUserHydrated,
    login,
    logout,
    clearSession,
  };
}
