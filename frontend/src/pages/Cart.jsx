import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Bookmark, ShoppingCart, ArrowRight, Percent, Check, X } from 'lucide-react';

const Cart = ({ onToast }) => {
  const {
    cartItems,
    savedLaterItems,
    coupon,
    couponError,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedLater,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    discountAmount,
    finalTotal
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setApplying(true);
    try {
      await applyCoupon(promoCode.trim());
      onToast('Promo Code applied successfully! 🎉');
      setPromoCode('');
    } catch (err) {
      onToast(err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleProceed = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Items Listing Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6 divide-y divide-gray-100 dark:divide-slate-750">
              {cartItems.map(item => (
                <div key={item.product} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-xl bg-gray-50 border border-gray-100 dark:border-slate-750 flex-shrink-0" 
                    />
                    <div>
                      <Link to={`/product/${item.product}`} className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">Price: ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-none pt-4 sm:pt-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-full">
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-750 rounded-l-full"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-750 rounded-r-full disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      
                      {/* Secondary action tools */}
                      <div className="flex gap-3 mt-1.5 justify-end">
                        <button
                          onClick={() => {
                            saveForLater(item.product);
                            onToast('Saved for Later!');
                          }}
                          className="text-gray-400 hover:text-primary-500 transition-colors"
                          title="Save for Later"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            removeFromCart(item.product);
                            onToast('Item removed from cart');
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Coupons Sidebar Right */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Promo Codes */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary-500" /> Apply Coupon Code
              </h3>
              
              {coupon ? (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 p-3.5 rounded-xl flex justify-between items-center text-xs text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Coupon <span className="font-black">{coupon.code}</span> applied</span>
                  </div>
                  <button onClick={removeCoupon} className="hover:text-red-500">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SMART10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-55"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-xs text-red-500 font-semibold">{couponError}</p>
              )}
            </div>

            {/* Total summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4 text-xs font-semibold">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-700">
                Order Summary
              </h3>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Estimated Shipping</span>
                <span className="text-green-500 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-slate-700">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 text-sm pt-3 hover:scale-102 active:scale-98 transition-all duration-200"
              >
                Proceed to Checkout <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto" />
          <h2 className="text-lg font-bold">Your shopping cart is empty</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">Browse our collection of premium electronics, footwear, and furniture.</p>
          <Link
            to="/shop"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm text-xs inline-block pt-2 hover:scale-105 transition-transform"
          >
            Explore Catalog
          </Link>
        </div>
      )}

      {/* 3. Saved for Later Section */}
      {savedLaterItems.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-gray-150 dark:border-slate-850">
          <div>
            <h3 className="text-xl font-black">Saved for Later</h3>
            <p className="text-xs text-gray-400 mt-1">Items you bookmarked for later consideration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {savedLaterItems.map(item => (
              <div 
                key={item.product}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-xl bg-gray-50" />
                  <Link to={`/product/${item.product}`} className="font-extrabold text-xs text-gray-900 dark:text-white line-clamp-2 hover:text-primary-500 transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-xs font-black text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
                </div>
                
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-750">
                  <button
                    onClick={() => {
                      moveToCart(item.product);
                      onToast('Moved back to Cart');
                    }}
                    className="flex-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-500 text-[10px] font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" /> Move to Cart
                  </button>
                  <button
                    onClick={() => {
                      removeSavedLater(item.product);
                      onToast('Saved item deleted');
                    }}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Cart;
