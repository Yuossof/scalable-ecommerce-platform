// features/checkout/components/checkout-page.tsx
"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import CheckoutSteps from './checkout-steps'
import ShippingForm from './shipping-form'
import PaymentForm from './payment-form'
import OrderReview from './order-review'
import OrderSummary from './order-summary'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store'
import {
  fetchCartItems,
  resetCart,
  selectCartItems,
  selectCartLoading,
} from '@/store/slices/cart-slice-items'
import { useAuth } from '@/hooks/useAuth'
import { useAddresses } from '../hooks/use-addresses'
import { useCoupon } from '../hooks/use-coupon'
import {
  createOrderService,
  type CreateOrderResult,
} from '@/shared/services/orders.service'
import { ApiError } from '@/shared/lib/errors/apiError'
import type { Address, AddressInput } from '@/shared/types/api'
import type { PaymentIntentResult } from '@stripe/stripe-js'

export type CheckoutStep = 'shipping' | 'review' | 'payment'

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const cartItems = useSelector(selectCartItems)
  const cartLoading = useSelector(selectCartLoading)

  const { addresses, isLoading: addressesLoading, refreshAddresses } = useAddresses(isAuthenticated)

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingData, setShippingData] = useState<AddressInput | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const couponState = useCoupon()
  const cartFetched = useRef(false)

  useEffect(() => {
    // Fetch once per authenticated session. The backend clears the cart when
    // the order is created, so re-fetching on an empty cart would loop.
    if (isAuthenticated && !cartFetched.current) {
      cartFetched.current = true
      void dispatch(fetchCartItems())
    }
  }, [dispatch, isAuthenticated, cartLoading])

  /**
   * Creates the order (and its PaymentIntent) the first time the user proceeds
   * from Review to Payment. Reusing the stored `clientSecret` on back-and-forth
   * navigation avoids creating duplicate orders — the backend clears the cart
   * when the order is created.
   */
  const handleContinueToPayment = useCallback(async () => {
    if (orderResult) {
      setCurrentStep('payment')
      return
    }

    setCreatingOrder(true)
    setOrderError('')
    try {
      const result = await createOrderService(couponState.coupon?.code)
      setOrderResult(result)
      setCurrentStep('payment')
    } catch (error) {
      setOrderError(
        error instanceof ApiError
          ? error.message
          : 'Could not create your order. Please try again.'
      )
    } finally {
      setCreatingOrder(false)
    }
  }, [orderResult, couponState.coupon])

  // Session is still being resolved.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to check out</h1>
          <p className="text-gray-500 mb-8">
            Your cart and placed orders are tied to your account. Please sign in
            to continue.
          </p>
          <Link
            href="/auth/login?redirect=/checkout"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  // Once the order is created the backend clears the cart (that is also why the
  // PaymentIntent already exists when we reach the payment step). An empty cart
  // before that point is a genuine "go shop" state.
  if (!cartLoading && !orderResult && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Add some products to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  const handleShippingSubmit = (data: AddressInput, address: Address) => {
    setShippingData(data)
    setSelectedAddress(address)
    setCurrentStep('review')
  }

  const handlePaymentSuccess = (result: PaymentIntentResult) => {
    const intent = result.paymentIntent
    if (!intent?.id) return

    // The cart was already cleared server-side when the order was created;
    // reflect that locally so the header badge and future pages are correct.
    dispatch(resetCart())

    const params = new URLSearchParams({
      payment_intent: intent.id,
      payment_intent_client_secret: intent.client_secret ?? '',
      redirect_status: intent.status,
    })
    window.location.href = `/checkout/success?${params.toString()}`
  }

  const currentOrder = selectedAddress

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CheckoutSteps currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          {currentStep === 'shipping' && (
            <div className="lg:col-span-2">
              <ShippingForm
                addresses={addresses}
                addressesLoading={addressesLoading}
                initialData={shippingData ?? undefined}
                onAddressesChanged={refreshAddresses}
                onSubmit={handleShippingSubmit}
              />
            </div>
          )}

          {/* Order Summary */}
          <div
            className={`${
              currentStep === 'payment' || currentStep === 'review'
                ? 'lg:col-span-2'
                : 'lg:col-span-1'
            }`}
          >
            <OrderSummary
              items={cartItems}
              coupon={couponState.coupon}
              couponError={couponState.error}
              applyingCoupon={couponState.applying}
              onApplyCoupon={couponState.applyCoupon}
              onRemoveCoupon={couponState.removeCoupon}
              canEditCoupon={!orderResult}
            />
          </div>

          {currentStep === 'review' && (
            <div className="lg:col-span-1">
              <OrderReview
                address={currentOrder}
                creatingOrder={creatingOrder}
                orderError={orderError}
                onContinueToPayment={handleContinueToPayment}
                onEditShipping={() => setCurrentStep('shipping')}
              />
            </div>
          )}

          {currentStep === 'payment' && orderResult && (
            <div className="lg:col-span-1">
              <PaymentForm
                clientSecret={orderResult.clientSecret}
                onBack={() => setCurrentStep('review')}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CheckoutPage