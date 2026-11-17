import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
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
];

/**
 * Single-flight refresh: concurrent 401s share one `GET /auth/refresh` call so
 * we never fire a burst of refreshes.
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
        return axiosInstanace(config);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
