"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/features/products/components/product-card";
import ProductCardSkeleton from "@/shared/components/product/product-card-skeleton";
import type { Product } from "@/shared/types/api";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  href?: string;
  emptyMessage?: string;
}

const ProductSection = ({
  title,
  subtitle,
  products,
  isLoading,
  isError,
  href = "/shop",
  emptyMessage = "Nothing here yet. Check back soon.",
}: ProductSectionProps) => {
  return (
    <section className="container max-w-[1250px] mx-auto px-4 mt-12 lg:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}

        {!isLoading && !isError &&
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>

      {!isLoading && isError && (
        <p className="py-10 text-center text-sm text-text-secondary">
          We couldn&apos;t load this section right now. Please try again later.
        </p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="py-10 text-center rounded-xl border border-dashed border-border-primary">
          <p className="text-sm text-text-secondary">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};

export default ProductSection;
