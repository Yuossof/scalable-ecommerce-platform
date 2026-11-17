"use client"
import React, { useState } from 'react'
import { loginService, type LoginInput } from '@/shared/services/auth.service'
import LoginForm from './login-form'
import { ApiError } from '@/shared/lib/errors/apiError'

const LoginPageWrapper = () => {
    const [errorMessage, setErrorMessage] = useState("")

    const handleLogin = async (userData: LoginInput): Promise<boolean> => {
        try {
            await loginService(userData);
            // Hard navigation forces the SWR session probe (and every other
            // authenticated request) to re-run with the freshly set cookies.
            const redirect = new URLSearchParams(window.location.search).get("redirect");
            const target = redirect && redirect.startsWith("/") ? redirect : "/";
            window.location.assign(target);
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
                return false;
            }

            setErrorMessage("Something went wrong");
            return false;
        }
    };

    return (
        <div className='h-full w-full'>
            <LoginForm
                handleLogin={handleLogin}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
            />
        </div>
    )
}

export default LoginPageWrapper
