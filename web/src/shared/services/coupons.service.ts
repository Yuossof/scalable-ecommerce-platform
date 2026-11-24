import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { toNumber } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { CouponPreview } from "@/shared/types/api";

interface CouponResponse {
  data: {
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: string | number;
    subtotal: string | number;
    discount: string | number;
    total: string | number;
  };
}

/**
 * Sends only the code. The backend validates it and calculates subtotal,
 * discount and total from the server-side cart.
 */
export const applyCouponService = async (code: string): Promise<CouponPreview> => {
  try {
    const res = await axiosInstanace.post<CouponResponse>(
      API_ENDPOINTS.COUPONS.APPLY,
      { code }
    );
    const preview = res.data.data;
    return {
      code: preview.code,
      discount_type: preview.discount_type,
      discount_value: toNumber(preview.discount_value),
      subtotal: toNumber(preview.subtotal),
      discount: toNumber(preview.discount),
      total: toNumber(preview.total),
    };
  } catch (error) {
    throw handleApiError(error);
  }
};
