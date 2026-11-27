/**
 * Types describing the real backend API contracts.
 *
 * Numeric PostgreSQL columns (DECIMAL) are returned by the `postgres` driver as
 * strings, so the `Raw*` shapes below describe the wire format and the domain
 * shapes describe the normalised values produced by `@/shared/lib/api/mappers`.
 */

/* -------------------------------------------------------------------------- */
/*                                   Generic                                  */
/* -------------------------------------------------------------------------- */

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

/* -------------------------------------------------------------------------- */
/*                                  Category                                  */
/* -------------------------------------------------------------------------- */

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                   Product                                  */
/* -------------------------------------------------------------------------- */

export interface RawSku {
  id: string;
  product_id: string;
  category_id?: string;
  sku: string;
  price: string | number;
  quantity: number | string;
  cover: string | null;
  images: string[] | null;
  created_at?: string;
  compare_at_price?: string | number | null;
}

export interface Sku {
  id: string;
  product_id: string;
  category_id?: string;
  sku: string;
  price: number;
  quantity: number;
  cover: string | null;
  images: string[];
  created_at?: string;
  compare_at_price: number | null;
}

export interface RawProduct {
  id: string;
  name: string;
  description: string | null;
  summary: string | null;
  cover: string | null;
  images: string[] | null;
  category_id: string;
  created_at?: string;
  is_featured?: boolean;
  skus?: RawSku[] | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  summary: string;
  cover: string | null;
  images: string[];
  category_id: string;
  created_at?: string;
  is_featured: boolean;
  skus: Sku[];
}

/* -------------------------------------------------------------------------- */
/*                                    Cart                                    */
/* -------------------------------------------------------------------------- */

export interface RawCartItem {
  cart_item_id: string;
  quantity: number | string;
  sku_id: string;
  price: string | number;
  product_name: string;
  cover: string | null;
  summary: string | null;
  user_id: string;
  cart_id: string;
}

export interface CartItem {
  cart_item_id: string;
  quantity: number;
  sku_id: string;
  price: number;
  product_name: string;
  cover: string | null;
  summary: string | null;
  user_id: string;
  cart_id: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Address                                   */
/* -------------------------------------------------------------------------- */

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  area: string | null;
  street: string;
  building: string | null;
  apartment: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface AddressInput {
  full_name: string;
  phone: string;
  city: string;
  area?: string;
  street: string;
  building?: string;
  apartment?: string;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

export interface RawOrderItem {
  id: string;
  products_sku_id: string;
  product_id?: string | null;
  product_name?: string | null;
  sku?: string | null;
  cover?: string | null;
  summary?: string | null;
  quantity: number | string;
  unit_price: string | number;
}

export interface OrderItem {
  id: string;
  products_sku_id: string;
  product_id: string | null;
  product_name: string | null;
  sku: string | null;
  cover: string | null;
  summary: string | null;
  quantity: number;
  unit_price: number;
}

/**
 * `POST /orders` returns the raw inserted row (key: `id`) with an
 * `orderItems` array while `GET /orders` maps the row to `order_id` with an
 * `items` array. The mapper normalises both into `Order`.
 */
export interface RawOrder {
  id?: string;
  order_id?: string;
  user_id: string;
  subtotal: string | number;
  discount?: string | number | null;
  coupon_code?: string | null;
  total: string | number;
  status: string;
  payment_status?: string | null;
  created_at: string;
  items?: RawOrderItem[] | null;
  orderItems?: RawOrderItem[] | null;
}

export interface Order {
  id: string;
  user_id: string;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  status: string;
  payment_status: string | null;
  created_at: string;
  items: OrderItem[];
}

/** Server-calculated coupon result (never computed in the browser). */
export interface CouponPreview {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  subtotal: number;
  discount: number;
  total: number;
}
