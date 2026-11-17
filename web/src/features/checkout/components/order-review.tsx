// features/checkout/components/order-review.tsx
"use client"
import React, { useState } from 'react'
import { Check, Edit2, Loader2 } from 'lucide-react'
import type { Address } from '@/shared/types/api'

interface OrderReviewProps {
  address: Address | null
  creatingOrder: boolean
  orderError: string
  onContinueToPayment: () => void
  onEditShipping: () => void
}

const OrderReview = ({
  address,
  creatingOrder,
  orderError,
  onContinueToPayment,
  onEditShipping,
}: OrderReviewProps) => {
  const [agreed, setAgreed] = useState(false)

  const buildingLabel = address?.building ? `, ${address.building}` : ''
  const areaLabel = address?.area ? `${address.area}, ` : ''

  return (
    <div className="space-y-6">
      {/* Shipping Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <button
            onClick={onEditShipping}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="pl-11">
          <p className="font-medium text-gray-900">
            {address?.full_name ?? '—'}
          </p>
          <p className="text-gray-600 mt-1">
            {address?.street}{buildingLabel}
            {address?.apartment ? `, ${address.apartment}` : ''}
          </p>
          <p className="text-gray-600">{areaLabel}{address?.city ?? ''}</p>
          <p className="text-gray-600">{address?.phone ?? ''}</p>
        </div>
      </div>

      {/* Payment note */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Payment Method</h3>
        </div>
        <p className="pl-11 text-sm text-gray-500">
          You&apos;ll securely pay with Stripe on the next step. The total is
          calculated by our server — we never trust client-side totals.
        </p>
      </div>

      {/* Order creation error */}
      {orderError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {orderError}
        </div>
      )}

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 mt-0.5 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
        />
        <span className="text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="text-slate-800 underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-slate-800 underline">Privacy Policy</a>
        </span>
      </label>

      {/* Continue Button */}
      <button
        type="button"
        onClick={onContinueToPayment}
        disabled={!agreed || creatingOrder}
        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creatingOrder ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating order…
          </>
        ) : (
          <>
            Continue to Payment
            <Check className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  )
}

export default OrderReview