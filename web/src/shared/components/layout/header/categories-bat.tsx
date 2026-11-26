<<<<<<< HEAD
import Link from "next/link"
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"
import { storeConfig } from "@/conf/config.store"

const CategoriesBar = () => (
  <div className="hidden border-b border-slate-200 bg-slate-50 lg:block">
    <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-4">
      <details className="group relative shrink-0">
        <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <LayoutGrid aria-hidden="true" className="size-4" />
          All Categories
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav
          aria-label="Shop by category"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          <ul className="grid grid-cols-2 gap-1">
            {storeConfig.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open")
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span aria-hidden="true" className="text-base">{category.icon}</span>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>

      <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-1">
        {storeConfig.navLinks.filter((link) => link.name !== "Favorites").map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${link.highlight ? "text-accent-strong hover:bg-orange-50" : "text-slate-700 hover:bg-white hover:text-primary"}`}
          >
            {link.name}
            {link.highlight && <span className="rounded bg-accent-strong px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">HOT</span>}
          </Link>
        ))}
      </nav>

      <Link
        href="/shop?sort=price-asc"
        className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-accent-strong transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Special offers <span className="text-slate-500">up to 50% off</span>
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  </div>
)

export default CategoriesBar
=======
import { ChevronDown, Menu } from "lucide-react"
import { useState } from "react"
import LinkButton from "../../link-button-client-cmp"
import { storeConfig } from "@/conf/config.store"
import type { Category } from "@/shared/types/api"

interface CategoriesBarProps {
  categories: Category[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}

const CategoriesBar = ({ categories, loading, error, onRetry }: CategoriesBarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-50 border-b border-gray-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 h-12">
          <div className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={() => setIsOpen((open) => !open)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <LinkButton
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  Shop all
                </LinkButton>
                {loading && <p className="px-3 py-2 text-sm text-gray-500">Loading categories...</p>}
                {error && (
                  <div className="px-3 py-2 text-sm text-red-600">
                    <p>Could not load categories.</p>
                    <button type="button" onClick={onRetry} className="mt-1 underline">
                      Try again
                    </button>
                  </div>
                )}
                {!loading && !error && categories.map((category) => (
                  <LinkButton
                    key={category.id}
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                  >
                    {category.name}
                  </LinkButton>
                ))}
                {!loading && !error && categories.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-500">No categories available.</p>
                )}
              </div>
            )}
          </div>

          {/* Main Links */}
          <nav className="flex items-center ml-4">
            {storeConfig.navLinks.map((link) => (
              <LinkButton
                key={link.name}
                href={link.href}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors rounded-lg
                  ${link.highlight 
                    ? 'text-secondary hover:bg-secondary-light' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }
                `}
              >
                {link.name}
                {link.highlight && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-secondary text-white text-[10px] font-bold rounded">
                    HOT
                  </span>
                )}
              </LinkButton>
            ))}
          </nav>

          {/* Right Side - Special Offer */}
          <div className="ml-auto">
            <LinkButton 
              href="/shop?sort=price-asc" 
              className="flex items-center gap-2 text-sm text-secondary font-semibold hover:underline"
            >
              <span>🎉</span>
              <span>Special Offers - Up to 50% OFF</span>
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesBar
>>>>>>> 4da06ca (feat: enhance category management with loading and error handling in mobile and main headers)
