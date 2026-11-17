// components/home/Hero.tsx
"use client"
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { storeConfig } from '@/conf/config.store'
import Categories from '../categories/Categories'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const slides = storeConfig.heroSlides

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isPlaying, nextSlide])

  return (
    <section className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-4 gap-4">
          
          {/* Main Banner */}
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden">
            {/* Slides */}
            <div className="relative h-[280px] sm:h-[340px] lg:h-[420px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`
                    absolute inset-0 transition-all duration-700 ease-out
                    ${index === currentSlide 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentSlide 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                    }
                  `}
                >
                  {/* Background */}
                  <div className={`absolute inset-0 bg-linear-to-r ${slide.bgGradient}`} />
                  
                  {/* Content */}
                  <div className="relative h-full flex items-center">
                    <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-12">
                      {/* Tag */}
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-4">
                        {slide.tag}
                      </span>
                      
                      {/* Title */}
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                        {slide.title}
                      </h2>
                      
                      {/* Subtitle */}
                      <p className="text-white/80 text-sm sm:text-base mb-2 max-w-md">
                        {slide.subtitle}
                      </p>
                      
                      {/* Price */}
                      <p className="text-white text-xl sm:text-2xl font-bold mb-6">
                        {slide.price}
                      </p>
                      
                      {/* CTA */}
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base"
                      >
                        {slide.cta}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Product Image */}
                    <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-1/2 items-center justify-center p-8">
                      <div className="relative w-full h-full">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-6 sm:left-10 flex items-center gap-3">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${index === currentSlide 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/70'
                      }
                    `}
                  />
                ))}
              </div>

              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side Banners */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Banner 1 */}
            <Link href="/deals/audio" className="flex-1 relative rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-accent  to-accent-strong" />
              <div className="relative h-full p-5 flex flex-col justify-between">
                <div>
                  <span className="text-white/80 text-xs font-medium">Hot Deal</span>
                  <h3 className="text-white font-bold text-lg mt-1">Wireless Earbuds</h3>
                  <p className="text-white/80 text-sm mt-1">Up to 40% OFF</p>
                </div>
                <span className="text-white text-sm font-semibold group-hover:underline">
                  Shop Now →
                </span>
              </div>
            </Link>

            {/* Banner 2 */}
            <Link href="/category/wearables" className="flex-1 relative rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br  from-primary-light/70 to-accent-light/60" />
              <div className="relative h-full p-5 flex flex-col justify-between">
                <div>
                  <span className="text-white/80 text-xs font-medium">New Arrival</span>
                  <h3 className="text-white font-bold text-lg mt-1">Smart Watches</h3>
                  <p className="text-white/80 text-sm mt-1">Latest Collection</p>
                </div>
                <span className="text-white text-sm font-semibold group-hover:underline">
                  Explore →
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Categories Quick Access */}
        <Categories />

        {/* Features Bar */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {storeConfig.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-primary text-lg">
                  {feature.icon === 'Truck' && '🚚'}
                  {feature.icon === 'Shield' && '🛡️'}
                  {feature.icon === 'RotateCcw' && '↩️'}
                  {feature.icon === 'Headphones' && '🎧'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">{feature.title}</p>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero