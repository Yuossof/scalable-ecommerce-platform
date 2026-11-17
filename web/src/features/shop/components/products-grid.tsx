// features/shop/components/products-grid.tsx
"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ProductCard from "@/features/products/components/product-card"
import ProductCardSkeleton from "@/shared/components/product/product-card-skeleton"
import { useShopProducts } from "@/features/shop/hooks/use-shop-products"

/** Builds a compact page list, e.g. [1, '...', 4, 5, 6, '...', 12]. */
function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result: (number | "...")[] = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("...")
    result.push(page)
  })
  return result
}

const ProductsGrid = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { pageItems, totalPages, currentPage, isLoading, isError, filtered } = useShopProducts()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete("page")
    else params.set("page", String(page))
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500">We couldn&apos;t load the products right now.</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 text-sm font-semibold text-slate-800 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-gray-900">No products found</p>
        <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  const pages = buildPages(currentPage, totalPages)

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {pageItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {pages.map((page, idx) => (
              <button
                key={`${page}-${idx}`}
                onClick={() => typeof page === 'number' && goToPage(page)}
                disabled={page === '...'}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-colors ${currentPage === page
                  ? 'bg-slate-900 text-white'
                  : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'border border-gray-200 text-gray-700 hover:bg-slate-50'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsGrid
