/**
 * Pure mapping helpers that translate the raw backend payloads into the
 * normalised domain shapes declared in `@/shared/types/api`.
 *
 * The `postgres` driver returns DECIMAL columns (`price`, `total`, `amount`,
 * `subtotal`) as strings, so every numeric field is coerced here. These
 * functions are side-effect free and safe to run on both the server and the
 * client.
 */

import type {
  Address,
  CartItem,
  Category,
  Order,
  OrderItem,
  Product,
  RawCartItem,
  RawOrder,
  RawOrderItem,
  RawProduct,
  RawSku,
  Sku,
} from "@/shared/types/api";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Coerce a possibly-string numeric value into a finite number. */
export function toNumber(
  value: string | number | null | undefined,
  fallback = 0
): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/* -------------------------------------------------------------------------- */
/*                                  Category                                  */
/* -------------------------------------------------------------------------- */

export function mapCategory(raw: Category): Category {
  return {
    id: raw.id,
    parent_id: raw.parent_id ?? null,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    image: raw.image ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at ?? null,
    deleted_at: raw.deleted_at ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Product                                  */
/* -------------------------------------------------------------------------- */

export function mapSku(raw: RawSku): Sku {
  return {
    id: raw.id,
    product_id: raw.product_id,
    category_id: raw.category_id,
    sku: raw.sku,
    price: toNumber(raw.price),
    quantity: toNumber(raw.quantity),
    cover: raw.cover ?? null,
    images: toStringArray(raw.images),
    created_at: raw.created_at,
    compare_at_price:
      raw.compare_at_price === null || raw.compare_at_price === undefined
        ? null
        : toNumber(raw.compare_at_price),
  };
}

export function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    summary: raw.summary ?? "",
    cover: raw.cover ?? null,
    images: toStringArray(raw.images),
    category_id: raw.category_id,
    created_at: raw.created_at,
    is_featured: Boolean(raw.is_featured),
    skus: Array.isArray(raw.skus) ? raw.skus.map(mapSku) : [],
  };
}

export function mapProducts(raws: RawProduct[] | null | undefined): Product[] {
  if (!Array.isArray(raws)) return [];
  return raws.map(mapProduct);
}

/** Lowest SKU price for a product (0 when it has no SKUs). */
export function getProductMinPrice(product: Product): number {
  if (product.skus.length === 0) return 0;
  return Math.min(...product.skus.map((sku) => sku.price));
}

/** Highest SKU price for a product. */
export function getProductMaxPrice(product: Product): number {
  if (product.skus.length === 0) return 0;
  return Math.max(...product.skus.map((sku) => sku.price));
}

/** Total sellable stock across every SKU of a product. */
export function getProductStock(product: Product): number {
  return product.skus.reduce((total, sku) => total + sku.quantity, 0);
}

/** First SKU with stock, falling back to the first available SKU. */
export function getDefaultSku(product: Product): Sku | null {
  return product.skus.find((sku) => sku.quantity > 0) ?? product.skus[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/*                                    Cart                                    */
/* -------------------------------------------------------------------------- */

export function mapCartItem(raw: RawCartItem): CartItem {
  return {
    cart_item_id: raw.cart_item_id,
    quantity: toNumber(raw.quantity),
    sku_id: raw.sku_id,
    price: toNumber(raw.price),
    product_name: raw.product_name,
    cover: raw.cover ?? null,
    summary: raw.summary ?? null,
    user_id: raw.user_id,
    cart_id: raw.cart_id,
  };
}

export function mapCartItems(raws: RawCartItem[] | null | undefined): CartItem[] {
  if (!Array.isArray(raws)) return [];
  return raws.map(mapCartItem);
}

/* -------------------------------------------------------------------------- */
/*                                  Address                                   */
/* -------------------------------------------------------------------------- */

export function mapAddress(raw: Address): Address {
  return {
    id: raw.id,
    user_id: raw.user_id,
    full_name: raw.full_name,
    phone: raw.phone,
    city: raw.city,
    area: raw.area ?? null,
    street: raw.street,
    building: raw.building ?? null,
    apartment: raw.apartment ?? null,
    notes: raw.notes ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at ?? null,
  };
}

export function mapAddresses(raws: Address[] | null | undefined): Address[] {
  if (!Array.isArray(raws)) return [];
  return raws.map(mapAddress);
}

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

export function mapOrderItem(raw: RawOrderItem): OrderItem {
  return {
    id: raw.id,
    products_sku_id: raw.products_sku_id,
    quantity: toNumber(raw.quantity),
    unit_price: toNumber(raw.unit_price),
  };
}

export function mapOrder(raw: RawOrder): Order {
  const items = raw.items ?? raw.orderItems ?? [];
  return {
    id: raw.id ?? raw.order_id ?? "",
    user_id: raw.user_id,
    subtotal: toNumber(raw.subtotal),
    discount: toNumber(raw.discount),
    coupon_code: raw.coupon_code ?? null,
    total: toNumber(raw.total),
    status: raw.status,
    payment_status: raw.payment_status ?? null,
    created_at: raw.created_at,
    items: Array.isArray(items) ? items.map(mapOrderItem) : [],
  };
}

export function mapOrders(raws: RawOrder[] | null | undefined): Order[] {
  if (!Array.isArray(raws)) return [];
  return raws.map(mapOrder);
}
