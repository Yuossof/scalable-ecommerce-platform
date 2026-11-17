'use client';

import { useState } from 'react';
import VariantSelector from './variant-selector';
import ProductActions from './product-actions';
import { getDefaultSku } from '@/shared/lib/api/mappers';
import type { Product } from '@/shared/types/api';

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
    <div className="space-y-8">
      <VariantSelector
        skus={product.skus}
        selectedSkuId={selectedSku.id}
        onSelect={setSelectedSkuId}
      />
      <ProductActions
        skuId={selectedSku.id}
        price={selectedSku.price}
        maxQuantity={selectedSku.quantity}
      />
    </div>
  );
}
