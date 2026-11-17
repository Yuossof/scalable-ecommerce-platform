import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import AddToCartButton from "./add-to-cart-button";
import LinkButton from "@/shared/components/link-button-client-cmp";
import {
  getDefaultSku,
  getProductMaxPrice,
  getProductMinPrice,
  getProductStock,
} from "@/shared/lib/api/mappers";
import type { Product } from "@/shared/types/api";

const ProductCard = ({ product }: { product: Product }) => {
  const image = product.cover ?? product.images[0] ?? null;
  const minPrice = getProductMinPrice(product);
  const maxPrice = getProductMaxPrice(product);
  const defaultSku = getDefaultSku(product);
  const stock = getProductStock(product);

  const priceLabel =
    maxPrice > minPrice
      ? `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
      : `$${minPrice.toFixed(2)}`;

  return (
    <div className="group relative bg-bg-primary border border-border-primary w-full  overflow-hidden transition-all duration-500 hover:border-border-hover shadow-sm hover:shadow-md rounded-lg">
      {/* 1. Image & Overlay Area */}
      <div className="relative w-full md:h-48 h-40 overflow-hidden bg-bg-secondary">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-bg-overlay backdrop-blur px-2 py-1 border border-border-secondary z-10">
          <div
            className={`w-1 h-1 rounded-full animate-pulse ${
              stock > 0 ? "bg-primary" : "bg-red-500"
            }`}
          />
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-text-primary">
            {stock > 0 ? "Live" : "Sold out"}
          </span>
        </div>

        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-mono uppercase tracking-widest text-text-faint">
            No image
          </div>
        )}

        {/* Tech ID */}
        <div className="absolute top-3 right-3">
          <span className="text-[8px] font-mono text-text-subtle uppercase tracking-tighter">
            {product.name.slice(0, 10).replace(/\s+/g, "_")}
          </span>
        </div>
      </div>

      {/* 2. Compact Info Section */}
      <div className="p-4 pt-3">
        {/* Title & Specs Row */}
        <LinkButton
          href={`/products/${product.id}`}
          className="flex justify-between items-start mb-3 cursor-pointer"
        >
          <div className="space-y-0.5">
            <h3 className="text-[12px] font-black uppercase tracking-tight text-text-primary italic">
              {product.name}
            </h3>
          </div>
          <ArrowUpRight className="w-3 h-3 text-text-faint group-hover:text-text-primary transition-colors" />
        </LinkButton>

        {/* 3. Bottom Row: Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-border-tertiary">
          <div className="flex flex-col -space-y-1">
            <span className="text-[7px] font-bold text-text-subtle uppercase">
              Fixed Price
            </span>
            <span className="text-xl font-black tracking-tighter text-text-primary">
              {priceLabel}
            </span>
          </div>

          {defaultSku && (
            <AddToCartButton
              skuId={defaultSku.id}
              maxQuantity={defaultSku.quantity}
            />
          )}
        </div>
      </div>

      {/* 4. Scanning Line Effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-overlay-dark opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-[1.2s] ease-linear pointer-events-none" />
    </div>
  );
};

export default ProductCard;
