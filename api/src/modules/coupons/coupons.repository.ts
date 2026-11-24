import sql from "../../config/db.js";
import { CouponRow } from "./coupons.types.js";

export class CouponsRepository {
    async findByCode(code: string): Promise<CouponRow | undefined> {
        const [coupon] = await sql<CouponRow[]>`
            SELECT id, code, discount_type, discount_value, expires_at, is_active
            FROM coupons
            WHERE UPPER(code) = UPPER(${code})
        `
        return coupon
    }
}
