"use client";

import { useState } from "react";
import { BadgePercent, Loader2, X } from "lucide-react";
import type { CouponPreview } from "@/shared/types/api";

interface CouponFormProps {
  coupon: CouponPreview | null;
  error: string;
  applying: boolean;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
}

const CouponForm = ({
  coupon,
  error,
  applying,
  onApply,
  onRemove,
}: CouponFormProps) => {
  const [code, setCode] = useState("");

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <BadgePercent className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-700 truncate">
              {coupon.code} applied
            </p>
            <p className="text-xs text-emerald-600">
              You save ${coupon.discount.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
          aria-label="Remove coupon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await onApply(code);
      }}
      className="space-y-2"
    >
      <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700">
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter code"
          className="min-w-0 flex-1 h-11 px-3 border border-gray-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-slate-500"
          disabled={applying}
        />
        <button
          type="submit"
          disabled={applying}
          className="px-4 h-11 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {applying && <Loader2 className="w-4 h-4 animate-spin" />}
          Apply
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
};

export default CouponForm;
