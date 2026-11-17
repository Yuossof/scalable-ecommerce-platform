"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MailCheck, Loader2 } from "lucide-react"
import { resendVerificationService } from "@/shared/services/auth.service"
import { ApiError } from "@/shared/lib/errors/apiError"
import { useToast } from "@/shared/hooks/use-toast"

/**
 * Shown after registration while the account awaits email verification.
 * The backend sends the verification mail on register; this screen lets the
 * user request another one (e.g. if the first one expired).
 */
const VerifyEmailPending = () => {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!email || loading) return

    setLoading(true)
    try {
      await resendVerificationService(email)
      toast.success("Verification link sent")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not resend the email"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full w-full">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <MailCheck className="w-7 h-7 text-slate-700" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            We&apos;ve sent a verification link to your email address
            {email ? (
              <>
                {" "}
                <span className="font-medium text-gray-700">{email}</span>
              </>
            ) : null}
            . Click the link to activate your account.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={!email || loading}
            className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending…
              </>
            ) : (
              "Resend verification email"
            )}
          </button>

          <p className="text-gray-500 mt-6 text-sm">
            Already verified?{" "}
            <Link href="/auth/login" className="text-slate-800 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPending
