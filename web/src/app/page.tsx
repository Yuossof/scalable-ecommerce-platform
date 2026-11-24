"use client";

import FeaturedProducts from '@/features/home/components/featured-products/FeaturedProducts'
import Hero from '@/features/home/components/hero/Hero'
import ProductSection from '@/features/home/components/product-section'
import { useCollections } from '@/shared/hooks/use-collections'

const Home = () => {
  const { collections, isLoading, isError } = useCollections()

  return (
    <div className="pb-16">
      <Hero />
      <FeaturedProducts />

      <ProductSection
        title="New Arrivals"
        subtitle="The latest products, just landed"
        products={collections?.newArrivals ?? []}
        isLoading={isLoading}
        isError={isError}
        href="/shop?sort=newest"
        emptyMessage="No products have been added yet."
      />

      <ProductSection
        title="Best Sellers"
        subtitle="What other shoppers are buying most"
        products={collections?.bestSellers ?? []}
        isLoading={isLoading}
        isError={isError}
        href="/shop"
        emptyMessage="Best sellers appear once orders have been placed."
      />

      <ProductSection
        title="Special Offers"
        subtitle="Products currently available at a lower price"
        products={collections?.specialOffers ?? []}
        isLoading={isLoading}
        isError={isError}
        href="/shop?sort=price-asc"
        emptyMessage="No special offers right now. Check back soon."
      />
    </div>
  )
}

export default Home
