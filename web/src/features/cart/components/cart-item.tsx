// features/cart/components/cart-item.tsx
"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/shared/types/api'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import {
  removeCartItem,
  setCartItemQuantity,
} from '@/store/slices/cart-slice-items'
import { useToast } from '@/shared/hooks/use-toast'
import { ApiError } from '@/shared/lib/errors/apiError'
import Spinner from '@/shared/components/customs/spinner'

interface CartItemProps {
  item: CartItemType
}

const CartItem = ({ item }: CartItemProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const toast = useToast()
  const [isRemoving, setIsRemoving] = useState(false)
  const [incLoading, setIncLoading] = useState(false)
  const [decLoading, setDecLoading] = useState(false)

  const quantity = item.quantity
  const totalPrice = item.price * quantity

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      await dispatch(removeCartItem(item.cart_item_id)).unwrap()
      toast.success('Item removed')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Something went wrong')
      setIsRemoving(false)
    }
  }

  const updateQuantity = async (delta: 1 | -1) => {
    const next = quantity + delta
    if (next <= 0) {
      await handleRemove()
      return
    }

    try {
      if (delta === 1) setIncLoading(true)
      else setDecLoading(true)

      await dispatch(
        setCartItemQuantity({
          cartItemId: item.cart_item_id,
          skuId: item.sku_id,
          quantity: next,
        })
      ).unwrap()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Something went wrong')
    } finally {
      setIncLoading(false)
      setDecLoading(false)
    }
  }

  return (
    <div className={`p-6 transition-all duration-300 ${isRemoving ? 'opacity-50 scale-95' : ''}`}>
      <div className="grid grid-cols-12 gap-4 items-center">

        {/* Product Info - 6 columns */}
        <div className="col-span-6 flex gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 group">
            {item.cover ? (
              <Image
                src={item.cover}
                alt={item.product_name}
                fill
                sizes="96px"
                className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-semibold text-gray-900 line-clamp-2 text-sm">
              {item.product_name}
            </span>

            {item.summary && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Quantity - 2 columns */}
        <div className="col-span-2 flex justify-center">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(-1)}
              disabled={decLoading || isRemoving}
              className="w-9 h-9 cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {decLoading ? <Spinner size={16} /> : <Minus className="w-4 h-4 text-gray-600" />}
            </button>
            <span className="w-10 text-center text-sm font-semibold text-gray-900 border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(1)}
              disabled={incLoading || isRemoving}
              className="w-9 h-9 cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {incLoading ? <Spinner size={16} /> : <Plus className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Unit Price - 2 columns */}
        <div className="col-span-2 text-center">
          <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
        </div>

        {/* Total - 2 columns */}
        <div className="col-span-2 text-right">
          <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default CartItem
