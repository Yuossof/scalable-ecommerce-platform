// features/cart/components/empty-cart.tsx
import React from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'

const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-slate-400" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added any items to your cart yet.{' '}
          Start shopping to fill it up!
        </p>

        {/* CTA Button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Start Shopping
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Popular Categories */}
        <div className="mt-12">
          <p className="text-sm font-medium text-gray-500 mb-4">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Smartphones', 'Laptops', 'Headphones', 'Watches'].map((cat) => (
              <Link
                key={cat}
                href={`/shop?q=${encodeURIComponent(cat)}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyCart