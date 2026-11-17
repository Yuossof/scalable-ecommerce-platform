import React from 'react'

const ProductCardSkeleton = () => {
  return (
    <div className="relative bg-bg-primary border border-border-primary w-full  overflow-hidden shadow-sm rounded-xl animate-pulse">

      {/* 1. Image Area */}
      <div className="relative aspect-[1.4/1] w-full bg-bg-secondary flex items-center justify-center p-6">
        {/* Image Skeleton */}
        <div className="w-[230px] h-[200px] bg-gray-300 rounded-lg" />
      </div>

      {/* 2. Info Section */}
      <div className="p-4 pt-3">
        {/* Title & Specs */}
        <div className="space-y-2 mb-3">
          {/* Title Skeleton */}
          <div className="h-2 w-3/4 bg-gray-400 rounded" />

          {/* Specs Skeleton */}
          <div className="h-2 w-1/2 bg-gray-300 rounded" />
        </div>

        {/* 3. Bottom Row: Price & Button */}
        <div className="flex items-center justify-between pt-3 border-t border-border-tertiary">
          {/* Price Skeleton */}
          <div className="h-5 w-16 bg-gray-400 rounded" />

          {/* Button Skeleton */}
          <div className="h-6 w-11 bg-gray-400 rounded" />
        </div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton