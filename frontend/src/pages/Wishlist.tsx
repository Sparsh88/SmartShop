import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowUpRight } from 'lucide-react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function Wishlist() {
  const { isAuthenticated } = useAuthStore();
  const { products, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist(isAuthenticated);
  }, [isAuthenticated, fetchWishlist]);

  if (products.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 animate-page-enter">
        <ScrollReveal direction="up" distance={25}>
          <div className="w-20 h-20 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <Heart size={36} />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">Your Wishlist is Empty</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">Save your favorite pieces and styles to revisit them anytime.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-soft-sm transition"
          >
            Explore Catalog <ArrowUpRight size={15} />
          </Link>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-page-enter">
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
            Personal Curation
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Saved Wishlist
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1">
            {products.length} {products.length === 1 ? 'saved piece' : 'saved pieces'} in your collection
          </p>
        </div>
      </ScrollReveal>

      <ScrollRevealGroup staggerDelay={0.06} delayChildren={0.02} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <ScrollRevealItem key={product.id} direction="up" distance={25}>
            <ProductCard product={product} />
          </ScrollRevealItem>
        ))}
      </ScrollRevealGroup>
    </div>
  );
}
