"use client";

import { useState } from "react";
import Image from "next/image";

interface CategoryImageProps {
  name: string;
  image: string | null | undefined;
  sizes: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

/** Displays a category image with a clean first-letter fallback if absent or broken. */
export function CategoryImage({
  name,
  image,
  sizes,
  className = "",
  imageClassName = "object-cover",
  fallbackClassName = "text-primary font-bold uppercase",
}: CategoryImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = image?.trim() || null;
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${className}`}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          className={imageClassName}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className={fallbackClassName}>{name.charAt(0)}</span>
      )}
    </span>
  );
}
