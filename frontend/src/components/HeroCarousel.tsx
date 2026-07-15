import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  highlight: string;
  subtitle: string;
  badge: string;
  image: string;
  buttonText: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Immersive Sound',
    highlight: 'AcousticPro ANC',
    subtitle: 'Experience studio-grade sound with active noise cancellation, custom drivers, and 45-hour battery life. Save up to 20% today.',
    badge: 'Featured Offer - 20% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Shop Audio Collection',
    link: '/products?category=electronics',
  },
  {
    id: 2,
    title: 'Active Wellness',
    highlight: 'FitVibe Smartwatch',
    subtitle: 'Track steps, sleep score, and real-time heart rate with GPS integration and durable design. Free express shipping on orders above ₹1,999.',
    badge: 'Trending Fitness',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Explore Smartwatches',
    link: '/products?category=electronics',
  },
  {
    id: 3,
    title: 'Elevate Your Look',
    highlight: 'Summer Outfits',
    subtitle: 'Discover genuine leather bomber jackets, linen shirts, and StepUp mesh trainers. Make everyday comfort stylish.',
    badge: 'New Release - Summer Collection 2026',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Explore Fashion',
    link: '/products?category=fashion',
  },
  {
    id: 4,
    title: 'Café Quality At Home',
    highlight: 'BaristaCo Station',
    subtitle: 'Sip on thick luxurious espresso or automatic frothed milk lattes. Get 10% discount on premium home espresso machines.',
    badge: 'Premium Kitchen - 10% OFF',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Browse Coffee Makers',
    link: '/products?category=home-kitchen',
  },
  {
    id: 5,
    title: 'Pure Radiance',
    highlight: 'GlowRx Skincare',
    subtitle: 'Intensely hydrate and protect your moisture barrier with pure hyaluronic acid face serums and sunscreen SPF 50.',
    badge: 'Self-Care Essentials',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Shop Beauty Care',
    link: '/products?category=beauty',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const handleDotClick = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const activeSlide = slides[current];

  return (
    <section className="relative w-full h-[520px] md:h-[600px] bg-neutral-950 overflow-hidden select-none border-b border-neutral-900">
      
      {/* Background Slides */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image with Dark Vignette */}
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40 z-10" />
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Animated Gradients */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[130px] pointer-events-none z-10 animate-pulse" />

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-25 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Offer Badge */}
              <div>
                <span className="inline-flex items-center text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full backdrop-blur-md">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Title & Highlight */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-neutral-50 leading-tight">
                {activeSlide.title} <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {activeSlide.highlight}
                </span>
              </h1>

              {/* Subtitle / Description */}
              <p className="text-neutral-200 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-medium filter drop-shadow-md">
                {activeSlide.subtitle}
              </p>

              {/* Shop Action Button */}
              <div className="pt-4">
                <Link
                  to={activeSlide.link}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold px-8 py-4 rounded-full shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {activeSlide.buttonText}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Left/Right Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-neutral-900/40 hover:bg-neutral-900/80 text-neutral-200 hover:text-neutral-50 border border-neutral-800/40 hover:border-neutral-700 backdrop-blur-md transition hover:scale-110 active:scale-95 shadow-md hidden sm:flex"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-neutral-900/40 hover:bg-neutral-900/80 text-neutral-200 hover:text-neutral-50 border border-neutral-800/40 hover:border-neutral-700 backdrop-blur-md transition hover:scale-110 active:scale-95 shadow-md hidden sm:flex"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-indigo-500 shadow-md shadow-indigo-500/30' : 'w-2.5 bg-neutral-700 hover:bg-neutral-500'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
