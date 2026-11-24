import { BaseError } from "../../common/errors/base.error.js";
import { CartItemsRepository } from "../carts/cart-items.repository.js";
import { CouponPreview, CouponRow } from "./coupons.types.js";
import { CouponsRepository } from "./coupons.repository.js";

/**
 * The single place where cart totals are summed. Both the coupon preview and
 * order creation use it so the client never supplies a subtotal or total.
 */
export function calculateCartSubtotal(
    items: Array<{ quantity: number; price: number | string }>
): number {
    return items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0)
}

function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export class CouponsService {
    private couponsRepository: CouponsRepository
    private cartItemsRepository: CartItemsRepository

    constructor(
        couponsRepository: CouponsRepository,
        cartItemsRepository: CartItemsRepository
    ) {
        this.couponsRepository = couponsRepository
        this.cartItemsRepository = cartItemsRepository
    }

    /** Validates a code and calculates the discount from a trusted subtotal. */
    async applyToSubtotal(code: string, subtotal: number): Promise<CouponPreview | null> {
        if (!code || !code.trim()) return null

        const coupon = await this.validate(code)
        const discountValue = Number(coupon.discount_value)
        const rawDiscount = coupon.discount_type === "percentage"
            ? (subtotal * discountValue) / 100
            : discountValue

        // A coupon can never reduce an order below zero or exceed the subtotal.
        const safeSubtotal = roundMoney(subtotal)
        const discount = Math.min(roundMoney(rawDiscount), safeSubtotal)

        return {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: discountValue,
            subtotal: safeSubtotal,
            discount,
            total: roundMoney(Math.max(0, safeSubtotal - discount)),
        }
    }

    /** Validates a coupon against the user's own cart and returns a preview. */
    async applyForCart(userId: string, code: string): Promise<CouponPreview> {
        const cartItems = await this.cartItemsRepository.getCartItems(userId)
        const preview = await this.applyToSubtotal(
            code,
            calculateCartSubtotal(cartItems)
        )

        if (!preview) {
            throw new BaseError("CouponCodeRequired", 400, true, "A coupon code is required")
        }

        return preview
    }

    private async validate(code: string): Promise<CouponRow> {
        const coupon = await this.couponsRepository.findByCode(code.trim().toUpperCase())
        if (!coupon) {
            throw new BaseError("CouponNotFound", 404, true, "Invalid coupon code")
        }
        if (!coupon.is_active) {
            throw new BaseError("CouponInactive", 400, true, "This coupon is no longer active")
        }
        if (new Date(coupon.expires_at).getTime() <= Date.now()) {
            throw new BaseError("CouponExpired", 400, true, "This coupon has expired")
        }

        const value = Number(coupon.discount_value)
        if (!Number.isFinite(value) || value <= 0) {
            throw new BaseError("CouponInvalidValue", 400, true, "This coupon has an invalid discount value")
        }
        if (coupon.discount_type === "percentage" && value > 100) {
            throw new BaseError("CouponInvalidValue", 400, true, "Percentage discounts cannot exceed 100%")
        }

        return coupon
    }
}
