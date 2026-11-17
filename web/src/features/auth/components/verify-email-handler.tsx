"use client"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { verifyEmailService } from "@/shared/services/auth.service"
import { ApiError } from "@/shared/lib/errors/apiError"

type Status = "loading" | "success" | "error"

/**
 * Target of the link in the verification email (`/verify-email?token=...`).
 * Consumes the one-time token, which also signs the user in by setting the
 * auth cookies on the response. The token is single-use, so the request is
 * guarded against double-invocation (React strict mode).
 */
const VerifyEmailHandler = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")
  const started = useRef(false)
  const tokenMissing = !token

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!token) return

    verifyEmailService(token)
      .then(() => setStatus("success"))
      .catch((error) => {
        setStatus("error")
        setMessage(
          error instanceof ApiError ? error.message : "Verification failed"
        )
      })
  }, [token])

  const errorMessage = tokenMissing
    ? "This verification link is missing its token."
    : message || "This link is invalid or has expired."

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full w-full">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          {status === "loading" && !tokenMissing && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                <Loader2 className="w-7 h-7 text-slate-700 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verifying your email…</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Your account is now active. You&apos;re signed in and ready to shop.
              </p>
              <Link
                href="/shop"
                className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Continue shopping
              </Link>
            </>
          )}

          {(tokenMissing || status === "error") && (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verification failed</h1>
              <p className="text-gray-500 mt-2 text-sm">
                {errorMessage}
              </p>
              <Link
                href="/auth/login"
                className="mt-6 w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailHandler
