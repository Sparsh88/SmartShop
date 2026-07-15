import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import { motion } from 'framer-motion';

export default function Home() {
  // Query homepage products from Express server
  const { data, isLoading } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const res = await api.get('/products/home');
      return res.data;
    },
  });

  const categories = [
    { 
      name: 'Electronics', 
      slug: 'electronics', 
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Fashion', 
      slug: 'fashion', 
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Home & Kitchen', 
      slug: 'home-kitchen', 
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Books', 
      slug: 'books', 
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Beauty', 
      slug: 'beauty', 
      image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&auto=format&fit=crop&q=80' 
    },
  ];

  return (
    <div className="space-y-16 pb-20 animate-page-enter">
      
      {/* 1. HERO BANNER CAROUSEL */}
      <HeroCarousel />

      {/* 2. CATEGORIES SANDWICHED BETWEEN MARQUEE TICKERS */}
      <div className="space-y-12">
        {/* LTR scrolling marquee banner */}
        <div className="w-full overflow-hidden bg-emerald-600 py-3 relative flex items-center shadow-inner">
          <div className="animate-marquee-left flex whitespace-nowrap gap-8 text-xs font-black uppercase tracking-wider text-white">
            <span>✦ 100% Premium Quality Products ✦</span>
            <span>Loved by 50,000+ Customers ✦</span>
            <span>Secure Cash on Delivery ✦</span>
            <span>Free Shipping on Orders above ₹1,999 ✦</span>
            <span>Easy 30-day Returns ✦</span>
            {/* Duplicated content for seamless looping */}
            <span>✦ 100% Premium Quality Products ✦</span>
            <span>Loved by 50,000+ Customers ✦</span>
            <span>Secure Cash on Delivery ✦</span>
            <span>Free Shipping on Orders above ₹1,999 ✦</span>
            <span>Easy 30-day Returns ✦</span>
          </div>
        </div>

        {/* Circular Categories List */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-widest text-indigo-400 font-semibold">
              Shop By Collection
            </h2>
            <p className="text-slate-400 text-sm">Explore curated categories from our stores</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Circular thumbnail container */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500 transition-all duration-300 shadow-md group-hover:scale-105 group-hover:shadow-indigo-500/10">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-300 tracking-wider uppercase mt-4 group-hover:text-indigo-400 transition-colors duration-300">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* RTL scrolling marquee banner */}
        <div className="w-full overflow-hidden bg-emerald-800 py-3 relative flex items-center shadow-inner">
          <div className="animate-marquee-right flex whitespace-nowrap gap-8 text-xs font-black uppercase tracking-wider text-white">
            <span>✦ Extra 10% Off on Orders above ₹3,999 | Code: WELCOME10 ✦</span>
            <span>Festive Sale is Live ✦</span>
            <span>New drops weekly ✦</span>
            <span>Premium brands & specifications ✦</span>
            <span>Satisfaction guaranteed ✦</span>
            {/* Duplicated content for seamless looping */}
            <span>✦ Extra 10% Off on Orders above ₹3,999 | Code: WELCOME10 ✦</span>
            <span>Festive Sale is Live ✦</span>
            <span>New drops weekly ✦</span>
            <span>Premium brands & specifications ✦</span>
            <span>Satisfaction guaranteed ✦</span>
          </div>
        </div>
      </div>

      {/* 3. FEATURED PRODUCTS */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Featured Products</h2>
            <p className="text-slate-400 text-sm">Curated picks for you this week</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.featured?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </motion.section>

      {/* 4. KEY ADVANTAGES BANNER */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-slate-900/50 border-y border-slate-800 py-10 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3.5 rounded-full text-indigo-400">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-500">On all local orders exceeding ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3.5 rounded-full text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Payment Gateway</h4>
              <p className="text-xs text-slate-500">100% encrypted bank transfers and COD</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3.5 rounded-full text-indigo-400">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">30-Day Free Returns</h4>
              <p className="text-xs text-slate-500">No questions asked return guarantee</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. TRENDING PRODUCTS */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Trending Items</h2>
            <p className="text-slate-400 text-sm">Popular products customers are buying</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.trending?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </motion.section>

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        className="max-w-4xl mx-auto px-4"
      >
        <div className="relative glass-card border border-slate-800 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 space-y-4 max-w-md mx-auto">
            <h3 className="text-2xl font-bold font-display text-white">Subscribe to our newsletter</h3>
            <p className="text-slate-400 text-sm">Get early updates, special discount alerts, and exclusive drop announcements.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Newsletter mockup signup approved!'); }} className="flex gap-2 pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="bg-slate-900 border border-slate-800 text-white rounded-full px-5 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition"
              >
                Join <Check size={16} />
              </button>
            </form>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
