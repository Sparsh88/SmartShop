import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from '../store/toastStore';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import ImageZoom from '../components/ImageZoom';
import { Star, Heart, Plus, Minus, Send, ChevronRight as BreadcrumbArrow, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import RecommendationSection from '../components/RecommendationSection';
import { recommendationApi } from '../services/recommendationApi';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

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

  // Track product view for recommendation engine
  useEffect(() => {
    if (id) {
      recommendationApi.track(id, 'VIEW');
    }
  }, [id]);

  // Fetch product details
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
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review. Must purchase product first.');
    },
  });

  const product = data?.product;
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
        <p className="text-neutral-500 font-semibold">Product not found or has been removed.</p>
        <Link to="/products" className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const mainImageSrc = fixProductImage(product.images?.[activeImageIdx], product.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16 animate-page-enter">
      
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition">Home</Link>
        <BreadcrumbArrow size={12} />
        <Link to="/products" className="hover:text-neutral-900 dark:hover:text-white transition">Catalog</Link>
        <BreadcrumbArrow size={12} />
        <span className="text-neutral-900 dark:text-white truncate max-w-xs">{product.name}</span>
      </div>

      {/* Product Summary 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery & Zoom (6 cols) */}
        <ScrollReveal direction="left" distance={30} duration={0.6} className="lg:col-span-6 space-y-4">
          <div className="bg-[#F4F3EF] dark:bg-[#1E1E22] rounded-3xl p-4 sm:p-6 overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-soft-sm">
            <ImageZoom src={mainImageSrc} alt={product.name} />
          </div>
          
          {/* Thumbnails Row */}
          {(product.images?.length ?? 0) > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images?.map((img: string, idx: number) => {
                const thumbSrc = fixProductImage(img, product.name);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIdx === idx 
                        ? 'border-neutral-900 dark:border-white shadow-sm' 
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </ScrollReveal>

        {/* Right Column: Specs, Price, Stock, Actions (6 cols) */}
        <ScrollReveal direction="right" distance={30} duration={0.6} className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-block bg-[#F4F3EF] dark:bg-[#1E1E22] border border-neutral-300/80 dark:border-neutral-700 text-neutral-900 dark:text-white text-[11px] uppercase tracking-widest font-bold px-3.5 py-1 rounded-full">
              {product.brand || 'Stylehive Studio'}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                    className={i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'} ({product.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-5 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl flex items-center justify-between shadow-soft-sm">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Price</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-editorial text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {formatPrice(product.discount > 0 ? product.discountPrice : product.price)}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {product.discount > 0 && (
              <span className="bg-[#121212] text-white dark:bg-white dark:text-neutral-950 font-editorial text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="font-editorial font-bold text-xs uppercase tracking-widest text-neutral-400">
              Overview & Details
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {product.stock > 5
                ? 'In Stock & Ready to Ship'
                : product.stock > 0
                  ? `Only ${product.stock} items remaining!`
                  : 'Currently Out of Stock'}
            </span>
          </div>

          {/* Quantity selector & Actions */}
          {product.stock > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              
              {/* Stepper */}
              <div className="flex items-center border border-neutral-300/80 dark:border-neutral-700 rounded-full p-1 bg-white dark:bg-[#161618]">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-neutral-900 dark:text-white">{quantity}</span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart dark pill */}
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3.5 px-7 rounded-full shadow-soft-md transition-all active:scale-98 text-xs uppercase tracking-wider"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-full border transition-transform active:scale-90 ${
                  inWishlist
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-500 shadow-sm'
                    : 'bg-white dark:bg-[#161618] border-neutral-300/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Guarantee Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
              <Truck size={15} className="shrink-0 text-neutral-900 dark:text-white" />
              <span>Fast Express</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
              <ShieldCheck size={15} className="shrink-0 text-neutral-900 dark:text-white" />
              <span>100% Genuine</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
              <RotateCcw size={15} className="shrink-0 text-neutral-900 dark:text-white" />
              <span>30-Day Returns</span>
            </div>
          </div>

        </ScrollReveal>
      </div>

      {/* REVIEWS SECTION */}
      <section className="border-t border-neutral-200/80 dark:border-neutral-800 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Review Form (4 cols) */}
        <ScrollReveal direction="up" distance={25} duration={0.6} className="lg:col-span-4 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Feedback & Ratings
            </span>
            <h2 className="font-editorial text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Customer Reviews
            </h2>
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#161618] p-6 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl space-y-4 shadow-soft-sm">
              <h4 className="font-editorial font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                Share Your Thoughts
              </h4>
              
              {/* Rating selection */}
              <div>
                <span className="text-xs text-neutral-400 font-medium block mb-1.5">Rating</span>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      type="button"
                      key={stars}
                      onClick={() => setNewRating(stars)}
                      className="hover:scale-110 transition p-0.5"
                    >
                      <Star
                        size={20}
                        fill={stars <= newRating ? 'currentColor' : 'none'}
                        className={stars <= newRating ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <span className="text-xs text-neutral-400 font-medium block mb-1.5">Review</span>
                <textarea
                  required
                  rows={3}
                  placeholder="How did this item fit or perform?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-2.5 rounded-full text-xs uppercase tracking-wider transition"
              >
                Submit Review <Send size={13} />
              </button>
            </form>
          ) : (
            <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl text-center space-y-2 shadow-soft-sm">
              <p className="text-neutral-500 text-xs">Have you ordered this item?</p>
              <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white underline underline-offset-2 block">
                Sign in to leave a review
              </Link>
            </div>
          )}
        </ScrollReveal>

        {/* Right Column: List of reviews (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {(!product.reviews || product.reviews.length === 0) ? (
            <ScrollReveal direction="up" distance={20}>
              <div className="text-center py-14 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-soft-sm space-y-1">
                <p className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">No reviews yet</p>
                <p className="text-xs text-neutral-400">Be the first to share your experience with this piece.</p>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollRevealGroup staggerDelay={0.08} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {product.reviews.map((rev: any) => (
                <ScrollRevealItem key={rev.id} direction="up" distance={20}>
                  <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl space-y-2 shadow-soft-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">{rev.user?.name || 'Verified Customer'}</span>
                      <span className="text-[11px] text-neutral-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}
                        />
                      ))}
                    </div>

                    <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                </ScrollRevealItem>
              ))}
            </ScrollRevealGroup>
          )}
        </div>

      </section>

      {/* AI-POWERED RELATED RECOMMENDATIONS */}
      {id && (
        <div className="border-t border-neutral-200/80 dark:border-neutral-800 pt-12">
          <RecommendationSection
            title="Because You Viewed This"
            subtitle="Intelligent suggestions curated based on style and category"
            type="related"
            productId={id}
            limit={4}
          />
        </div>
      )}

    </div>
  );
}
