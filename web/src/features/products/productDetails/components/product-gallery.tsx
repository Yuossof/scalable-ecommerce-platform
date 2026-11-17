'use client';

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({images}: {images: string[]}) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="lg:col-span-7 space-y-6">
        <div className="group relative overflow-hidden rounded-2xl aspect-video bg-linear-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border-primary/50 flex flex-col items-center justify-center shadow-lg">
          <span className="text-[11px] font-mono text-text-muted/60">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Main Product Image */}
      <div className="group relative overflow-hidden rounded-2xl aspect-video bg-bg-secondary border border-border-primary/50 shadow-lg hover:shadow-xl transition-shadow duration-500">
        <Image 
          src={images[selectedImage]} 
          alt="Product image"
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-3 gap-4">
        {images.slice(1).map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i + 1)}
            className={`group relative aspect-square bg-bg-secondary border rounded-xl overflow-hidden hover:border-primary/60 hover:bg-bg-tertiary transition-all duration-300 ${
              selectedImage === i + 1 ? 'border-primary ring-2 ring-primary/20' : 'border-border-primary/50'
            }`}
          >
            <Image 
              src={img} 
              alt={`Product thumbnail ${i + 1}`}
              fill
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
