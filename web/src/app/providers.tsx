import ReduxProvider from '@/store/provider'
import React from 'react'

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ReduxProvider>
                {children}
            </ReduxProvider>
        </>
    )
}

export default Providers