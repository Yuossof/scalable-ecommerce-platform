import React from 'react'
import Link from 'next/link'
import { Heart, MapPin, Phone, ShoppingBag } from 'lucide-react'
import { storeConfig } from '@/conf/config.store'

const SiteFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">{storeConfig.name}</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              {storeConfig.tagline}. Discover the latest tech with secure checkout and fast delivery.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 1-800-TECHZONE
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Find a Store
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-white transition-colors" href="/shop">All Products</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/shop?sort=newest">New Arrivals</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/shop?sort=price-asc">Special Offers</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/favorites">Favorites</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">My Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-white transition-colors" href="/account/orders">My Orders</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/account/addresses">Addresses</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/auth/login">Sign In</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/auth/register">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Why Shop With Us</h3>
            <ul className="space-y-3 text-sm">
              {storeConfig.features.map((feature) => (
                <li key={feature.title}>
                  <p className="text-white font-medium">{feature.title}</p>
                  <p className="text-slate-400 text-xs">{feature.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {storeConfig.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-accent" /> for tech lovers
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
