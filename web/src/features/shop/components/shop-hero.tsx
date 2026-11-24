// features/shop/components/shop-hero.tsx
"use client"
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Headphones, Laptop, Pause, Play, Smartphone, type LucideIcon } from 'lucide-react'

const slideIcons: LucideIcon[] = [Smartphone, Laptop, Headphones]

const slides = [
  {
    id: 1,
    badge: 'New Release',
    badgeColor: 'bg-emerald-500',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Titanium. So strong. So light. So Pro.',
    price: 'From \$1,199',
    cta: 'Shop Now',
    ctaLink: '/shop?q=iphone',
  },
  {
    id: 2,
    badge: 'Best Seller',
    badgeColor: 'bg-blue-500',
    title: 'MacBook Pro M3',
    subtitle: 'The most advanced Mac ever.',
    price: 'From \$1,999',
    cta: 'Learn More',
    ctaLink: '/shop?q=macbook',
  },
  {
    id: 3,
    badge: 'Limited Edition',
    badgeColor: 'bg-purple-500',
    title: 'Sony WH-1000XM5',
    subtitle: 'Industry-leading noise cancellation.',
    price: '\$349',
    cta: 'Buy Now',
    ctaLink: '/shop?category=audio',
  },
]

const ShopHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isPlaying, nextSlide])

  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Main Banner */}
          <div className="lg:col-span-2 relative bg-slate-900 rounded-2xl overflow-hidden h-80 sm:h-[380px] lg:h-[420px]">
            {/* Slides */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-12 z-10">
                    {/* Badge */}
                    <span className={`inline-block ${slide.badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4`}>
                      {slide.badge}
                    </span>
                    
                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                      {slide.title}
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-gray-400 text-sm sm:text-base mb-3 max-w-sm">
                      {slide.subtitle}
                    </p>
                    
                    {/* Price */}
                    <p className="text-white text-xl sm:text-2xl font-bold mb-6">
                      {slide.price}
                    </p>
                    
                    {/* CTA Button */}
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {slide.cta}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Product Visual */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%] hidden lg:flex items-center justify-center">
                    {(() => {
                      const Icon = slideIcons[index] ?? Smartphone
                      return <Icon className="w-48 h-48 text-white/20" aria-hidden="true" />
                    })()}
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-6 sm:left-10 flex items-center gap-3 z-20">
              {/* Dots */}
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
              
              {/* Pause/Play */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors ml-2"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-6">
            {/* Banner 1 - Hot Deal */}
            <Link 
              href="/shop?category=audio" 
              className="flex-1 relative rounded-2xl overflow-hidden group min-h-40 lg:min-h-0"
            >
              <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-red-600" />
              <div className="relative h-full p-5 lg:p-6 flex flex-col justify-between">
                <div>
                  <span className="text-white/80 text-xs font-medium">Hot Deal</span>
                  <h3 className="text-white font-bold text-lg lg:text-xl mt-1">
                    Wireless Earbuds
                  </h3>
                  <p className="text-white/80 text-sm mt-1">Up to 40% OFF</p>
                </div>
                <span className="text-white text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                  Shop Now 
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Banner 2 - New Arrival */}
            <Link 
              href="/shop?category=wearables" 
              className="flex-1 relative rounded-2xl overflow-hidden group min-h-40 lg:min-h-0"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-600" />
              <div className="relative h-full p-5 lg:p-6 flex flex-col justify-between">
                <div>
                  <span className="text-white/80 text-xs font-medium">New Arrival</span>
                  <h3 className="text-white font-bold text-lg lg:text-xl mt-1">
                    Smart Watches
                  </h3>
                  <p className="text-white/80 text-sm mt-1">Latest Collection</p>
                </div>
                <span className="text-white text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                  Explore 
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopHero