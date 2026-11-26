"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { storeConfig } from "@/conf/config.store"
import { useAuth } from "@/hooks/useAuth"
<<<<<<< HEAD

const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
=======
import { useRouter } from "next/navigation"
import type { Category } from "@/shared/types/api"

interface MobileMenuProps {
  onClose: () => void;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string;
  onRetryCategories: () => void;
}

const MobileMenu = ({
  onClose,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
}: MobileMenuProps) => {
>>>>>>> 4da06ca (feat: enhance category management with loading and error handling in mobile and main headers)
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    onClose()
    router.push("/")
  }

  return (
    <nav
      id="mobile-navigation"
      aria-label="Mobile navigation"
      hidden={!open}
      className="absolute inset-x-0 top-full max-h-[calc(100dvh-9rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-xl lg:hidden"
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-4">
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login" onClick={onClose} className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Sign in</Link>
              <Link href="/auth/register" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Create account</Link>
            </>
          ) : (
            <>
              <Link href="/account/orders" onClick={onClose} className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">My orders</Link>
              <Link href="/account/addresses" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Addresses</Link>
              <button type="button" onClick={() => void handleLogout()} disabled={isLoading} className="col-span-2 rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">Sign out</button>
            </>
          )}
        </div>

        <div className="py-4">
<<<<<<< HEAD
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Shop by category</h2>
          <ul className="grid grid-cols-2 gap-2">
            {storeConfig.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  onClick={onClose}
                  className="flex min-h-11 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span aria-hidden="true" className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
=======
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <LinkButton
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                  {cat.name.charAt(0)}
                </span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </LinkButton>
            ))}
            {categoriesLoading && (
              <p className="col-span-2 text-sm text-gray-500">Loading categories...</p>
            )}
            {categoriesError && (
              <div className="col-span-2 text-sm text-red-600">
                <p>Could not load categories.</p>
                <button type="button" onClick={onRetryCategories} className="mt-1 underline">
                  Try again
                </button>
              </div>
            )}
            {!categoriesLoading && !categoriesError && categories.length === 0 && (
              <p className="col-span-2 text-sm text-gray-500">No categories available.</p>
            )}
          </div>
>>>>>>> 4da06ca (feat: enhance category management with loading and error handling in mobile and main headers)
        </div>

        <div className="border-t border-slate-100 pt-2">
          <ul>
            {storeConfig.navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default MobileMenu
