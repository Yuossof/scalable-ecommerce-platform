// features/shop/components/shop-content.tsx
import React from 'react'
import FilterBar from './filter-bar'
import ProductsGrid from './products-grid'
import SidebarWrapper from './sidebar/sidebar-wrapper'

const ShopContent = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-gray-500">Home</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Shop</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <SidebarWrapper />
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <FilterBar />
            <ProductsGrid />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopContent