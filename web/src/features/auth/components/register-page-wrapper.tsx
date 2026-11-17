"use client"
import React, { useState } from 'react'
import RegisterForm from './register-form'
import { registerService, type RegisterInput } from '@/shared/services/auth.service'
import { ApiError } from '@/shared/lib/errors/apiError'

const RegisterPageWrapper = () => {
  const [errorMessage, setErrorMessage] = useState("")

  const handleRegister = async (userData: RegisterInput): Promise<boolean> => {
    try {
      await registerService(userData)
      // The backend fires off the verification email on registration, so we
      // send the user to the "check your inbox" screen where they can resend.
      window.location.assign(
        `/auth/verify-email?email=${encodeURIComponent(userData.email)}`
      )
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
        return false
      }

      setErrorMessage("Something went wrong")
      return false
    }
  }

  return (
    <div className='w-full h-full'>
      <RegisterForm
        handleRegister={handleRegister}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  )
}

export default RegisterPageWrapper
