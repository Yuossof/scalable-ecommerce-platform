// features/cart/components/cart-item-skeleton.tsx
const CartItemSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="grid grid-cols-12 gap-4 items-center">
        
        {/* Product Info - 6 columns */}
        <div className="col-span-6 flex gap-4">
          {/* Image Skeleton */}
          <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />

          {/* Details Skeleton */}
          <div className="flex flex-col justify-center flex-1">
            {/* Name */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            
            {/* Stock Status */}
            <div className="h-3 bg-gray-200 rounded w-16 mb-3" />

            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="h-3 bg-gray-200 rounded w-14" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>

        {/* Quantity - 2 columns */}
        <div className="col-span-2 flex justify-center">
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        </div>

        {/* Unit Price - 2 columns */}
        <div className="col-span-2 flex justify-center">
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>

        {/* Total - 2 columns */}
        <div className="col-span-2 flex justify-end">
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export default CartItemSkeleton