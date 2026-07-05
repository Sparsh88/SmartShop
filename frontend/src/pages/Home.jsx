import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoaderSkeletons';
import { ArrowRight, ShoppingBag, Percent, TrendingUp, Zap, Star } from 'lucide-react';

const Home = ({ onToast }) => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [flashSale, setFlashSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flash Sale Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 24, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [bannerRes, catRes, prodRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products')
        ]);
        
        setBanners(bannerRes.data);
        setCategories(catRes.data);
        
        const allProds = prodRes.data.products || [];
        setTrending(allProds.filter(p => p.isTrending));
        setDeals(allProds.filter(p => p.isDeal));
        
        const flashItem = allProds.find(p => p.isFlashSale);
        if (flashItem) setFlashSale(flashItem);
      } catch (error) {
        console.error('Failed to load homepage data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const dummyReviews = [
    { name: 'Arjun Mehta', review: 'SmartShop AI has revolutionized how I purchase laptops. The budget assistant recommendation fit my constraints perfectly!', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { name: 'Priya Sharma', review: 'Visual search is magical! I uploaded a photo of my friends sneakers and got visual matches instantly. Paid with Razorpay seamlessly.', rating: 5, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
    { name: 'Rohan Gupta', review: 'Incredible customer support chatbot. It guided me through warranty processes and explained SSD speed options clearly.', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION (Banner Carousel / Splash) */}
      <section className="relative overflow-hidden bg-gray-900 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0">
          <img
            src={banners[0]?.image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200"}
            alt="Hero banner"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32 lg:px-8 space-y-6 text-white max-w-2xl">
          <span className="bg-primary-500/20 border border-primary-500/40 text-primary-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            SmartShop AI Special
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-gray-100 to-primary-300 bg-clip-text text-transparent">
            {banners[0]?.title || "Shop Smarter with AI"}
          </h1>
          <p className="text-base sm:text-lg text-gray-300 font-medium max-w-lg leading-relaxed">
            {banners[0]?.description || "Experience context-aware search, visual image recognition, and chatbot assistance tailored to your budget."}
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              to="/shop"
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:scale-105 transition-all duration-200"
            >
              Start Shopping <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Explore Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover premium selections curated for you</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="h-40 rounded-2xl shimmer"></div>
            ))
          ) : (
            categories.map(cat => (
              <Link
                key={cat._id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-extrabold text-lg">{cat.name}</h3>
                  <p className="text-[10px] text-gray-300 line-clamp-1">{cat.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 3. FLASH SALE COUNTDOWN */}
      {flashSale && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-8 text-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-lg mx-4">
          <div className="space-y-4">
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-current animate-pulse" /> Flash Sale
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Today's Hot Deal!</h2>
            <p className="text-red-100 max-w-md">{flashSale.name} is on high-discount today. Grab yours before the timer runs out!</p>
            
            {/* Timer clocks */}
            <div className="flex gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/10 min-w-[70px]">
                <p className="text-2xl font-black">{timeLeft.hours.toString().padStart(2, '0')}</p>
                <p className="text-[10px] text-red-200">Hours</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/10 min-w-[70px]">
                <p className="text-2xl font-black">{timeLeft.minutes.toString().padStart(2, '0')}</p>
                <p className="text-[10px] text-red-200">Mins</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/10 min-w-[70px]">
                <p className="text-2xl font-black">{timeLeft.seconds.toString().padStart(2, '0')}</p>
                <p className="text-[10px] text-red-200">Secs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex gap-6 items-center flex-col sm:flex-row">
            <img
              src={flashSale.images[0]}
              alt={flashSale.name}
              className="w-36 h-36 object-cover rounded-xl bg-white flex-shrink-0"
            />
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-extrabold text-xl line-clamp-1">{flashSale.name}</h3>
              <p className="text-sm text-red-100">Original price: ₹{flashSale.originalPrice.toLocaleString()}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl font-black text-yellow-300">₹{flashSale.price.toLocaleString()}</span>
                <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {flashSale.discount}% OFF
                </span>
              </div>
              <Link
                to={`/product/${flashSale._id}`}
                className="bg-white hover:bg-gray-100 text-red-600 font-bold px-6 py-2.5 rounded-full shadow-md inline-block text-sm pt-2 hover:scale-105 transition-transform"
              >
                Claim Offer Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. TODAY'S DEALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary-500" /> Today's Hot Deals
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Deep discounts on high-performance products</p>
          </div>
          <Link to="/shop" className="text-primary-500 hover:text-primary-600 font-semibold text-sm flex items-center gap-1 transition-all">
            See All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))
          ) : (
            deals.slice(0, 4).map(prod => (
              <ProductCard key={prod._id} product={prod} onToast={onToast} />
            ))
          )}
        </div>
      </section>

      {/* 5. TRENDING / FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary-500" /> Trending Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Our best-selling items based on consumer activity</p>
          </div>
          <Link to="/shop" className="text-primary-500 hover:text-primary-600 font-semibold text-sm flex items-center gap-1 transition-all">
            See All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))
          ) : (
            trending.slice(0, 4).map(prod => (
              <ProductCard key={prod._id} product={prod} onToast={onToast} />
            ))
          )}
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50 py-12 rounded-3xl space-y-8 border border-gray-100 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Loved by Customers</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Read verified reviews from customers shopping with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dummyReviews.map((rev, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {Array(rev.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">"{rev.review}"</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-primary-500" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{rev.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
