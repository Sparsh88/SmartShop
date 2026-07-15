import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from '../store/toastStore';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import ImageZoom from '../components/ImageZoom';
import ProductCard from '../components/ProductCard';
import { Star, ShoppingCart, Heart, Plus, Minus, Send } from 'lucide-react';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { products: wishlistItems, toggleWishlist } = useWishlistStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Fetch product details & related products
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Mutation to post review
  const reviewMutation = useMutation({
    mutationFn: async (payload: { rating: number; comment: string; productId: string }) => {
      const res = await api.post('/reviews', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Thank you for your review!');
      setNewComment('');
      setNewRating(5);
      // Invalidate cache to force reload product and reviews
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review. Must purchase product first.');
    },
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];
  const inWishlist = wishlistItems.some((p) => p.id === product?.id);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity, isAuthenticated);
      toast.success(`Added ${quantity} x ${product.name} to cart!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product, isAuthenticated);
      if (!inWishlist) {
        toast.success(`Saved ${product.name} to wishlist!`);
      } else {
        toast.info(`Removed ${product.name} from wishlist.`);
      }
    } catch (err) {
      toast.error('Error toggling wishlist');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (newComment.trim().length < 3) {
      toast.error('Review comment must be at least 3 characters');
      return;
    }
    reviewMutation.mutate({
      productId: id,
      rating: newRating,
      comment: newComment,
    });
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-400">Product not found or has been deleted.</p>
        <Link to="/products" className="bg-indigo-650 bg-indigo-600 px-6 py-2 rounded-full font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Handle local absolute path formatting
  const mainImageSrc = fixProductImage(product.images?.[activeImageIdx], product.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-page-enter">
      
      {/* Product Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left column: Image Slider and Zoom */}
        <div className="space-y-4">
          <ImageZoom src={mainImageSrc} alt={product.name} />
          
          {/* Thumbnails */}
          {(product.images?.length ?? 0) > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images?.map((img: string, idx: number) => {
                const thumbSrc = fixProductImage(img, product.name);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      activeImageIdx === idx ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Specs and Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-md">
              {product.brand}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-3 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    className={i < Math.floor(product.rating) ? 'text-amber-500' : 'text-slate-700'}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400 font-semibold">
                {product.rating} ({product.reviews?.length || 0} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing block */}
          <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Price</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-3xl font-black text-white">{formatPrice(product.discountPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-sm text-slate-500 line-through font-semibold">{formatPrice(product.price)}</span>
                )}
              </div>
            </div>

            {product.discount > 0 && (
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg">
                SAVE {product.discount}%
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Product details</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="text-xs text-slate-400 font-bold">
              {product.stock > 5
                ? 'In Stock'
                : product.stock > 0
                  ? `Only ${product.stock} items remaining!`
                  : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity selector & Actions */}
          {product.stock > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center border border-slate-800 rounded-full p-1 bg-slate-950">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-full border transition ${
                  inWishlist
                    ? 'bg-rose-500/10 border-rose-500/35 text-rose-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
                title="Add to Wishlist"
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="border-t border-slate-850 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left sidebar: Stats & Add Review */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black font-display text-white">Customer Reviews</h2>
            <p className="text-slate-400 text-sm mt-1">Real reviews from confirmed purchases.</p>
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="glass-card p-5 border border-slate-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm text-slate-200">Share Your Experience</h4>
              
              {/* Rating selection */}
              <div>
                <span className="text-xs text-slate-500 block mb-1">Select Rating</span>
                <div className="flex gap-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      type="button"
                      key={stars}
                      onClick={() => setNewRating(stars)}
                      className="hover:scale-110 transition"
                    >
                      <Star
                        size={20}
                        fill={stars <= newRating ? 'currentColor' : 'none'}
                        className={stars <= newRating ? 'text-amber-500' : 'text-slate-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <span className="text-xs text-slate-500 block mb-1.5">Comment</span>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your review comments here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
              >
                Submit Review <Send size={14} />
              </button>
            </form>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">You must purchase this product to write reviews.</p>
              <Link to="/login" className="text-indigo-400 hover:underline font-bold text-xs mt-2 block">
                Sign in to your account
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar: List of reviews */}
        <div className="lg:col-span-2 space-y-4">
          {product.reviews?.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 text-sm">No reviews yet. Be the first to buy and review!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">{rev.user?.name}</span>
                    <span className="text-xs text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                        className={i < rev.rating ? 'text-amber-500' : 'text-slate-800'}
                      />
                    ))}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-850 pt-10">
          <h2 className="text-2xl font-black font-display text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
