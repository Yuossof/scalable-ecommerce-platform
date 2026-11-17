"use client"
import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import { resetCart } from '@/store/slices/cart-slice-items'

const Fallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
  </div>
)

const CheckoutSuccessContent = () => {
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')
  const dispatch = useDispatch<AppDispatch>()

  // Covers the 3-D Secure redirect path where the checkout page never got to
  // reset its own cart state.
  useEffect(() => {
    dispatch(resetCart())
  }, [dispatch])

  const hasIntent = Boolean(paymentIntent)
  const succeeded = hasIntent && redirectStatus !== 'failed'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm text-center">
          {succeeded && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Thank you for your order! A confirmation has been recorded. You
                can review your orders any time from your account.
              </p>
              <Link
                href="/account/orders"
                className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                View your orders
              </Link>
              <Link
                href="/shop"
                className="mt-3 w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Continue shopping
              </Link>
            </>
          )}

          {hasIntent && !succeeded && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payment not completed</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Your payment wasn&apos;t completed. No charge has been made to
                your card.
              </p>
              <Link
                href="/cart"
                className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Back to cart
              </Link>
            </>
          )}

          {!hasIntent && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                <Info className="w-7 h-7 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">No recent payment</h1>
              <p className="text-gray-500 mt-2 text-sm">
                This page is shown after a completed Stripe payment. There is no
                pending payment linked to this visit.
              </p>
              <Link
                href="/shop"
                className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Continue shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CheckoutSuccessPage = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

export default CheckoutSuccessPage