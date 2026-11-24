"use client";

import { useCallback, useEffect } from "react";
import { mutate as globalMutate } from "swr";
import {
  logoutService,
  refreshSessionService,
} from "@/shared/services/auth.service";
import useSWR from "swr";

/**
 * Session probe. The backend exposes no `/auth/me`, so the only way to know
 * whether the HTTP-only cookies are still valid is to call `GET /auth/refresh`
 * (which also rotates the access cookie). Cookies survive page reloads, so the
 * same probe restores the auth state on every fresh mount.
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR(
    "auth/session",
    refreshSessionService,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30_000,
    }
  );

  useEffect(() => {
    const onChanged = () => {
      void mutate();
    };
    const onLoggedOut = () => {
      void globalMutate("auth/session", undefined, { revalidate: false });
    };

    window.addEventListener("auth:changed", onChanged);
    window.addEventListener("auth:logged-out", onLoggedOut);
    return () => {
      window.removeEventListener("auth:changed", onChanged);
      window.removeEventListener("auth:logged-out", onLoggedOut);
    };
  }, [mutate]);

  const logout = useCallback(async () => {
    await logoutService();
    await globalMutate(
      (key) =>
        ["auth/session", "addresses", "favorites", "orders"].includes(
          String(key)
        ),
      undefined,
      { revalidate: false }
    );
    window.dispatchEvent(new CustomEvent("auth:logged-out"));
  }, []);

  return {
    isAuthenticated: Boolean(data) && !error,
    isLoading,
    isError: Boolean(error),
    refreshUser: mutate,
    logout,
  };
}
