// config/store.config.ts
export const storeConfig = {
  // ============================================
  // STORE INFO 
  // ============================================
  name: 'TechZone',
  tagline: 'Premium Electronics',
  logo: '/logo.svg',
  
  // ============================================
  //  HERO SLIDES 
  // ============================================
  heroSlides: [
    {
      id: 1,
      tag: 'New Release',
      title: 'iPhone 15 Pro Max',
      subtitle: 'Titanium. So strong. So light. So Pro.',
      price: 'From \$1,199',
      cta: 'Shop Now',
      ctaLink: '/shop?q=iphone',
      bgGradient: 'from-slate-900 via-slate-800 to-slate-900',
      textColor: 'white',
      icon: 'smartphone',
    },
    {
      id: 2,
      tag: 'Limited Offer',
      title: 'Gaming Week',
      subtitle: 'Up to 40% off on gaming gear',
      price: 'Starting \$299',
      cta: 'View Deals',
      ctaLink: '/shop?category=gaming',
      bgGradient: 'from-purple-600 via-violet-600 to-indigo-700',
      textColor: 'white',
      icon: 'gaming',
    },
    {
      id: 3,
      tag: 'Best Seller',
      title: 'AirPods Pro 2',
      subtitle: 'Adaptive Audio. Personalized Spatial Audio.',
      price: '\$249',
      cta: 'Buy Now',
      ctaLink: '/shop?category=audio',
      bgGradient: 'from-sky-400 via-blue-500 to-indigo-600',
      textColor: 'white',
      icon: 'audio',
    },
  ],

  // ============================================
  // 📂 CATEGORIES 
  // ============================================
  categories: [
    { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Audio', slug: 'audio', icon: '🎧' },
    { name: 'Wearables', slug: 'wearables', icon: '⌚' },
    { name: 'Gaming', slug: 'gaming', icon: '🎮' },
    { name: 'Cameras', slug: 'cameras', icon: '📷' },
    { name: 'Tablets', slug: 'tablets', icon: '📲' },
    { name: 'Accessories', slug: 'accessories', icon: '🔌' },
  ],

  // ============================================
  // 🔗 NAV LINKS 
  // ============================================
  navLinks: [
    { name: 'Shop', href: '/shop' },
    { name: 'New Arrivals', href: '/shop?sort=newest' },
    { name: 'Best Sellers', href: '/shop' },
    { name: 'Deals', href: '/shop?sort=price-asc', highlight: true },
    { name: 'Favorites', href: '/favorites' },
  ],

  // ============================================
  // ✨ FEATURES - المميزات
  // ============================================
  features: [
    { icon: 'Truck', title: 'Free Shipping', desc: 'On orders over \$100' },
    { icon: 'Shield', title: '2 Year Warranty', desc: 'Full coverage' },
    { icon: 'RotateCcw', title: '30-Day Returns', desc: 'Hassle-free' },
    { icon: 'Headphones', title: '24/7 Support', desc: 'Expert help' },
  ],
}

export type StoreConfig = typeof storeConfig