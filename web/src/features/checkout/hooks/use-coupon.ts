"use client";

import { useCallback, useState } from "react";
import { applyCouponService } from "@/shared/services/coupons.service";
import { ApiError } from "@/shared/lib/errors/apiError";
import type { CouponPreview } from "@/shared/types/api";

/** Local, per-checkout coupon state; totals always come from the backend. */
export function useCoupon() {
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  const applyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) {
      setError("Enter a coupon code");
      return;
    }

    setApplying(true);
    setError("");
    try {
      const preview = await applyCouponService(code);
      setCoupon(preview);
    } catch (err) {
      setCoupon(null);
      setError(
        err instanceof ApiError ? err.message : "Could not apply this coupon"
      );
    } finally {
      setApplying(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setError("");
  }, []);

  return { coupon, error, applying, applyCoupon, removeCoupon };
}
