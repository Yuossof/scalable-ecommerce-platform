'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[4/4.5] items-center justify-center border border-border-primary bg-bg-secondary text-sm text-text-muted">
        Product images coming soon
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
      {images.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={selectedImage === index}
              className={`relative size-[68px] shrink-0 overflow-hidden border bg-bg-secondary transition-colors sm:size-[76px] ${selectedImage === index ? 'border-text-primary' : 'border-border-primary hover:border-text-muted'}`}
            >
              <Image src={image} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative order-1 aspect-[4/4.5] overflow-hidden border border-border-primary bg-bg-secondary sm:order-2">
        <Image
          src={images[selectedImage]}
          alt={`${productName} product image ${selectedImage + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 56vw"
          className="object-cover"
        />
        <span className="absolute bottom-4 right-4 bg-bg-primary/90 px-2.5 py-1 text-[10px] font-medium tabular-nums text-text-secondary">
          {String(selectedImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
