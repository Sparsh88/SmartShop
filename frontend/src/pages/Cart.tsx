import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import api from '../services/api';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Ticket, Check, X } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, totalAmount, payableAmount, updateQuantity, removeFromCart, clearCart, fetchCart } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

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
    } catch (err) {
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
      } catch (err) {
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

      discount = Math.min(discount, payableAmount); // Cap discount at price
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
      toast.error(err.response?.data?.message || 'Invalid or expired coupon');
    }
  };

  const checkoutPrice = payableAmount - couponDiscount;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed to checkout');
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Pass coupon info to checkout page via state
    navigate('/checkout', {
      state: {
        appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex p-5 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm">Add premium items from our store catalog to start shopping.</p>
        </div>
        <Link
          to="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full shadow-lg"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
      <h1 className="text-3xl font-black font-display text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm font-semibold">{items.length} items in cart</span>
            <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-300 font-bold">
              Clear All Items
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const imageSrc = fixProductImage(item.product.images?.[0], item.product.name);

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 justify-between shadow-sm"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        {item.product.brand}
                      </span>
                      <Link to={`/product/${item.productId}`} className="block hover:text-indigo-400 transition">
                        <h3 className="text-white font-bold text-sm line-clamp-1">{item.product.name}</h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm font-bold text-slate-200">{formatPrice(item.product.discountPrice)}</span>
                        {item.product.discount > 0 && (
                          <span className="text-[11px] text-slate-500 line-through">{formatPrice(item.product.price)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Adjustments & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0 border-slate-800/40">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-slate-800 rounded-full p-0.5 bg-slate-950">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total item price */}
                    <span className="text-sm font-bold text-slate-100 min-w-[70px] text-right">
                      {formatPrice(item.product.discountPrice * item.quantity)}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-slate-500 hover:text-red-500 transition"
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Calculations summary card */}
        <div className="space-y-6">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-display text-white">Order Summary</h3>

            {/* Calculations items list */}
            <div className="space-y-3.5 text-sm border-b border-slate-800/60 pb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal (Original)</span>
                <span className="text-slate-300 font-semibold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Store Catalog Discount</span>
                <span className="text-emerald-400 font-semibold">-{formatPrice(totalAmount - payableAmount)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center bg-indigo-950/20 border border-indigo-900/30 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-indigo-350 text-indigo-400 font-bold flex items-center gap-1">
                    <Ticket size={12} /> {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-indigo-350 text-indigo-300 font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="text-emerald-400 font-bold text-xs uppercase">FREE</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-slate-200 font-bold">Order Total</span>
              <span className="text-2xl font-black text-indigo-400">{formatPrice(checkoutPrice)}</span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-500/25 transition"
            >
              Proceed To Checkout <ArrowRight size={18} />
            </button>
          </div>

          {/* Coupon Entry widget */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Ticket size={16} className="text-indigo-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Apply Promo Coupon</h4>
            </div>

            {appliedCoupon ? (
              <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Check size={16} /> Applied <strong>{appliedCoupon.code}</strong>
                </div>
                <button onClick={removeCoupon} className="text-slate-500 hover:text-rose-500 transition">
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
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-grow uppercase"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-2 rounded-xl text-xs font-bold shrink-0"
                >
                  Apply
                </button>
              </form>
            )}

            {/* List of active deals */}
            {!appliedCoupon && (
              <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Available Coupons</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => applyDirectCoupon('WELCOME10')}
                    className="flex items-center justify-between text-left p-3 rounded-xl border border-dashed border-indigo-500/20 hover:border-indigo-500 bg-indigo-950/5 hover:bg-indigo-950/10 transition group"
                  >
                    <div>
                      <strong className="text-xs text-indigo-400 block font-black group-hover:text-indigo-300">WELCOME10</strong>
                      <span className="text-[10px] text-slate-400 block">10% off (Min. Order {formatPrice(3999)})</span>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded group-hover:bg-indigo-550 group-hover:text-white transition shrink-0">
                      Apply
                    </span>
                  </button>

                  <button
                    onClick={() => applyDirectCoupon('FLAT500')}
                    className="flex items-center justify-between text-left p-3 rounded-xl border border-dashed border-emerald-500/20 hover:border-emerald-500 bg-emerald-950/5 hover:bg-emerald-950/10 transition group"
                  >
                    <div>
                      <strong className="text-xs text-emerald-400 block font-black group-hover:text-emerald-300">FLAT500</strong>
                      <span className="text-[10px] text-slate-400 block">Flat {formatPrice(500)} off (Min. Order {formatPrice(9999)})</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded group-hover:bg-emerald-550 group-hover:text-white transition shrink-0">
                      Apply
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
