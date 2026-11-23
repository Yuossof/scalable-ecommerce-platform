import { CalendarDays, Layers3, PackageCheck } from 'lucide-react';
import ProductGallery from './product-gallery';
import ProductPurchase from './product-purchase';
import { getProductStock } from '@/shared/lib/api/mappers';
import type { Product } from '@/shared/types/api';

function collectImages(product: Product): string[] {
  return Array.from(
    new Set(
      [product.cover, ...product.images, ...product.skus.flatMap((sku) => [sku.cover, ...sku.images])]
        .filter((value): value is string => Boolean(value))
    )
  );
}

export default function ProductDetailsServer({ product }: { product: Product }) {
  const images = collectImages(product);
  const stock = getProductStock(product);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-[1320px] px-5 pb-20 pt-7 sm:px-8 lg:px-12 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-text-muted">
          <a href="/shop" className="transition-colors hover:text-text-primary">Shop</a>
          <span aria-hidden="true">/</span>
          <span className="max-w-[220px] truncate text-text-secondary">{product.name}</span>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)] lg:gap-16">
          <ProductGallery images={images} productName={product.name} />

          <section className="flex flex-col lg:sticky lg:top-8" aria-labelledby="product-name">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-text-secondary">
                Product
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
                <span className={`size-2 rounded-full ${stock > 0 ? 'bg-emerald-600' : 'bg-text-muted'}`} />
                {stock > 0 ? `${stock} in stock` : 'Currently unavailable'}
              </span>
            </div>

            <p className="mb-3 text-[11px] font-medium uppercase tracking-[.2em] text-text-muted">Product details</p>
            <h1 id="product-name" className="text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>
            {product.summary && (
              <p className="mt-4 text-base leading-7 text-text-secondary">{product.summary}</p>
            )}

            <ProductPurchase product={product} />

            <div className="mt-7 grid grid-cols-2 gap-3 border-y border-border-primary py-5">
              <div className="flex items-center gap-3">
                <PackageCheck className="size-4 shrink-0 text-text-secondary" aria-hidden="true" />
                <div><p className="text-xs font-medium">Available stock</p><p className="mt-1 text-xs text-text-muted">{stock} units</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Layers3 className="size-4 shrink-0 text-text-secondary" aria-hidden="true" />
                <div><p className="text-xs font-medium">Options</p><p className="mt-1 text-xs text-text-muted">{product.skus.length} {product.skus.length === 1 ? 'variant' : 'variants'}</p></div>
              </div>
            </div>

            <section id="product-details" className="mt-8" aria-labelledby="description-heading">
              <h2 id="description-heading" className="text-xs font-semibold uppercase tracking-[.18em]">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                {product.description || product.summary || 'Product information will be available soon.'}
              </p>
            </section>

            <div className="mt-7 flex items-center gap-2 text-[11px] text-text-muted">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <span>Added {product.created_at ? new Date(product.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'recently'}</span>
              <span className="ml-auto font-mono">ID {product.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
