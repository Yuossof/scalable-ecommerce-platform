// features/shop/components/sidebar/side-bar.tsx
import { Search, ChevronDown, Zap } from 'lucide-react'
import type { Category } from '@/shared/types/api'
import { PRICE_RANGES } from '@/features/shop/lib/shop-filters'

interface ShopSidebarProps {
  items: Category[]
  loading: boolean
  category: string | null
  query: string
  selectedPrices: string[]
  priceCounts: Record<string, number>
  categoryCounts: Record<string, number>
  expandedSections: {
    categories: boolean
    price: boolean
  }
  onSearch: (value: string) => void
  onSelectCategory: (slug: string) => void
  onToggleSection: (section: keyof ShopSidebarProps['expandedSections']) => void
  onTogglePrice: (value: string) => void
}

const ShopSidebar = ({
  items,
  loading,
  category,
  query,
  selectedPrices,
  priceCounts,
  categoryCounts,
  expandedSections,
  onSearch,
  onSelectCategory,
  onToggleSection,
  onTogglePrice,
}: ShopSidebarProps) => {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">

        {/* Search */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const value = new FormData(event.currentTarget).get('q')
            onSearch(typeof value === 'string' ? value : '')
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            key={query}
            placeholder="Search products..."
            className="w-full h-11 pl-11 pr-4 bg-gray-100 border-0 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </form>

        {/* Categories */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onToggleSection('categories')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <span className="font-semibold text-gray-900">Categories</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.categories && (
            loading ? (
              <div className="flex flex-col gap-2 px-2 pb-2">
                <div className="h-11 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-11 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-11 bg-slate-200 animate-pulse rounded-lg" />
              </div>
            ) : (
              <div className="px-2 pb-2">
                <button
                  onClick={() => onSelectCategory('')}
                  className={`w-full flex items-center justify-between p-3 cursor-pointer rounded-lg transition-colors ${!category
                    ? 'bg-slate-100 text-slate-900'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="text-sm font-medium">All Products</span>
                  <span className={`text-xs ${!category ? 'text-slate-600' : 'text-gray-400'}`}>
                    {items.reduce((total, cat) => total + (categoryCounts[cat.slug] ?? 0), 0)}
                  </span>
                </button>

                {items.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`w-full flex items-center justify-between p-3 cursor-pointer rounded-lg transition-colors ${category === cat.slug
                      ? 'bg-slate-100 text-slate-900'
                      : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className={`text-xs ${category === cat.slug ? 'text-slate-600' : 'text-gray-400'}`}>
                      {categoryCounts[cat.slug] ?? 0}
                    </span>
                  </button>
                ))}

                {items.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">No categories yet.</p>
                )}
              </div>
            )
          )}
        </div>

        {/* Price Range */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onToggleSection('price')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <span className="font-semibold text-gray-900">Price Range</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.price && (
            <div className="px-4 pb-4 space-y-3">
              {PRICE_RANGES.map((range) => (
                <label
                  key={range.value}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedPrices.includes(range.value)
                      ? 'bg-slate-800 border-slate-800'
                      : 'border-gray-300 group-hover:border-slate-400'
                      }`}>
                      {selectedPrices.includes(range.value) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {range.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{priceCounts[range.value] ?? 0}</span>
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(range.value)}
                    onChange={() => onTogglePrice(range.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Flash Sale Banner */}
        <div className="bg-linear-to-br from-gradient-slate-start to-(--color-gradient-slate-end) rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">Flash Sale</span>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Up to 50% off on selected items. Limited time offer!
          </p>
          <button className="w-full py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
            Shop Now
          </button>
        </div>
      </div>
    </aside>
  )
}

export default ShopSidebar
