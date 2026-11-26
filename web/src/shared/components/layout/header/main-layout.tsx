import React from 'react'
import SiteHeader from './site-header'
import SiteFooter from '../site-footer'

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex min-h-screen flex-col">
    <SiteHeader />
    <main className="relative flex flex-1 pt-[152px] lg:pt-[164px]">
      <div id="main_overlay" className="absolute inset-0" />
      <div className="relative z-40 flex flex-1">
        <div className="h-full w-full">{children}</div>
      </div>
    </main>
    <SiteFooter />
  </div>
)

export default MainLayout
