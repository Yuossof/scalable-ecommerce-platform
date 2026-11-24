import React from 'react'
import SiteHeader from './site-header'
import SiteFooter from '../site-footer'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Header */}
            <SiteHeader />
            <main className="relative flex flex-1 pt-40 md:pt-36 lg:pt-[168px] ">
                <div id="main_overlay" className="absolute inset-0"></div>
                <div className='relative z-40 flex flex-1'>
                    <div className='w-full h-full'>
                        {children}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default MainLayout
