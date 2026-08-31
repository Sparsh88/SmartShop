import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function Wishlist() {
  const { isAuthenticated } = useAuthStore();
  const { products, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist(isAuthenticated);
  }, [isAuthenticated, fetchWishlist]);

  if (products.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-page-enter">
        <ScrollReveal direction="up" distance={30}>
          <div className="inline-flex p-5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4">
            <Heart size={48} />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold font-display text-white">Your Wishlist is Empty</h2>
            <p className="text-slate-400 text-sm">Save items you like to view them here later.</p>
          </div>
          <Link
            to="/products"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full shadow-lg"
          >
            Discover Products
          </Link>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-page-enter">
      <ScrollReveal direction="up" distance={25} duration={0.6}>
        <div>
          <h1 className="text-3xl font-black font-display text-white">Saved Wishlist</h1>
          <p className="text-slate-400 text-sm mt-1">You have liked {products.length} products</p>
        </div>
      </ScrollReveal>

      <ScrollRevealGroup staggerDelay={0.08} delayChildren={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ScrollRevealItem key={product.id} direction="up" distance={30}>
            <ProductCard product={product} />
          </ScrollRevealItem>
        ))}
      </ScrollRevealGroup>
    </div>
  );
}
