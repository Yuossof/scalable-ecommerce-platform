"use client";

import useSWR from "swr";
import {
  getCollectionsService,
  type ProductCollections,
} from "@/shared/services/collections.service";

/** Shared homepage collections. Best sellers and discounts come from the DB. */
export function useCollections() {
  const { data, error, isLoading, mutate } = useSWR<ProductCollections>(
    "products/collections",
    getCollectionsService,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    collections: data,
    isLoading,
    isError: Boolean(error),
    refreshCollections: mutate,
  };
}
