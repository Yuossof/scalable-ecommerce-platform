// features/cart/components/cart-page.tsx
"use client"
import React, { useEffect } from 'react'
import { Truck, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import CartItems from './cart-items'
import CartSummary from './cart-summary'
import EmptyCart from './empty-cart'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store'
import {
  fetchCartItems,
  selectCartItems,
  selectCartLoading,
} from '@/store/slices/cart-slice-items'
import { useAuth } from '@/hooks/useAuth'

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const items = useSelector(selectCartItems)
  const isCartLoading = useSelector(selectCartLoading)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems())
    }
  }, [dispatch, isAuthenticated])

  // Session is still being resolved.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems items={[]} isLoading />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your cart</h1>
          <p className="text-gray-500 mb-8">
            Your cart is tied to your account. Please sign in to continue.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (!isCartLoading && items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2">
            <CartItems items={items} isLoading={isCartLoading} />

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over $100</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-500">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary - Right Side */}
          <div className="lg:col-span-1">
            <CartSummary items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
