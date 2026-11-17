import { getProductMinPrice } from "@/shared/lib/api/mappers";
import type { Product } from "@/shared/types/api";

/**
 * Client-side filtering for the shop page.
 *
 * The backend exposes a single non-paginated listing endpoint
 * (`GET /products/products-skus`) with no query filters, so category, price,
 * search, sort and pagination are all applied here.
 */

export interface PriceRange {
  /** Stable identifier used in the URL (`?price=0-100`). */
  value: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { value: "0-100", label: "Under $100", min: 0, max: 100 },
  { value: "100-300", label: "$100 - $300", min: 100, max: 300 },
  { value: "300-500", label: "$300 - $500", min: 300, max: 500 },
  { value: "500-1000", label: "$500 - $1000", min: 500, max: 1000 },
  { value: "1000+", label: "Over $1000", min: 1000, max: Number.POSITIVE_INFINITY },
];

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function isSortValue(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/** Products listed per page. */
export const PAGE_SIZE = 12;

/** Splits a comma separated URL param into a de-duplicated list. */
export function parseMulti(value: string | null): string[] {
  if (!value) return [];
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
}

export function findPriceRange(value: string): PriceRange | undefined {
  return PRICE_RANGES.find((range) => range.value === value);
}

export interface ShopFilterState {
  categoryId: string | null;
  prices: string[];
  query: string;
}

/** True when the product's lowest SKU price falls inside any selected range. */
function matchesPrices(product: Product, prices: string[]): boolean {
  if (prices.length === 0) return true;
  const price = getProductMinPrice(product);
  return prices.some((value) => {
    const range = findPriceRange(value);
    return range ? price >= range.min && price < range.max : false;
  });
}

function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(needle) ||
    product.summary.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle)
  );
}

export function applyShopFilters(
  products: Product[],
  { categoryId, prices, query }: ShopFilterState
): Product[] {
  return products.filter(
    (product) =>
      (!categoryId || product.category_id === categoryId) &&
      matchesPrices(product, prices) &&
      matchesQuery(product, query)
  );
}

export function sortProducts(products: Product[], sort: SortValue): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
    case "price-desc":
      return sorted.sort((a, b) => getProductMinPrice(b) - getProductMinPrice(a));
    case "newest":
    default:
      return sorted.sort((a, b) => {
        const aTime = a.created_at ? Date.parse(a.created_at) : 0;
        const bTime = b.created_at ? Date.parse(b.created_at) : 0;
        return bTime - aTime;
      });
  }
}

/** Number of products that fall into a given price range value. */
export function countByPriceRange(products: Product[], value: string): number {
  const range = findPriceRange(value);
  if (!range) return 0;
  return products.filter((product) => {
    const price = getProductMinPrice(product);
    return price >= range.min && price < range.max;
  }).length;
}

export function countByCategory(products: Product[], categoryId: string | null): number {
  if (!categoryId) return products.length;
  return products.filter((product) => product.category_id === categoryId).length;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
