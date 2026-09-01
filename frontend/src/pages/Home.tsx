import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import RecommendationSection from '../components/RecommendationSection';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function Home() {
  // Query homepage products from Express server
  const { data, isLoading } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const res = await api.get('/products/home');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = [
    { 
      name: 'Outerwear & Jackets', 
      slug: 'jackets', 
      count: 'Premium Outerwear',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Hoodies & Sweatshirts', 
      slug: 'hoodies', 
      count: 'Streetwear & Fleece',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'T-Shirts & Polos', 
      slug: 't-shirts', 
      count: 'Organic Cotton & Knits',
      image: '/uploads/black-crewneck-tee.jpg' 
    },
    { 
      name: 'Pants & Trousers', 
      slug: 'pants-trousers', 
      count: 'Chinos & Tailored Slacks',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=700&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Knitwear & Sweaters', 
      slug: 'sweaters', 
      count: 'Merino & Cable Knits',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Footwear & Sneakers', 
      slug: 'sneakers', 
      count: 'Leather & Performance',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&auto=format&fit=crop&q=80' 
    },
  ];

  const displayProducts = data?.featured || [];

  return (
    <div className="space-y-14 sm:space-y-20 pb-20 animate-page-enter">
      
      {/* 1. HERO BANNER BENTO SECTION */}
      <ScrollReveal direction="up" distance={20} duration={0.7}>
        <HeroCarousel />
      </ScrollReveal>

      {/* 2. INFINITE SMOOTH BLACK MOVING MARQUEE TICKER LINE */}
      <div className="w-full bg-[#121212] dark:bg-[#161618] text-white py-3.5 sm:py-4 overflow-hidden border-y border-neutral-800 shadow-soft-sm select-none pointer-events-none">
        <div className="animate-marquee-left flex items-center whitespace-nowrap text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] pointer-events-none">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-8 sm:gap-12 shrink-0 pr-8 sm:pr-12">
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> EASY 30-DAY RETURNS
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> 100% PREMIUM QUALITY PRODUCTS
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> LOVED BY 50,000+ CUSTOMERS
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> SECURE CASH ON DELIVERY
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> FREE SHIPPING ON ORDERS ABOVE ₹1,999
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> NEW SEASON ARRIVALS 2026
              </span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">✦</span> CODE: WELCOME10 FOR 10% OFF
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. OUR CATEGORY LIST / SHOP BY CLOTHING CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                Apparel Departments
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight">
                Our Category List
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 flex items-center gap-1.5 self-start sm:self-auto"
            >
              All Clothing Categories <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Compact Editorial Category Cards Grid */}
        <ScrollRevealGroup staggerDelay={0.06} delayChildren={0.02} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat, i) => (
            <ScrollRevealItem key={i} direction="up" distance={20}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="group relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#F4F3EF] dark:bg-[#1E1E22] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-end p-4 sm:p-5 shadow-soft-xs hover-translate-up"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 filter brightness-[0.92]"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />

                {/* Overlay Content */}
                <div className="relative z-10 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-300 block">
                    {cat.count}
                  </span>
                  <h3 className="font-editorial text-base sm:text-lg font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                  <div className="pt-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <span>Shop collection</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </Link>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </section>

      {/* 4. OUR PRODUCTS (FEATURED APPAREL PRODUCT GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                New Season Releases
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight">
                Our Products
              </h2>
            </div>
            <Link
              to="/products?category=fashion"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 flex items-center gap-1.5 self-start sm:self-auto"
            >
              View Clothing Catalog <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 animate-page-enter">
            {displayProducts.slice(0, 8).map((product: any) => (
              <div key={product.id} className="transition-all duration-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. PROMOTIONAL SPLIT EDITORIAL BANNER (Get 50% Off) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={30} duration={0.7}>
          <div className="relative rounded-3xl overflow-hidden bg-[#EFEFEB] dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 lg:grid-cols-12 items-center shadow-soft-sm">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-14 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
                <Sparkles size={12} /> Seasonal Offer
              </div>

              <div className="space-y-2">
                <h2 className="font-editorial text-4xl sm:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                  Get 50% Off
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-md leading-relaxed">
                  For all new season product purchases with minimum order value of ₹1,999. Use promo code at checkout.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/products?sort=price-asc"
                  className="btn-pill-arrow group inline-flex items-center shadow-soft-md"
                >
                  <span className="text-sm font-bold tracking-wide">Shop Now</span>
                  <div className="arrow-circle">
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Fashion Model Image (5 cols) */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=80"
                alt="50% Off Promotional Offer"
                className="w-full h-full object-cover object-top filter brightness-[0.98] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#EFEFEB] dark:from-[#18181B] via-transparent to-transparent lg:w-24" />
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* 5. FEATURED COLLECTIONS (BENTO ASYMMETRIC GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                Seasonal Capsules
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight">
                Featured Collections
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 flex items-center gap-1.5 self-start sm:self-auto"
            >
              Browse All Series <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Bento Grid: 1 Large Left Card + 2 Stacked Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Large Vertical Card: Full Set Series (6 cols) */}
          <ScrollReveal direction="up" distance={30} duration={0.7} className="lg:col-span-6">
            <Link
              to="/products?category=full-sets"
              className="group relative h-[420px] lg:h-[500px] rounded-3xl overflow-hidden bg-[#EAE8E3] dark:bg-[#1E1E22] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between p-6 sm:p-8 shadow-soft-sm block transition-all duration-500 hover:shadow-soft-xl hover:border-neutral-400 dark:hover:border-neutral-600"
            >
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
                alt="Full Set Series"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 group-hover:brightness-105 group-hover:contrast-[1.02] transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-500" />

              <div className="relative z-10 flex justify-end">
                <div className="w-10 h-10 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center group-hover:rotate-45 transition-transform shadow-md">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 block">
                  Couture Drop
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-white">
                  Full Set Series
                </h3>
              </div>
            </Link>
          </ScrollReveal>

          {/* Stacked Right Cards (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 gap-6">
            
            {/* Top Card: Winter Collection Series */}
            <ScrollReveal direction="up" distance={30} duration={0.7} delay={0.1}>
              <Link
                to="/products?category=sweaters"
                className="group relative h-[200px] lg:h-[238px] rounded-3xl overflow-hidden bg-[#EAE8E3] dark:bg-[#1E1E22] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between p-6 shadow-soft-sm block transition-all duration-500 hover:shadow-soft-lg hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                <img
                  src="https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80"
                  alt="Winter Collection Series"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 group-hover:brightness-105 group-hover:contrast-[1.02] transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-500" />

                <div className="relative z-10 flex justify-end">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center group-hover:rotate-45 transition-transform shadow-md">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="relative z-10 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 block">
                    Heavyweight Knit
                  </span>
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                    Winter Collection Series
                  </h3>
                </div>
              </Link>
            </ScrollReveal>

            {/* Bottom Card: Top Pants Series */}
            <ScrollReveal direction="up" distance={30} duration={0.7} delay={0.2}>
              <Link
                to="/products?category=pants-trousers"
                className="group relative h-[200px] lg:h-[238px] rounded-3xl overflow-hidden bg-[#EAE8E3] dark:bg-[#1E1E22] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between p-6 shadow-soft-sm block transition-all duration-500 hover:shadow-soft-lg hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                  alt="Top Pants Series"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 group-hover:brightness-105 group-hover:contrast-[1.02] transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-500" />

                <div className="relative z-10 flex justify-end">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center group-hover:rotate-45 transition-transform shadow-md">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="relative z-10 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 block">
                    Tailored Trousers
                  </span>
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                    Top Pants Series
                  </h3>
                </div>
              </Link>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* 6. AI-POWERED PERSONALIZED RECOMMENDATIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecommendationSection
          title="Recommended For You"
          subtitle="AI-curated recommendations based on your tastes, views, and activity"
          type="personalized"
          limit={4}
        />
      </div>

      {/* 7. KEY ADVANTAGES & TRUST PILLARS */}
      <section className="bg-white dark:bg-[#161618] border-y border-neutral-200/80 dark:border-neutral-800 py-12 transition-colors duration-300">
        <ScrollRevealGroup staggerDelay={0.12} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          <ScrollRevealItem direction="up" distance={25}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F3EF] dark:bg-[#1E1E22] flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-neutral-900 dark:text-white font-bold text-sm">Free Express Shipping</h4>
                <p className="text-xs text-neutral-400 mt-0.5">On all orders exceeding ₹1,999</p>
              </div>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem direction="up" distance={25}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F3EF] dark:bg-[#1E1E22] flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-neutral-900 dark:text-white font-bold text-sm">Encrypted Payments</h4>
                <p className="text-xs text-neutral-400 mt-0.5">100% secure bank transfers and COD</p>
              </div>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem direction="up" distance={25}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F3EF] dark:bg-[#1E1E22] flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="text-neutral-900 dark:text-white font-bold text-sm">30-Day Free Returns</h4>
                <p className="text-xs text-neutral-400 mt-0.5">No questions asked return guarantee</p>
              </div>
            </div>
          </ScrollRevealItem>

        </ScrollRevealGroup>
      </section>

      {/* 8. EDITORIAL NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-4xl mx-auto px-4">
        <ScrollReveal direction="up" distance={30} duration={0.7}>
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-soft-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Join Our VIP Community
            </span>
            <h3 className="font-editorial text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Stay in the Know
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Receive early access to seasonal drops, secret sales, and style guides directly in your inbox.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to VIP Newsletter!'); }} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full px-5 py-3 text-xs flex-grow focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
              <button
                type="submit"
                className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
