// features/cart/components/cart-items.tsx
"use client"
import React from 'react'
import CartItem from './cart-item'
import CartItemSkeleton from './cart-item-skeleton'
import type { CartItem as CartItemType } from '@/shared/types/api'

interface CartItemsProps {
  items: CartItemType[]
  isLoading: boolean
}

const CartItems = ({ items, isLoading }: CartItemsProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}

        {!isLoading &&
          items.map((item) => (
            <CartItem key={item.cart_item_id} item={item} />
          ))}
      </div>
    </div>
  )
}

export default CartItems
