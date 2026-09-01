import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import api from '../services/api';
import { Trash2, Plus, Minus, ArrowUpRight, ShoppingBag, Ticket, Check, X } from 'lucide-react';
import RecommendationSection from '../components/RecommendationSection';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, totalAmount, payableAmount, updateQuantity, removeFromCart, clearCart, fetchCart } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  // Fetch all active promotional coupons from backend
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        setIsLoadingCoupons(true);
        const res = await api.get('/coupons');
        if (res.data?.success && Array.isArray(res.data?.coupons)) {
          setAvailableCoupons(res.data.coupons.filter((c: any) => c.isActive));
        }
      } catch (err) {
        console.error('Error fetching available coupons:', err);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchAvailableCoupons();
  }, []);

  // Reactive discount recalculation / minimum cart threshold enforcement
  useEffect(() => {
    if (appliedCoupon) {
      const minThreshold = appliedCoupon.minCartValue || 0;
      if (minThreshold > 0 && payableAmount < minThreshold) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        toast.info(`Coupon ${appliedCoupon.code} removed: Cart amount (₹${payableAmount}) fell below minimum required (₹${minThreshold})`);
      } else {
        let discount = 0;
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          discount = (payableAmount * appliedCoupon.discountValue) / 100;
        } else {
          discount = appliedCoupon.discountValue;
        }
        discount = Math.min(discount, payableAmount);
        setCouponDiscount(parseFloat(discount.toFixed(2)));
      }
    }
  }, [payableAmount, appliedCoupon]);

  const handleQtyChange = async (productId: string, newQty: number) => {
    try {
      await updateQuantity(productId, newQty, isAuthenticated);
    } catch (err: any) {
      toast.error(err.message || 'Error updating item quantity');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId, isAuthenticated);
      toast.success('Product removed from cart');
    } catch (err: any) {
      toast.error('Error removing item');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart(isAuthenticated);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        toast.success('Shopping cart cleared');
      } catch (err: any) {
        toast.error('Error clearing cart');
      }
    }
  };

  // Coupon application logic
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        cartAmount: payableAmount,
      });

      const coupon = res.data.coupon;
      setAppliedCoupon(coupon);

      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (payableAmount * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, payableAmount);
      setCouponDiscount(parseFloat(discount.toFixed(2)));
      toast.success(`Coupon ${coupon.code} applied successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const applyDirectCoupon = async (code: string) => {
    try {
      const res = await api.post('/coupons/validate', {
        code: code,
        cartAmount: payableAmount,
      });

      const coupon = res.data.coupon;
      setAppliedCoupon(coupon);

      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (payableAmount * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, payableAmount);
      setCouponDiscount(parseFloat(discount.toFixed(2)));
      setCouponCode(code);
      toast.success(`Coupon ${coupon.code} applied successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with checkout');
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout', {
      state: {
        appliedCoupon,
        couponDiscount,
      },
    });
  };

  const checkoutPrice = Math.max(0, payableAmount - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 animate-page-enter">
        <ScrollReveal direction="up" distance={25}>
          <div className="w-20 h-20 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={36} />
          </div>
          <div className="space-y-2 mb-6">
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">Your Shopping Bag is Empty</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">Explore our curated collections and discover your next statement look.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-soft-sm transition"
          >
            Start Exploring <ArrowUpRight size={15} />
          </Link>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-page-enter space-y-12">
      
      {/* Header */}
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-200/80 dark:border-neutral-800 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Review Selection
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Shopping Bag
            </h1>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
          </span>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Cart items list (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Products</span>
            <button onClick={handleClear} className="text-xs text-neutral-400 hover:text-rose-500 font-bold underline underline-offset-2 transition">
              Clear All
            </button>
          </div>

          <ScrollRevealGroup staggerDelay={0.06} className="space-y-4">
            {items.map((item) => {
              const imageSrc = fixProductImage(item.product.images?.[0], item.product.name);

              return (
                <ScrollRevealItem key={item.id} direction="up" distance={20}>
                  <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-4 sm:gap-5 justify-between shadow-soft-sm">
                    
                    {/* Thumbnail & Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-24 rounded-2xl overflow-hidden bg-[#F4F3EF] dark:bg-[#1E1E22] shrink-0">
                        <img
                          src={imageSrc}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                          {item.product.brand || 'Stylehive'}
                        </span>
                        <Link to={`/product/${item.productId}`} className="block hover:underline underline-offset-2">
                          <h3 className="text-neutral-900 dark:text-white font-bold text-sm line-clamp-1">{item.product.name}</h3>
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                            {formatPrice(item.product.discount > 0 ? item.product.discountPrice : item.product.price)}
                          </span>
                          {item.product.discount > 0 && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Adjustments & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                      
                      {/* Stepper */}
                      <div className="flex items-center border border-neutral-300/80 dark:border-neutral-700 rounded-full p-1 bg-[#F4F3EF] dark:bg-[#1F1F24]">
                        <button
                          onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-neutral-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total item price */}
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white min-w-[70px] text-right">
                        {formatPrice((item.product.discount > 0 ? item.product.discountPrice : item.product.price) * item.quantity)}
                      </span>

                      {/* Delete button */}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-neutral-400 hover:text-rose-500 transition p-1"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealGroup>
        </div>

        {/* Right Column: Order Summary & Coupons (5 cols) */}
        <ScrollReveal direction="right" distance={30} duration={0.7} className="lg:col-span-5 space-y-6">
          
          {/* Order Summary Card */}
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-6 shadow-soft-sm">
            <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm border-b border-neutral-100 dark:border-neutral-800 pb-5">
              <div className="flex justify-between text-neutral-500">
                <span>Original Subtotal</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formatPrice(totalAmount)}</span>
              </div>

              <div className="flex justify-between text-neutral-500">
                <span>Catalog Discounts</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatPrice(totalAmount - payableAmount)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center bg-[#F4F3EF] dark:bg-[#1E1E22] px-3 py-2 rounded-xl text-xs">
                  <span className="text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1.5">
                    <Ticket size={14} /> {appliedCoupon.code}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500">
                <span>Express Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">FREE</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-editorial text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Estimated Total</span>
              <span className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">{formatPrice(checkoutPrice)}</span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full btn-pill-arrow group justify-between px-6 py-4 shadow-soft-md"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Proceed To Checkout</span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>
          </div>

          {/* Coupon Entry widget */}
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl space-y-4 shadow-soft-sm">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-neutral-900 dark:text-white" />
              <h4 className="font-editorial font-bold text-xs uppercase tracking-widest text-neutral-900 dark:text-white">
                Promotional Voucher
              </h4>
            </div>

            {appliedCoupon ? (
              <div className="flex justify-between items-center bg-[#F4F3EF] dark:bg-[#1E1E22] p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Check size={16} /> Voucher Applied: <strong>{appliedCoupon.code}</strong>
                </div>
                <button onClick={removeCoupon} className="text-neutral-400 hover:text-rose-500 transition p-1">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-full px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white flex-grow uppercase tracking-wider font-semibold"
                />
                <button
                  type="submit"
                  className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition shrink-0"
                >
                  Apply
                </button>
              </form>
            )}

            {/* List of active promotional offers */}
            {!appliedCoupon && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Available Offers</span>
                {isLoadingCoupons ? (
                  <div className="text-xs text-neutral-400 py-2">Loading offers...</div>
                ) : availableCoupons.length === 0 ? (
                  <div className="text-xs text-neutral-400 py-1 italic">No active coupons available right now.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {availableCoupons.map((coupon) => {
                      const minVal = coupon.minCartValue || 0;
                      const isEligible = minVal === 0 || payableAmount >= minVal;

                      return (
                        <div
                          key={coupon.id || coupon.code}
                          className={`flex items-center justify-between text-left p-3 rounded-2xl border transition group ${
                            isEligible
                              ? 'border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white bg-[#F4F3EF] dark:bg-[#1E1E22]'
                              : 'border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161618] opacity-75'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                              <strong className="text-xs text-neutral-900 dark:text-white font-bold tracking-wider">{coupon.code}</strong>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {coupon.discountType === 'PERCENTAGE'
                                  ? `${coupon.discountValue}% OFF`
                                  : `FLAT ${formatPrice(coupon.discountValue)} OFF`}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-500 block">
                              {minVal > 0
                                ? `Valid on orders above ${formatPrice(minVal)}`
                                : 'No minimum order required'}
                            </span>
                            {!isEligible && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                                Add {formatPrice(minVal - payableAmount)} more to unlock
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => applyDirectCoupon(coupon.code)}
                            disabled={!isEligible}
                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm transition shrink-0 ${
                              isEligible
                                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                            }`}
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </ScrollReveal>
      </div>

      {/* COMPLEMENTARY RECOMMENDATIONS */}
      <div className="pt-12 border-t border-neutral-200/80 dark:border-neutral-800">
        <RecommendationSection
          title="Complete Your Purchase"
          subtitle="Frequently paired pieces and accessories tailored to your bag"
          type="cart"
          limit={4}
          showViewAll={false}
        />
      </div>
    </div>
  );
}

