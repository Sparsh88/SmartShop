import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ProductDetailsSkeleton } from '../components/LoaderSkeletons';
import { Heart, ShoppingBag, Star, ShieldAlert, Award, RefreshCw, Send, Check } from 'lucide-react';

const ProductDetails = ({ onToast }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected image index
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Add Review form
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setActiveImageIdx(0);
      setQuantity(1);

      // Fetch reviews
      const revRes = await api.get(`/products/${id}/reviews`);
      setReviews(revRes.data);

      // Fetch related products (same category)
      const relRes = await api.get('/products', {
        params: { category: data.category, limit: 4 }
      });
      setRelated(relRes.data.products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to load product details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product?.images[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    onToast(`${quantity}x ${product.name} added to Cart! 🛒`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revTitle.trim() || !revComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: revRating,
        title: revTitle,
        comment: revComment
      });
      onToast('Review submitted successfully! ⭐');
      setRevTitle('');
      setRevComment('');
      // Reload product details to show new review & update ratings
      fetchDetails();
    } catch (error) {
      console.error('Review submit failed:', error.message);
      onToast(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Product not found!</h2>
        <Link to="/shop" className="text-primary-500 underline mt-4 block">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const starsTotal = reviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. Main Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Side: Images & Zoom Panel */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity"
            />
            {/* Magnifying Loupe Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none border border-gray-100 hidden group-hover:block" 
              style={zoomStyle}
            />
          </div>

          {/* Thumbnail Pickers */}
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 transition-all ${
                    activeImageIdx === idx ? 'border-primary-500 scale-105' : 'border-transparent opacity-75'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specs & Buying parameters */}
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
            <span>{product.brand} • {product.category}</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-900 dark:text-white font-extrabold text-sm">{product.rating.toFixed(1)}</span>
              <span>({starsTotal} reviews)</span>
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl w-fit">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-black px-2.5 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specifications Grid */}
          {product.specs?.length > 0 && (
            <div className="border border-gray-100 dark:border-slate-800/60 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Specifications
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-slate-800">
                {product.specs.map((spec, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-3.5 text-xs flex justify-between">
                    <span className="text-gray-400 font-medium">{spec.name}</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart quantity parameters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {product.stock > 0 ? (
              <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-full w-fit">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-l-full font-bold text-lg"
                >
                  -
                </button>
                <span className="px-4 font-bold text-sm w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-r-full font-bold text-lg"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/50 rounded-2xl px-5 py-3 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Out of Stock
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <ShoppingBag className="h-5 w-5" /> Add to Cart
              </button>
              
              <button
                onClick={() => {
                  toggleWishlist(product);
                  onToast(isWishlisted ? 'Removed from Wishlist 💔' : 'Added to Wishlist! ❤️');
                }}
                className={`p-3.5 border rounded-full transition-all ${
                  isWishlisted 
                    ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-950/20 dark:border-red-900' 
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Assurances tags */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-slate-850 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex flex-col items-center gap-1.5">
              <Award className="h-5 w-5 text-primary-500" />
              <span>100% Original</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RefreshCw className="h-5 w-5 text-primary-500" />
              <span>7 Day Return</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Check className="h-5 w-5 text-primary-500" />
              <span>Free Delivery</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-gray-100 dark:border-slate-850">
        
        {/* Rating metrics */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-black">Customer Reviews</h3>
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl">
            <h4 className="text-5xl font-black text-gray-900 dark:text-white">{product.rating.toFixed(1)}</h4>
            <div className="space-y-1">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4.5 w-4.5 ${
                      i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium">Based on {starsTotal} reviews</p>
            </div>
          </div>

          {/* Progress distributions */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(num => {
              const count = product.ratingDistribution?.[num] || 0;
              const percent = starsTotal > 0 ? (count / starsTotal) * 100 : 0;
              return (
                <div key={num} className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-semibold w-3">{num}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full rounded-full" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-semibold w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Form to submit review */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <h4 className="font-bold text-sm">Write a Product Review</h4>
              
              {/* Star pickers */}
              <div className="flex gap-1.5 items-center">
                <span className="text-xs text-gray-400 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRevRating(num)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-5 w-5 transition-colors ${
                        num <= revRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Review Title (e.g. Awesome quality)"
                value={revTitle}
                onChange={(e) => setRevTitle(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              />

              {/* Description */}
              <textarea
                placeholder="Describe your user experience in detail..."
                rows="3"
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
                <Send className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 text-center text-xs text-gray-400">
              Please <Link to="/login" className="text-primary-500 underline font-bold">sign in</Link> to write a customer review.
            </div>
          )}

        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black">Reviews Listing ({reviews.length})</h3>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {reviews.length > 0 ? (
              reviews.map(rev => (
                <div key={rev._id} className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-gray-900 dark:text-white">{rev.userName}</span>
                    <span className="text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array(rev.rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{rev.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No reviews yet for this product. Be the first to leave one!</p>
            )}
          </div>
        </div>

      </section>

      {/* 3. Related Products Section */}
      {related.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-gray-100 dark:border-slate-850">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Recommended Alternatives</h3>
            <p className="text-xs text-gray-400 mt-1">Explore similar items currently available in our catalog</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(prod => (
              <ProductCard key={prod._id} product={prod} onToast={onToast} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
