/**
 * Shared filter/sort metadata and URL query parsing for the shop page.
 * Actual filtering, sorting, facet counting, and pagination happen on the server
 * via `GET /products/products-skus`.
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
