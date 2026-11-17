// features/orders/components/orders-page.tsx
"use client"
import React from 'react'
import Link from 'next/link'
import { Package, ShoppingBag } from 'lucide-react'
import useSWR from 'swr'
import { getOrdersService } from '@/shared/services/orders.service'
import { useAuth } from '@/hooks/useAuth'
import type { Order } from '@/shared/types/api'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadge(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

const ordersFetcher = getOrdersService

const OrdersPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, error, isLoading } = useSWR(
    isAuthenticated ? 'orders' : null,
    ordersFetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  )

  const orders = data ?? []

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your orders</h1>
          <p className="text-gray-500 mb-8">
            Your order history is tied to your account. Please sign in to
            continue.
          </p>
          <Link
            href="/auth/login?redirect=/account/orders"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500">Your order history</p>
            </div>
          </div>

          {/* Error */}
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}

          {!isLoading && error && (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
              <p className="text-red-600 mb-4">
                Could not load your orders. Please try again.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Back to home
              </Link>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8">
                When you place an order it will show up here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                Start shopping
              </Link>
            </div>
          )}

          {/* Orders */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order: Order) => {
                const itemCount = order.items.reduce(
                  (acc, item) => acc + item.quantity,
                  0
                )
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Order{' '}
                          <span className="font-mono font-medium text-gray-900">
                            {order.id.slice(0, 8)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusBadge(
                            order.payment_status ?? 'pending'
                          )}`}
                        >
                          {order.payment_status ?? 'pending'}
                        </span>
                        {order.status !== order.payment_status &&
                          order.status !== undefined && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full capitalize bg-gray-100 text-gray-600">
                              {order.status}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage