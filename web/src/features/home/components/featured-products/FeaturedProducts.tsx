"use client"
import React from 'react'
import ProductCard from '@/features/products/components/product-card'
import ProductCardSkeleton from '@/shared/components/product/product-card-skeleton'
import { useProducts } from '@/shared/hooks/use-products'

const FEATURED_COUNT = 10

const FeaturedProducts = () => {
    const { products, isLoading, isError } = useProducts()
    const featured = products.slice(0, FEATURED_COUNT)

    return (
        <div className='flex w-full flex-col items-center mt-9 '>
            <div className="container flex w-full 2xl:max-w-[1250px] mt-16">
                <h1 className='text-4xl font-semibold'>New Arrivals</h1>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 container 2xl:max-w-[1250px] mt-14'>
                {isLoading &&
                    Array.from({ length: FEATURED_COUNT }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}

                {!isLoading &&
                    featured.map((product) => (
                        <ProductCard product={product} key={product.id} />
                    ))}
            </div>

            {!isLoading && isError && (
                <p className="mt-10 text-sm text-gray-500">
                    We couldn&apos;t load the products right now. Please try again later.
                </p>
            )}

            {!isLoading && !isError && featured.length === 0 && (
                <p className="mt-10 text-sm text-gray-500">No products available yet.</p>
            )}
        </div>
    )
}

export default FeaturedProducts
