<<<<<<< HEAD
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { storeConfig } from '@/conf/config.store'
import { useAuth } from '@/hooks/useAuth'
import { AppDispatch } from '@/store'
import { fetchCartItems, selectCartCount, selectCartSubtotal } from '@/store/slices/cart-slice-items'
import CategoriesBar from './categories-bat'
import MobileMenu from './mobile-header'

const Navbar = () => (
  <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
    <TopBar />
    <MainHeader />
    <CategoriesBar />
  </header>
)

export default Navbar

const TopBar = () => (
  <div className="bg-primary text-white">
    <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] sm:text-xs">
      <div className="hidden items-center gap-4 sm:flex">
        <span className="flex items-center gap-1.5 text-white/80">
          <Phone aria-hidden="true" className="size-3.5" />
          <span>1-800-TECHZONE</span>
        </span>
        <span className="flex items-center gap-1.5 text-white/80">
          <MapPin aria-hidden="true" className="size-3.5" />
          <span>Find a Store</span>
        </span>
      </div>

      <p className="flex flex-1 items-center justify-center gap-1.5 text-center font-medium text-orange-300 sm:flex-initial">
        <Truck aria-hidden="true" className="hidden size-3.5 sm:block" />
        <span>Free shipping over $100</span>
        <span className="hidden text-white/50 sm:inline">·</span>
        <span className="hidden sm:inline">Same-day delivery available</span>
      </p>

      <div className="hidden items-center gap-4 sm:flex">
        <Link href="/account/orders" className="transition-colors hover:text-orange-300">My Orders</Link>
        <Link href="/favorites" className="transition-colors hover:text-orange-300">Favorites</Link>
      </div>
    </div>
  </div>
)

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
    if (isAuthenticated) dispatch(fetchCartItems())
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = searchValue.trim()
    setMobileMenuOpen(false)
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop')
  }

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const accountHref = isAuthenticated ? '/account/orders' : '/auth/login'
  const accountLabel = isAuthenticated ? 'Your account and orders' : 'Sign in to your account'

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-2 sm:gap-4 lg:h-20 lg:gap-8">
          <button
            type="button"
            className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>

          <Link href="/" aria-label={`${storeConfig.name} home`} className="flex shrink-0 items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-xl font-black text-white">T</span>
            <span className="hidden min-[375px]:block">
              <span className="block text-base font-bold leading-tight text-slate-900 sm:text-lg">{storeConfig.name}</span>
              <span className="hidden text-[10px] uppercase tracking-wider text-slate-500 sm:block">{storeConfig.tagline}</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} role="search" aria-label="Product search" className="hidden min-w-0 max-w-2xl flex-1 lg:block">
            <div className={`relative flex items-center overflow-hidden rounded-full border transition-all ${searchFocused ? 'border-primary shadow-md shadow-primary/10' : 'border-slate-200 hover:border-slate-300'}`}>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 size-5 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products, brands, and categories"
                aria-label="Search products, brands, and categories"
                className="h-12 min-w-0 flex-1 bg-transparent pl-12 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
                <Search aria-hidden="true" className="size-4" />
                Search
              </button>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/favorites"
              aria-label="Favorites"
              title="Favorites"
              className="inline-flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Heart aria-hidden="true" className="size-5" />
            </Link>

            <Link
              href={accountHref}
              aria-label={accountLabel}
              title={isAuthenticated ? 'My account' : 'Sign in'}
              className="inline-flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            >
              <UserRound aria-hidden="true" className="size-5" />
            </Link>

            {!isAuthenticated ? (
              <Link href="/auth/login" className="hidden items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-100 lg:flex">
                <UserRound aria-hidden="true" className="size-5 text-slate-700" />
                <span className="text-left">
                  <span className="block text-[10px] text-slate-500">Welcome</span>
                  <span className="block text-xs font-semibold text-slate-900">Sign in</span>
                </span>
              </Link>
            ) : (
              <>
                <Link href="/account/orders" className="hidden items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-100 lg:flex">
                  <UserRound aria-hidden="true" className="size-5 text-slate-700" />
                  <span className="text-left">
                    <span className="block text-[10px] text-slate-500">Your</span>
                    <span className="block text-xs font-semibold text-slate-900">Orders</span>
                  </span>
                </Link>
                <Link href="/account/addresses" className="hidden items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-100 lg:flex">
                  <MapPin aria-hidden="true" className="size-5 text-slate-700" />
                  <span className="text-left">
                    <span className="block text-[10px] text-slate-500">Your</span>
                    <span className="block text-xs font-semibold text-slate-900">Addresses</span>
                  </span>
                </Link>
                <button type="button" onClick={() => void handleLogout()} className="hidden rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:block">
                  Sign out
                </button>
              </>
            )}

            <Link
              href="/cart"
              aria-label={`Shopping cart, ${count} ${count === 1 ? 'item' : 'items'}, subtotal $${subtotal.toFixed(2)}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-3 text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:rounded-xl lg:px-3.5"
            >
              <span className="relative inline-flex">
                <ShoppingCart aria-hidden="true" className="size-5" />
                <span aria-hidden="true" className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{count}</span>
              </span>
              <span className="hidden text-sm font-semibold lg:block">${subtotal.toFixed(2)}</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} role="search" aria-label="Product search" className="pb-3 lg:hidden">
          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Search aria-hidden="true" className="ml-3 size-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search products, brands, and categories"
              aria-label="Search products, brands, and categories"
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button type="submit" aria-label="Search" className="inline-flex h-full w-11 shrink-0 items-center justify-center text-primary transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
              <Search aria-hidden="true" className="size-4" />
            </button>
          </div>
        </form>
      </div>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  )
}
=======
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
import { fetchCategories } from '@/store/slices/shop-category-slice'
import type { AppDispatch, RootState } from '@/store'
import type { Category } from '@/shared/types/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
    hasFetched: categoriesFetched,
  } = useSelector((state: RootState) => state.categories)

  useEffect(() => {
    if (!categoriesFetched && !categoriesLoading && !categoriesError) {
      void dispatch(fetchCategories())
    }
  }, [categoriesError, categoriesFetched, categoriesLoading, dispatch])

  const retryCategories = () => {
    void dispatch(fetchCategories())
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-999 bg-white shadow-sm">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <MainHeader
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={retryCategories}
      />

      {/* Categories Bar */}
      <CategoriesBar
        categories={categories}
        loading={categoriesLoading}
        error={categoriesError}
        onRetry={retryCategories}
      />
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
interface HeaderCategoriesProps {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string;
  onRetryCategories: () => void;
}

const MainHeader = ({
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
}: HeaderCategoriesProps) => {
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
        <MobileMenu
          onClose={() => setMobileMenuOpen(false)}
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          onRetryCategories={onRetryCategories}
        />
      )}
    </div>
  )
}
>>>>>>> 4da06ca (feat: enhance category management with loading and error handling in mobile and main headers)
