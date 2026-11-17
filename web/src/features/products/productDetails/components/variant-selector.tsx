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
    <div className="space-y-4">
      <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted/70 block">
        Choose variant
      </span>
      <div className="flex gap-3 flex-wrap">
        {skus.map((sku) => {
          const isSelected = sku.id === selectedSkuId;
          const isSoldOut = sku.quantity <= 0;
          return (
            <button
              key={sku.id}
              onClick={() => onSelect(sku.id)}
              disabled={isSoldOut}
              title={sku.sku}
              className={`group relative min-w-14 h-14 px-3 rounded-xl border-2 transition-all duration-300 text-[11px] font-semibold ${
                isSelected
                  ? 'border-primary bg-primary text-text-inverted shadow-lg shadow-primary/30'
                  : 'border-border-primary/40 bg-bg-secondary text-text-primary hover:border-primary/60 hover:bg-bg-tertiary'
              } ${isSoldOut ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
            >
              <span className="flex items-center justify-center gap-1">
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {sku.sku}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
