import React from 'react';
import { Layers, Package, Tag } from 'lucide-react';
import ProductGallery from './product-gallery';
import ProductPurchase from './product-purchase';
import { getProductStock, getProductMinPrice, getProductMaxPrice } from '@/shared/lib/api/mappers';
import type { Product } from '@/shared/types/api';

/** Collects every image available on the product and its SKUs, de-duplicated. */
function collectImages(product: Product): string[] {
  const all = [
    product.cover,
    ...product.images,
    ...product.skus.flatMap((sku) => [sku.cover, ...sku.images]),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(all));
}

export default function ProductDetailsServer({ product }: { product: Product }) {
  const images = collectImages(product);
  const stock = getProductStock(product);
  const minPrice = getProductMinPrice(product);
  const maxPrice = getProductMaxPrice(product);

  const highlights = [
    {
      icon: <Package className="w-4 h-4 text-text-primary" />,
      label: 'In stock',
      value: `${stock} units`,
    },
    {
      icon: <Layers className="w-4 h-4 text-text-primary" />,
      label: 'Variants',
      value: `${product.skus.length} SKU${product.skus.length === 1 ? '' : 's'}`,
    },
    {
      icon: <Tag className="w-4 h-4 text-text-primary" />,
      label: 'Price',
      value:
        maxPrice > minPrice
          ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
          : `$${minPrice.toFixed(2)}`,
    },
  ];

  const specifications = [
    { label: 'Product ID', value: product.id },
    { label: 'Summary', value: product.summary || '—' },
    { label: 'Category', value: product.category_id },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-bg-primary via-bg-primary to-bg-secondary text-text-primary font-sans selection:bg-primary selection:text-text-inverted">
      <main className="max-w-[1400px] mx-auto py-16 px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Product Visuals (7 Cols) - Client Component */}
          <ProductGallery images={images} />

          {/* Right: Specs & Purchase (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col h-full justify-between space-y-8">
            {/* Header Info - Server Rendered */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full w-fit">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    stock > 0 ? 'bg-primary' : 'bg-red-500'
                  }`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {stock > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-muted/60">
                    #{product.id.slice(0, 8).toUpperCase()}
                  </p>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-balance">
                    {product.name}
                  </h2>
                </div>

                <p className="text-base text-text-secondary leading-relaxed max-w-md text-balance">
                  {product.description || product.summary || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Highlights Grid - Server Rendered */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="group p-4 bg-bg-secondary/50 border border-border-primary/40 rounded-lg hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-primary/80 group-hover:text-primary transition-colors duration-300 mt-1">
                      {highlight.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-semibold uppercase text-text-muted/70 tracking-wider">
                        {highlight.label}
                      </span>
                      <span className="text-[12px] font-medium text-text-primary mt-1 truncate">
                        {highlight.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Variants + Price & CTA - Client Component */}
            <ProductPurchase product={product} />
          </div>
        </div>

        {/* Specifications Section - Server Rendered */}
        <section className="mt-24 pt-20 border-t border-border-primary/30 space-y-12">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-primary">
              Details
            </p>
            <h3 className="text-3xl font-black tracking-tight">Specifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-linear-to-b from-primary/20 to-primary/10 rounded-2xl overflow-hidden border border-primary/20">
            {specifications.map((spec, i) => (
              <div
                key={i}
                className={`bg-bg-primary p-8 space-y-3 hover:bg-bg-secondary/50 transition-colors duration-300 cursor-default group ${
                  i !== specifications.length - 1
                    ? 'border-b md:border-b-0 md:border-r border-primary/10'
                    : ''
                }`}
              >
                <span className="text-[10px] font-bold text-text-muted/70 uppercase tracking-wider block group-hover:text-primary transition-colors">
                  {spec.label}
                </span>
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
