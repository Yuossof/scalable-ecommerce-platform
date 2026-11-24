import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { mutate } from "swr";
import { API_ENDPOINTS } from "./api/endpoints";

/**
 * Shared axios instance. Authentication relies entirely on the HTTP-only
 * `accessToken` / `refreshToken` cookies set by the backend, so every request
 * is sent with `withCredentials` and no token is ever read or stored in JS.
 */
export const axiosInstanace = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

/**
 * Auth routes must never trigger the refresh-retry cycle: a 401 from them is a
 * legitimate "not authenticated" answer (or a wrong password), not an expired
 * access token.
 */
const AUTH_BYPASS_ROUTES: string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.VERIFY,
  API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT,
];

/**
 * Single-flight refresh: concurrent 401s share one `GET /auth/refresh` call so
 * we never fire a burst of refreshes. Requests that fail while the refresh is
 * in flight wait on the same promise and retry once with the new cookie.
 */
let refreshPromise: Promise<unknown> | null = null;

function refreshSession(): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = axiosInstanace
      .get(API_ENDPOINTS.AUTH.REFRESH)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const SESSION_CACHE_KEYS = ["auth/session", "addresses", "favorites", "orders"];

let loggingOut = false;

/** Invalid refresh token: clear the session and return to the login page. */
async function handleSessionExpired(): Promise<void> {
  if (loggingOut || typeof window === "undefined") return;
  loggingOut = true;

  try {
    // Best effort: the backend clears the cookies even if the refresh token
    // itself is already invalid.
    await axiosInstanace.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => undefined);

    await mutate(
      (key) => SESSION_CACHE_KEYS.includes(String(key)),
      undefined,
      { revalidate: false }
    );
    window.dispatchEvent(new CustomEvent("auth:logged-out"));

    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (!currentPath.startsWith("/auth/")) {
      window.location.assign(
        `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      );
    }
  } finally {
    loggingOut = false;
  }
}

axiosInstanace.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? "";
    const isAuthRoute = AUTH_BYPASS_ROUTES.some((route) => url.startsWith(route));

    if (status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true;
      try {
        await refreshSession();
        return await axiosInstanace(config);
      } catch {
        // A failed refresh means the session cannot be recovered.
        void handleSessionExpired();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
