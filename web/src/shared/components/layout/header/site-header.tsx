// components/layout/Navbar.tsx
"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  MapPin,
  Phone
} from 'lucide-react'
import { storeConfig } from '@/conf/config.store'
import CategoriesBar from './categories-bat'
import MobileMenu from './mobile-header'
import LinkButton from '../../link-button-client-cmp'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCartItems, selectCartCount, selectCartSubtotal } from '@/store/slices/cart-slice-items'
import { AppDispatch } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-999 bg-white shadow-sm">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <MainHeader />

      {/* Categories Bar */}
      <CategoriesBar />
    </header>
  )
}

export default Navbar

// ==================== Top Bar ====================
const TopBar = () => {
  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-9 text-xs">
          {/* Left */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>1-800-TECHZONE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Find a Store</span>
            </div>
          </div>

          {/* Center - Promo */}
          <div className="flex-1 text-center">
            <p className="text-yellow-400 font-medium">
              🔥 Free shipping on orders over $100 | Same-day delivery available
            </p>
          </div>

          {/* Right */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-yellow-400 transition-colors">
              My Orders
            </Link>
            <Link href="/favorites" className="hover:text-yellow-400 transition-colors">
              Favorites
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Main Header ====================
const MainHeader = () => {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  const count = useSelector(selectCartCount)
  const subtotal = useSelector(selectCartSubtotal)

  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems())
    }
  }, [dispatch, isAuthenticated])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const value = searchValue.trim()
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop')
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 lg:gap-8 h-16 lg:h-20">

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl text-gray-900">{storeConfig.name}</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5 tracking-wider uppercase">
                {storeConfig.tagline}
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className={`
              relative flex items-center border-2 rounded-full overflow-hidden transition-all duration-200
              ${searchFocused ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-200'}
            `}>
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full h-12 pl-12 pr-4 text-sm outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button type="submit" className="h-12 px-6 bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Favorites */}
            <LinkButton
              href="/favorites"
              className="flex items-center gap-2 p-2.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5 text-gray-700" />
            </LinkButton>

            {/* Account */}
            {!isAuthenticated && (
              <LinkButton
                href="/auth/login"
                className="hidden lg:flex items-center gap-2 p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <User className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-500">Welcome</p>
                  <p className="text-xs font-semibold text-gray-900">Sign In</p>
                </div>
              </LinkButton>
            )}

            {isAuthenticated && (
              <>
                <LinkButton
                  href="/account/orders"
                  className="hidden lg:flex items-center gap-2 p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500">My</p>
                    <p className="text-xs font-semibold text-gray-900">Orders</p>
                  </div>
                </LinkButton>
                <LinkButton
                  href="/account/addresses"
                  className="hidden lg:flex items-center gap-2 p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500">My</p>
                    <p className="text-xs font-semibold text-gray-900">Addresses</p>
                  </div>
                </LinkButton>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="hidden lg:block text-xs font-medium text-text-secondary hover:text-red-600 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}

            {/* Cart */}
            <LinkButton
              href="/cart"
              className="flex items-center gap-2 p-2.5 bg-primary hover:bg-primary-hover text-white rounded-full lg:rounded-xl transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-semibold">${subtotal.toFixed(2)}</span>
            </LinkButton>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative flex items-center border border-gray-200 rounded-full overflow-hidden">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search products..."
              className="w-full h-10 pl-10 pr-4 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <MobileMenu onClose={() => setMobileMenuOpen(false)} />
      )}
    </div>
  )
}
