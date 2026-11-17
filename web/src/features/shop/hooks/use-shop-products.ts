"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import type { AppDispatch, RootState } from "@/store";
import { fetchCategories } from "@/store/slices/shop-category-slice";
import { useProducts } from "@/shared/hooks/use-products";
import {
  PAGE_SIZE,
  applyShopFilters,
  isSortValue,
  paginate,
  parseMulti,
  sortProducts,
  type SortValue,
} from "@/features/shop/lib/shop-filters";

/**
 * Reads the shop filters from the URL, loads the catalogue once (SWR) and
 * returns the filtered / sorted / paginated slice for the current page.
 */
export function useShopProducts() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);

  const { products, isLoading, isError } = useProducts();

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
  const requestedPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const filtered = useMemo(
    () => sortProducts(applyShopFilters(products, { categoryId, prices, query }), sort),
    [products, categoryId, prices, query, sort]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageItems = useMemo(
    () => paginate(filtered, currentPage),
    [filtered, currentPage]
  );

  return {
    products,
    filtered,
    pageItems,
    totalPages,
    currentPage,
    pageSize: PAGE_SIZE,
    category,
    categorySlug,
    categoryId,
    prices,
    query,
    sort,
    categories,
    isLoading,
    isError,
  };
}
