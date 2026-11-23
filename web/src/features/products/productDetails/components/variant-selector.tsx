'use client';

import { Check } from 'lucide-react';
import type { Sku } from '@/shared/types/api';

interface VariantSelectorProps {
  skus: Sku[];
  selectedSkuId: string | null;
  onSelect: (skuId: string) => void;
}

export default function VariantSelector({
  skus,
  selectedSkuId,
  onSelect,
}: VariantSelectorProps) {
  if (!skus || skus.length === 0) return null;

  return (
    <fieldset className="space-y-3">
      <legend className="text-[11px] font-semibold uppercase tracking-[.16em] text-text-secondary">
        Choose an option
      </legend>
      <div className="flex flex-wrap gap-2">
        {skus.map((sku) => {
          const isSelected = sku.id === selectedSkuId;
          const isSoldOut = sku.quantity <= 0;
          return (
            <button
              key={sku.id}
              type="button"
              onClick={() => onSelect(sku.id)}
              disabled={isSoldOut}
              title={`${sku.sku}${isSoldOut ? ' — out of stock' : ''}`}
              aria-pressed={isSelected}
              className={`inline-flex min-h-10 items-center gap-2 border px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-text-primary bg-text-primary text-bg-primary'
                  : 'border-border-primary bg-bg-primary text-text-primary hover:border-text-secondary'
              } ${isSoldOut ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
            >
              {isSelected && <Check aria-hidden="true" className="size-3.5" />}
              {sku.sku}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
