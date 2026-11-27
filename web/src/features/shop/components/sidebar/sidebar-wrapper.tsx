"use client"
import React, { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ShopSidebar from './side-bar'
import { useShopProducts } from '@/features/shop/hooks/use-shop-products'
import { parseMulti } from '@/features/shop/lib/shop-filters'

const SidebarWrapper = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    categories,
    categoryCounts,
    priceCounts,
    categorySlug,
    prices,
    query,
    isLoading,
  } = useShopProducts()

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  })

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    // Any filter change resets to the first page.
    params.delete('page')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const handleSelectCategory = (slug: string) => {
    updateParams({ category: slug || null })
  }

  const handleSearch = (value: string) => {
    updateParams({ q: value.trim() || null })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const togglePrice = (value: string) => {
    const selected = parseMulti(searchParams.get('price'))
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    updateParams({ price: next.join(',') || null })
  }

  return (
    <ShopSidebar
      items={categories}
      loading={isLoading}
      category={categorySlug}
      query={query}
      selectedPrices={prices}
      priceCounts={priceCounts}
      categoryCounts={categoryCounts}
      expandedSections={expandedSections}
      onSearch={handleSearch}
      onSelectCategory={handleSelectCategory}
      onToggleSection={toggleSection}
      onTogglePrice={togglePrice}
    />
  )
}

export default SidebarWrapper
