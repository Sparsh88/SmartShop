import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function HeroCarousel() {
  return (
    <section className="relative w-full pt-4 pb-6 sm:pt-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Section: 2 Columns (Left: Text & Social Proof | Right: Large Featured Model) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle, CTA Button, Social Proof */}
          <div className="lg:col-span-6 space-y-7 sm:space-y-8">
            <div className="space-y-4 sm:space-y-5">
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl xl:text-[66px] font-black tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
                Unleash Your Style <br />
                Shop the Latest <br />
                Trends
              </h1>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm max-w-md leading-relaxed">
                Discover the latest trends & express your style effortlessly. Shop exclusive collections with premium designs, just for you!
              </p>

              {/* Action Buttons: Pill + Arrow circle */}
              <div className="pt-1 flex items-center gap-2">
                <Link
                  to="/products"
                  className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm"
                >
                  Shop Now
                </Link>
                <Link
                  to="/products"
                  className="w-11 h-11 rounded-full bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center justify-center transition shadow-soft-sm"
                  aria-label="Shop Now"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Social Proof & Avatar Stack */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-200/70 dark:border-neutral-800/70">
              <div className="space-y-1 max-w-xs">
                <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                  25 Million+
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">
                  Real reviews from our happy customers! See what fashion lovers are saying about our quality, style, and service.
                </p>
              </div>

              {/* Customer Avatar Stack */}
              <div className="flex items-center -space-x-2 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Customer 1"
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Customer 2"
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Customer 3"
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Customer 4"
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Featured Large Editorial Showcase Card with rich hover effect */}
          <Link
            to="/products?category=full-sets"
            className="lg:col-span-6 relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-[#F4F3EF] dark:bg-[#1C1C20] h-[380px] sm:h-[440px] lg:h-[460px] border border-neutral-200/60 dark:border-neutral-800 shadow-soft-sm group cursor-pointer block transition-all duration-500 hover:shadow-soft-xl hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80"
              alt="Featured Look"
              className="w-full h-full object-cover object-top filter brightness-[0.98] group-hover:scale-108 group-hover:brightness-105 group-hover:contrast-[1.02] transition-all duration-700 ease-out"
            />
            {/* Subtle Gradient & Floating Hover Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-between p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                <span>Explore Trend</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>

        </div>

        {/* Bottom Section: 3 Horizontal Cards Bento Row (Model 1, Model 2, Models wearing full outfits) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2">
          
          {/* Card 1: Model wearing light jacket */}
          <Link
            to="/products?category=jackets"
            className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F4F3EF] dark:bg-[#1C1C20] h-60 sm:h-72 border border-neutral-200/60 dark:border-neutral-800 shadow-soft-sm group cursor-pointer block transition-all duration-500 hover:shadow-soft-lg hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            <img
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"
              alt="Model Outfit Look"
              className="w-full h-full object-cover object-center group-hover:scale-108 group-hover:brightness-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                Outerwear Edit <ArrowUpRight size={13} />
              </span>
            </div>
          </Link>

          {/* Card 2: Outerwear on hangers / Jacket Series */}
          <Link
            to="/products?category=jackets"
            className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F4F3EF] dark:bg-[#1C1C20] h-60 sm:h-72 border border-neutral-200/60 dark:border-neutral-800 shadow-soft-sm group cursor-pointer block transition-all duration-500 hover:shadow-soft-lg hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80"
              alt="Jacket Outfit Series"
              className="w-full h-full object-cover object-center group-hover:scale-108 group-hover:brightness-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                Jackets & Coats <ArrowUpRight size={13} />
              </span>
            </div>
          </Link>

          {/* Card 3: Models wearing full outfits card */}
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-4 h-60 sm:h-72 shadow-soft-sm">
            <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white max-w-[220px] leading-tight">
              Models wearing full outfits
            </h3>
            <Link
              to="/products?category=fashion"
              className="inline-flex items-center gap-1.5 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition shadow-soft-xs"
            >
              Explore now <ArrowUpRight size={13} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
