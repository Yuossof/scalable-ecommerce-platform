"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  addFavoriteService,
  getFavoritesService,
  removeFavoriteService,
} from "@/shared/services/favorites.service";
import type { Product } from "@/shared/types/api";

/**
 * Shared favourites state. SWR dedupes the request across every heart button on
 * the page; toggles update optimistically and roll back on failure.
 */
export function useFavorites(shouldFetch = true) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    shouldFetch ? "favorites" : null,
    getFavoritesService,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );

  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set());
  const favoriteIds = useMemo(
    () => new Set((data ?? []).map((product) => product.id)),
    [data]
  );

  const isFavorite = useCallback(
    (productId: string) =>
      optimisticIds.has(productId) || favoriteIds.has(productId),
    [optimisticIds, favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const wasFavorite = isFavorite(productId);

      setOptimisticIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (wasFavorite) await removeFavoriteService(productId);
        else await addFavoriteService(productId);
        await mutate();
      } catch (error) {
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(productId);
          else next.delete(productId);
          return next;
        });
        throw error;
      } finally {
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [isFavorite, mutate]
  );

  return {
    favorites: data ?? [],
    isFavorite,
    toggleFavorite,
    refreshFavorites: mutate,
    isLoading,
    isError: Boolean(error),
  };
}
