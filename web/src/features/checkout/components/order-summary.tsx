// features/checkout/components/order-summary.tsx
"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Truck, Shield } from 'lucide-react'
import type { CartItem } from '@/shared/types/api'

interface OrderSummaryProps {
  items: CartItem[]
}

const OrderSummary = ({ items }: OrderSummaryProps) => {
  const [showItems, setShowItems] = useState(true)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  // The backend computes the order total as the cart subtotal; shipping and
  // taxes are not implemented there yet.
  const total = subtotal

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4">
        <h2 className="font-bold text-lg">Order Summary</h2>
        <p className="text-slate-400 text-sm">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="p-6">
        {/* Items Toggle */}
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between mb-4"
        >
          <span className="font-medium text-gray-900">Order Items</span>
          {showItems ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Items List */}
        {showItems && (
          <div className="space-y-4 mb-6">
            {items.length === 0 && (
              <p className="text-sm text-gray-500">Your cart is empty.</p>
            )}
            {items.map((item) => (
              <div key={item.cart_item_id} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.product_name}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.product_name}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3 py-4 border-t border-gray-100">
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
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            Total calculated by our server at order creation
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Payments secured by Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Truck className="w-4 h-4 text-emerald-500" />
            <span>Free shipping</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary