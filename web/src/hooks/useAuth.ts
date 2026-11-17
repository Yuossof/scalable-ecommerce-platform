"use client";

import { refreshSessionService } from "@/shared/services/auth.service";
import useSWR from "swr";

/**
 * Session probe. The backend exposes no `/auth/me`, so the only way to know
 * whether the HTTP-only cookies are still valid is to call `GET /auth/refresh`
 * (which also rotates the access cookie). User identity is intentionally not
 * exposed here because the backend returns none.
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

  return {
    isAuthenticated: Boolean(data) && !error,
    isLoading,
    isError: Boolean(error),
    refreshUser: mutate,
  };
}
