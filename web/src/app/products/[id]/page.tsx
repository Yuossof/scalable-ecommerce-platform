import { notFound } from 'next/navigation';
import ProductDetailsServer from '@/features/products/productDetails/components/product-details-server';
import { mapProducts } from '@/shared/lib/api/mappers';
import type { RawProduct } from '@/shared/types/api';

// ISR Configuration
export const revalidate = 3600; // Revalidate every hour

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Loads the product from `GET /products/products-skus` because it is the only
 * listing source that includes SKUs (price/stock). The single-product endpoint
 * (`GET /products/:id`) omits SKUs, so it cannot drive the purchase panel.
 */
async function fetchProduct(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_PRIVATE_IP}/api/products/products-skus`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return null;

  const json = (await res.json()) as { data: RawProduct[] };
  return mapProducts(json.data).find((product) => product.id === id) ?? null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsServer product={product} />;
}
