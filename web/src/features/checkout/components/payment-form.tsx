// features/checkout/components/payment-form.tsx
"use client"
import React, { useState } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import type { PaymentIntentResult } from '@stripe/stripe-js'
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import { getStripePromise } from '@/shared/lib/stripe'

interface PaymentFormProps {
  clientSecret: string
  onBack: () => void
  onSuccess: (result: PaymentIntentResult) => void
}

const appearance = {
  theme: 'stripe' as const,
  variables: { colorPrimary: '#1e293b', borderRadius: '12px' },
}

interface CheckoutFormProps {
  onBack: () => void
  onSuccess: (result: PaymentIntentResult) => void
}

const CheckoutForm = ({ onBack, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || processing) return

    setProcessing(true)
    setErrorMessage('')

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      // Keep control in this page for cards that don't require further steps;
      // banks that require 3-D Secure redirect to `return_url` instead.
      redirect: 'if_required',
    })

    if (result.error) {
      setErrorMessage(result.error.message ?? 'Payment failed. Please try again.')
      setProcessing(false)
      return
    }

    onSuccess(result)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payment</h2>
          <p className="text-sm text-gray-500">Pay securely with Stripe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PaymentElement options={{ layout: 'tabs' as const }} />

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing…
            </>
          ) : (
            'Pay now'
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to review
        </button>
      </form>
    </div>
  )
}

function PaymentForm({ clientSecret, onBack, onSuccess }: PaymentFormProps) {
  const stripePromise = getStripePromise()

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <CheckoutForm onBack={onBack} onSuccess={onSuccess} />
    </Elements>
  )
}

export default PaymentForm