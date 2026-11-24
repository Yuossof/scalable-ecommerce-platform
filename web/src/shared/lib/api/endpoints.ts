/**
 * Single source of truth for every backend route the web client talks to.
 *
 * Only routes that are actually mounted in `api/src/routes/index.ts` are listed
 * here — if you add an endpoint to the backend, add it here as well instead of
 * hardcoding paths in feature code.
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY: "/auth/verify",
    RESEND_VERIFICATION: "/auth/resend-verification-link",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },

  CATEGORIES: {
    GET: "/categories",
  },

  PRODUCTS: {
    GET: "/products",
    GET_WITH_SKUS: "/products/products-skus",
    GET_COLLECTIONS: "/products/collections",
    GET_ONE: (productId: string) => `/products/${productId}`,
  },

  CART: {
    ADD: "/carts",
    GET: "/carts",
    DELETE: "/carts/delete",
  },

  ADDRESSES: {
    GET: "/addresses",
    CREATE: "/addresses",
    GET_ONE: (addressId: string) => `/addresses/${addressId}`,
    UPDATE: (addressId: string) => `/addresses/${addressId}`,
    DELETE: (addressId: string) => `/addresses/${addressId}`,
  },

  FAVORITES: {
    GET: "/favorites",
    ADD: "/favorites",
    REMOVE: (productId: string) => `/favorites/${productId}`,
  },

  COUPONS: {
    APPLY: "/coupons/apply",
  },

  ORDERS: {
    CREATE: "/orders",
    GET: "/orders",
    GET_ONE: (orderId: string) => `/orders/${orderId}`,
  },
} as const;
