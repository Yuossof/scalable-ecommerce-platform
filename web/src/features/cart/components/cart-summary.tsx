// features/cart/components/cart-summary.tsx
"use client"
import React from 'react'
import Link from 'next/link'
import { ChevronRight, Lock, CreditCard, Truck } from 'lucide-react'
import type { CartItem } from '@/shared/types/api'

interface CartSummaryProps {
  items: CartItem[]
}

const CartSummary = ({ items }: CartSummaryProps) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const total = subtotal

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4">
        <h2 className="font-bold text-lg">Order Summary</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              Shipping
              <Truck className="w-4 h-4 text-emerald-500" />
            </span>
            <span className="font-medium text-emerald-600">FREE</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t-2 border-slate-900">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            Taxes and shipping calculated at checkout
          </p>
        </div>

        {/* Checkout Button */}
        <Link
          href={items.length === 0 ? '#' : '/checkout'}
          aria-disabled={items.length === 0}
          className={`w-full h-12 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
            items.length === 0
              ? 'bg-slate-300 text-white cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          Proceed to Checkout
          <ChevronRight className="w-5 h-5" />
        </Link>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure SSL Encrypted Payment</span>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">
            VISA
          </div>
          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">
            MC
          </div>
          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">
            AMEX
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartSummary
