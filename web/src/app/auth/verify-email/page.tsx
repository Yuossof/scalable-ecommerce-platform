"use client"
import React, { Suspense } from 'react'
import VerifyEmailPending from '@/features/auth/components/verify-email-pending'

const Fallback = () => (
  <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full w-full">
    <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
  </div>
)

const VerifyEmailPendingPage = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <VerifyEmailPending />
    </Suspense>
  )
}

export default VerifyEmailPendingPage
