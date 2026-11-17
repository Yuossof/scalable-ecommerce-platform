"use client";

import useSWR from "swr";
import { getProductsWithSkusService } from "@/shared/services/products.service";
import type { Product } from "@/shared/types/api";

/**
 * Loads the full product catalogue with SKUs (`GET /products/products-skus`).
 *
 * This is the only listing endpoint that carries price/stock and it is not
 * paginated, so every consumer (home, shop) shares the same SWR cache entry and
 * filters/sorts/paginates client-side.
 */
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    "products/with-skus",
    getProductsWithSkusService,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    products: data ?? [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}
