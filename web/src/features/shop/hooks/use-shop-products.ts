"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { AppDispatch, RootState } from "@/store";
import { fetchCategories } from "@/store/slices/shop-category-slice";
import {
  getShopProductsService,
  type ShopProductsCatalog,
  type ShopProductsQuery,
} from "@/shared/services/products.service";
import {
  PAGE_SIZE,
  isSortValue,
  parseMulti,
  type SortValue,
} from "@/features/shop/lib/shop-filters";

/**
 * Reads the shop filters from the URL and fetches the server-filtered,
 * server-sorted, and server-paginated product slice via SWR.
 */
export function useShopProducts() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (!categoriesLoading && !categoriesError && categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, categoriesError, categoriesLoading]);

  const categorySlug = searchParams.get("category");
  const category = categorySlug
    ? categories.find((item) => item.slug === categorySlug)
    : undefined;
  const categoryId = category?.id ?? null;

  const prices = useMemo(
    () => parseMulti(searchParams.get("price")),
    [searchParams]
  );
  const query = searchParams.get("q")?.trim() ?? "";
  const sortParam = searchParams.get("sort");
  const sort: SortValue = isSortValue(sortParam) ? sortParam : "newest";
  const pageParam = Number(searchParams.get("page"));
  const requestedPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.trunc(pageParam) : 1;

  const requestParams: ShopProductsQuery = useMemo(
    () => ({
      category: categorySlug || undefined,
      price: prices.length > 0 ? prices.join(",") : undefined,
      q: query || undefined,
      sort,
      page: requestedPage,
      limit: PAGE_SIZE,
    }),
    [categorySlug, prices, query, sort, requestedPage]
  );

  const swrKey = useMemo(
    () => ["products/catalog", JSON.stringify(requestParams)] as const,
    [requestParams]
  );

  const { data, error, isLoading, mutate } = useSWR<ShopProductsCatalog>(
    swrKey,
    () => getShopProductsService(requestParams),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10_000,
    }
  );

  const pageItems = data?.products ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;
  const currentPage = data?.meta.page ?? requestedPage;
  const pageSize = data?.meta.limit ?? PAGE_SIZE;
  const categoryCounts = data?.facets.categories ?? {};
  const priceCounts = data?.facets.prices ?? {};

  return {
    pageItems,
    total,
    totalPages,
    currentPage,
    pageSize,
    categoryCounts,
    priceCounts,
    category,
    categorySlug,
    categoryId,
    prices,
    query,
    sort,
    categories,
    isLoading,
    isError: Boolean(error),
    refreshProducts: mutate,
  };
}
