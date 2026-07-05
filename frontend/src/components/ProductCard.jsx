import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, onToast }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    if (onToast) {
      onToast(`${product.name} added to Cart! 🛒`);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (onToast) {
      onToast(inWishlist ? 'Removed from Wishlist 💔' : 'Added to Wishlist! ❤️');
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Product Image Panel */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-900">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md shadow-red-500/20">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 p-2.5 rounded-full shadow-md backdrop-blur-md transition-colors z-10"
          aria-label="Add to wishlist"
        >
          <Heart 
            className={`h-4.5 w-4.5 transition-colors ${
              inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`} 
          />
        </button>
      </Link>

      {/* Product Info Description */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
          <span>{product.category}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">{product.rating.toFixed(1)}</span>
          </span>
        </div>

        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
          {product.brand} • {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
        </p>

        {/* Price & Cart row */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${
              product.stock > 0
                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/20 hover:shadow-primary-600/30 hover:scale-105'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
