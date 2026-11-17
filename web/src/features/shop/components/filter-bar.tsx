// features/shop/components/filter-bar.tsx
"use client"
import { useState } from 'react'
import { Check, ChevronDown, Grid2X2, LayoutGrid, List, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useShopProducts } from '@/features/shop/hooks/use-shop-products'
import { SORT_OPTIONS, findPriceRange } from '@/features/shop/lib/shop-filters'

const FilterBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { category, prices, query, sort, filtered, currentPage, pageSize } = useShopProducts()

  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'grid-sm' | 'list'>('grid')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    params.delete('page')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const activeFilters: { key: string; label: string; clear: () => void }[] = []

  if (category) {
    activeFilters.push({
      key: `category-${category.id}`,
      label: category.name,
      clear: () => updateParams({ category: null }),
    })
  }

  prices.forEach((value) => {
    const range = findPriceRange(value)
    activeFilters.push({
      key: `price-${value}`,
      label: range?.label ?? value,
      clear: () =>
        updateParams({ price: prices.filter((price) => price !== value).join(',') || null }),
    })
  })

  if (query) {
    activeFilters.push({
      key: 'query',
      label: `“${query}”`,
      clear: () => updateParams({ q: null }),
    })
  }

  const clearAllFilters = () => updateParams({ category: null, price: null, q: null })

  const start = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, filtered.length)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Left - Active Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-[var(--color-slate-700)]">Filters:</span>

          {activeFilters.length > 0 ? (
            <>
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={filter.clear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-slate-100)] text-[var(--color-slate-700)] rounded-full text-sm font-medium hover:bg-[var(--color-slate-200)] transition-colors"
                >
                  {filter.label}
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-[var(--color-slate-500)] hover:text-[var(--color-slate-700)] transition-colors"
              >
                Clear all
              </button>
            </>
          ) : (
            <span className="text-sm text-[var(--color-text-muted)]">No filters applied</span>
          )}
        </div>

        {/* Right - Sort & View */}
        <div className="flex items-center gap-4">
          {/* Results Count */}
          <span className="text-sm text-[var(--color-slate-500)] hidden sm:block">
            <span className="font-semibold text-[var(--color-slate-900)]">{start}-{end}</span> of{' '}
            <span className="font-semibold text-[var(--color-slate-900)]">{filtered.length}</span> products
          </span>

          <div className="h-6 w-px bg-[var(--color-slate-200)] hidden sm:block" />

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--color-slate-200)] rounded-lg hover:border-slate-400 transition-colors"
            >
              <span className="text-sm font-medium text-[var(--color-slate-700)]">
                Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-[var(--color-slate-200)] rounded-xl shadow-lg z-20 py-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateParams({ sort: option.value })
                        setSortOpen(false)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-slate-50)] flex items-center justify-between"
                    >
                      <span className={sort === option.value ? 'font-semibold text-[var(--color-slate-900)]' : 'text-[var(--color-slate-700)]'}>
                        {option.label}
                      </span>
                      {sort === option.value && (
                        <Check className="w-4 h-4 text-[var(--color-slate-700)]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Mode */}
          <div className="flex items-center border border-[var(--color-slate-200)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid'
                ? 'bg-slate-950 text-white'
                : 'bg-white text-[var(--color-slate-500)] hover:bg-[var(--color-slate-50)]'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid-sm')}
              className={`p-2.5 transition-colors ${viewMode === 'grid-sm'
                ? 'bg-[var(--color-slate-800)] text-white'
                : 'bg-white text-[var(--color-slate-500)] hover:bg-[var(--color-slate-50)]'
                }`}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list'
                ? 'bg-[var(--color-slate-800)] text-white'
                : 'bg-white text-[var(--color-slate-500)] hover:bg-[var(--color-slate-50)]'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
