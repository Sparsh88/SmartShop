import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, ShoppingBag, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from '../store/toastStore';
import { fixProductImage, getDefaultFallbackImage } from '../utils/imageHelper';
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
    e.preventDefault();
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

  const imageUrl = fixProductImage(product.images?.[0], product.name);

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 transition-all duration-300 hover:shadow-soft-md hover:border-neutral-300 dark:hover:border-neutral-700 hover-translate-up">
      
      {/* Product Image Frame */}
      <div className="relative w-full aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F4F3EF] dark:bg-[#1F1F24] flex items-center justify-center">
        
        {/* Wishlist Button Overlay */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-200 active:scale-90 ${
            isLiked
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 shadow-sm'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm'
          }`}
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#121212] text-white dark:bg-white dark:text-neutral-950 font-editorial font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="w-full h-full block">
          <img
            src={imageUrl}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getDefaultFallbackImage(product.name);
            }}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Block */}
      <div className="pt-3 pb-1 px-1 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Category Tag */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold truncate">
              {product.brand || 'Stylehive'}
            </span>

            {/* Rating Stars & Value */}
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block group-hover:underline underline-offset-2">
            <h3 className="text-neutral-900 dark:text-neutral-100 font-semibold text-sm leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {formatPrice(product.discount > 0 ? product.discountPrice : product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
              product.stock <= 0
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-[#121212] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 shadow-soft-sm'
            }`}
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
