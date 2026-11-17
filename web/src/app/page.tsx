import FeaturedProducts from '@/features/home/components/featured-products/FeaturedProducts'
import Hero from '@/features/home/components/hero/Hero'
import React from 'react'

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
    </div>
  )
}

export default Home