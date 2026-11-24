"use client";

import ProductSection from "../product-section";
import { useCollections } from "@/shared/hooks/use-collections";

/**
 * Featured products are selected server-side via the `is_featured` flag; the
 * homepage never hardcodes product ids.
 */
const FeaturedProducts = () => {
  const { collections, isLoading, isError } = useCollections();

  return (
    <ProductSection
      title="Featured Products"
      subtitle="Handpicked gear we think you'll love"
      products={collections?.featured ?? []}
      isLoading={isLoading}
      isError={isError}
      href="/shop"
      emptyMessage="No featured products yet. Explore the full catalogue instead."
    />
  );
};

export default FeaturedProducts;
