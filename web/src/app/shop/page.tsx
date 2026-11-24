// app/shop/page.tsx
import React, { Suspense } from 'react'
import ShopContent from '@/features/shop/components/shop-content'

const ShopPage = () => {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* <ShopHero /> */}
      <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
        <ShopContent />
      </Suspense>
    </main>
  )
}

export default ShopPage