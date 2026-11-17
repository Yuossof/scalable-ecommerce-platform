// features/checkout/components/checkout-steps.tsx
import React from 'react'
import { Check, MapPin, CreditCard, ClipboardList } from 'lucide-react'
import { CheckoutStep } from './checkout-page'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
}

const steps = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'review', label: 'Review', icon: ClipboardList },
  { id: 'payment', label: 'Payment', icon: CreditCard },
]

const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  const getCurrentIndex = () => steps.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = index < getCurrentIndex()
        const isCurrent = step.id === currentStep
        const Icon = step.icon

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-orange-400 text-white'
                    : isCurrent
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`font-medium ${
                  isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 lg:w-24 h-0.5 mx-4 ${
                  index < getCurrentIndex() ? 'bg-orange-400' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default CheckoutSteps