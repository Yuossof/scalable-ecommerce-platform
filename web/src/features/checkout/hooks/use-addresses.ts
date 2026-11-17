"use client";

import useSWR from "swr";
import { getAddressesService } from "@/shared/services/addresses.service";
import type { Address } from "@/shared/types/api";

/**
 * Loads the authenticated user's saved addresses. Only fetches while an active
 * session is confirmed; mount this in guarded views.
 */
export function useAddresses(shouldFetch = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "addresses" : null,
    getAddressesService,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  return {
    addresses: (data ?? []) as Address[],
    isLoading,
    isError: Boolean(error),
    refreshAddresses: mutate,
  };
}