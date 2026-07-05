import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = ({ onToast }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    onToast(`${product.name} moved to Cart! 🛒`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">My Wishlist</h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map(prod => (
            <div 
              key={prod._id || prod} 
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col hover:shadow-lg transition-all"
            >
              <Link to={`/product/${prod._id}`} className="aspect-square block bg-gray-50 overflow-hidden relative">
                <img 
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} 
                  alt={prod.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => {
                    removeFromWishlist(prod._id);
                    onToast('Removed from Wishlist 💔');
                  }}
                  className="absolute top-2 right-2 bg-white/80 dark:bg-slate-850/80 p-2 rounded-full shadow-sm"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </Link>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${prod._id}`} className="font-extrabold text-xs text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-1">
                    {prod.name}
                  </Link>
                  <p className="text-[10px] text-gray-400">{prod.brand} • {prod.category}</p>
                  <p className="font-black text-sm text-gray-900 dark:text-white mt-1">₹{prod.price?.toLocaleString()}</p>
                </div>

                <button
                  onClick={() => handleMoveToCart(prod)}
                  disabled={prod.stock === 0}
                  className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Move to Cart
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-850/30 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
          <Heart className="h-12 w-12 text-gray-300 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold">Your wishlist is empty</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">Explore catalog items and heart products to save them in your wishlist.</p>
          <Link
            to="/shop"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm text-xs inline-block pt-2 hover:scale-105 transition-transform"
          >
            Explore Catalog
          </Link>
        </div>
      )}

    </div>
  );
};

export default Wishlist;
