import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    discountPrice: number;
    stock: number;
    rating?: number;
    brand: string;
    images: string[];
    isFeatured?: boolean;
    isTrending?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { products: wishlistItems, toggleWishlist } = useWishlistStore();

  const isLiked = wishlistItems.some((p) => p.id === product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents clicking the card links underneath
    if (product.stock <= 0) {
      toast.error('This product is currently out of stock');
      return;
    }
    try {
      await addToCart(product.id, 1, isAuthenticated);
      toast.success(`Added ${product.name} to cart!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await toggleWishlist(product, isAuthenticated);
      if (!isLiked) {
        toast.success(`Saved ${product.name} to wishlist!`);
      } else {
        toast.info(`Removed ${product.name} from wishlist.`);
      }
    } catch (err: any) {
      toast.error('Error toggling wishlist');
    }
  };

  // Construct absolute static upload path fallback if path starts with /uploads
  const imageUrl = fixProductImage(product.images?.[0], product.name);

  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:border-slate-700 flex flex-col h-full hover-translate-up spring-active">
      {/* Wishlist Icon Overlay */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
          isLiked
            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
            : 'bg-slate-900/60 text-slate-300 hover:text-rose-500 border border-slate-800/40 hover:bg-slate-950/80'
        }`}
      >
        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
      </button>

      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-indigo-600 text-white font-display font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider pulse-primary">
          {product.discount}% OFF
        </span>
      )}

      {/* Image Block */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden h-56 relative bg-slate-950">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
            <span className="text-rose-400 font-display font-bold uppercase tracking-wider text-xs border border-rose-800/40 px-3 py-1 rounded">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info Block */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand */}
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
            {product.brand}
          </span>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-slate-100 font-semibold group-hover:text-indigo-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                  className={i < Math.floor(product.rating || 0) ? 'text-amber-500' : 'text-slate-700'}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-bold">({product.rating || '0.0'})</span>
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/40">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-bold text-slate-100 transition-colors duration-300">{formatPrice(product.discountPrice)}</span>
                <span className="text-xs text-slate-500 line-through transition-colors duration-300">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-100 transition-colors duration-300">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              product.stock <= 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 shadow-md hover:shadow-indigo-500/20'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
