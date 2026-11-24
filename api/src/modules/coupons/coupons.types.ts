export type DiscountType = "percentage" | "fixed";

export interface CouponRow {
    id: string;
    code: string;
    discount_type: DiscountType;
    discount_value: string | number;
    expires_at: string | Date;
    is_active: boolean;
}

/** Server-calculated preview returned by `POST /coupons/apply`. */
export interface CouponPreview {
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    subtotal: number;
    discount: number;
    total: number;
}
