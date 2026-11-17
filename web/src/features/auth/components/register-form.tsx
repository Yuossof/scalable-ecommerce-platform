// features/auth/components/register-form.tsx
"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { RegisterInput } from '@/shared/services/auth.service'
import { registerSchema } from '@/features/auth/schemas/auth'

type RegisterFormProps = {
  errorMessage: string
  handleRegister: (data: RegisterInput) => Promise<boolean>
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
}

const RegisterForm = ({ handleRegister, errorMessage, setErrorMessage }: RegisterFormProps) => {
  const [errors, setErrors] = useState<{ [key in keyof RegisterInput]?: string }>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) setErrorMessage('')
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setErrors({})

    const { error, value } = registerSchema.validate(userData, { abortEarly: false })
    if (error) {
      const fieldErrors: { [key in keyof RegisterInput]?: string } = {}
      error.details.forEach((err) => {
        const fieldName = err.path[0] as keyof RegisterInput
        fieldErrors[fieldName] = err.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    const success = await handleRegister(value)
    if (!success) {
      setLoading(false)
    }
    // On success the wrapper hard-navigates to the "check your inbox" page, so
    // the button stays disabled to avoid a double registration before unload.
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full w-full">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Start shopping in minutes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  value={userData.name}
                  onChange={handleChange}
                  className={`w-full h-11 pl-12 pr-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  className={`w-full h-11 pl-12 pr-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={userData.password}
                  onChange={handleChange}
                  className={`w-full h-11 pl-12 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-800 cursor-pointer hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-slate-800 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
