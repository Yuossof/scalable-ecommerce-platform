'use client';

import { useState } from 'react';
import VariantSelector from './variant-selector';
import ProductActions from './product-actions';
import { getDefaultSku } from '@/shared/lib/api/mappers';
import FavoriteButton from '@/features/favorites/components/favorite-button';
import type { Product } from '@/shared/types/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

/**
 * Client-side purchase panel: owns the selected-SKU state so the price and the
 * add-to-cart action always target the same SKU.
 */
export default function ProductPurchase({ product }: { product: Product }) {
  const defaultSku = getDefaultSku(product);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(
    defaultSku?.id ?? null
  );

  const selectedSku =
    product.skus.find((sku) => sku.id === selectedSkuId) ?? defaultSku;

  if (!selectedSku) {
    return (
      <p className="text-sm text-text-muted">
        This product is currently unavailable.
      </p>
    );
  }

  return (
    <div className="mt-7 space-y-6">
      <div className="flex items-end justify-between border-b border-border-primary pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-text-muted">Price</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-.04em] tabular-nums">{formatPrice(selectedSku.price)}</p>
        </div>
        <p className="pb-1 text-xs text-text-muted">Taxes included</p>
      </div>
      <VariantSelector
        skus={product.skus}
        selectedSkuId={selectedSku.id}
        onSelect={setSelectedSkuId}
      />
      <div className="flex flex-wrap items-center gap-3">
        <ProductActions
          skuId={selectedSku.id}
          maxQuantity={selectedSku.quantity}
        />
        <FavoriteButton productId={product.id} />
      </div>
    </div>
  );
}
