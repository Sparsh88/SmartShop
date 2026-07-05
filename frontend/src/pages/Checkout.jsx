import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { CreditCard, Truck, AlertCircle, ShoppingBag, ShieldCheck, MapPin, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const Checkout = ({ onToast }) => {
  const { user } = useAuth();
  const { cartItems, cartSubtotal, discountAmount, finalTotal, coupon, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirect if logged out or cart empty
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  // Selected Address index
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or razorpay
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // New Address form toggler
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Simulated Payment Modal state (if Razorpay key is mock)
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedOrderId, setSimulatedOrderId] = useState('');

  // Handle adding a new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) return;

    try {
      const newAddress = { street, city, state, zipCode, country: 'India', isDefault: false };
      const updatedAddresses = [...(user.addresses || []), newAddress];
      
      // Update profile on server
      await api.put('/auth/profile', { addresses: updatedAddresses });
      
      // Refresh user details (since context updates it on successful save)
      user.addresses = updatedAddresses; 
      
      onToast('New address added! 📍');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowNewAddressForm(false);
      setSelectedAddressIdx(updatedAddresses.length - 1);
    } catch (error) {
      console.error(error);
      onToast('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      return onToast('Please select or add a shipping address');
    }

    const shippingAddress = user.addresses[selectedAddressIdx];
    setCheckoutLoading(true);

    try {
      if (paymentMethod === 'cod') {
        // Place Cash on Delivery order
        await api.post('/orders/cod', {
          items: cartItems,
          shippingAddress,
          totalAmount: finalTotal,
          discountAmount,
          couponUsed: coupon?.code
        });
        
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onToast('Order placed successfully (COD)! 📦');
        clearCart();
        navigate('/orders');
      } else {
        // Online Payment - Initialize Razorpay Order creation on backend
        const { data } = await api.post('/orders/razorpay', {
          amount: finalTotal,
          couponCode: coupon?.code
        });

        // Check if Razorpay returned mock status or if SDK is not loaded
        if (data.isMock || typeof window.Razorpay === 'undefined') {
          setSimulatedOrderId(data.id);
          setShowSimulatedModal(true);
          setCheckoutLoading(false);
          return;
        }

        // Configure standard Razorpay SDK options (if keys exist on backend)
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'SmartShop AI',
          description: 'E-commerce Purchase Checkout',
          order_id: data.id,
          handler: async (response) => {
            try {
              setCheckoutLoading(true);
              // Submit verification to backend
              await api.post('/orders/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items: cartItems,
                shippingAddress,
                totalAmount: finalTotal,
                discountAmount,
                couponUsed: coupon?.code,
                isMockOrder: false
              });

              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
              onToast('Payment Verified! Order placed successfully. 🎉');
              clearCart();
              navigate('/orders');
            } catch (err) {
              onToast(err.response?.data?.message || 'Payment verification failed');
            } finally {
              setCheckoutLoading(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#8b5cf6'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error('Order creation failed:', error.message);
      onToast(error.response?.data?.message || 'Failed to place order');
      setCheckoutLoading(false);
    }
  };

  // Simulate success payment modal check (for mock key flow)
  const handleSimulatePaymentSuccess = async () => {
    setShowSimulatedModal(false);
    setCheckoutLoading(true);
    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 15)}`;
      const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 15)}`;

      await api.post('/orders/verify', {
        razorpayOrderId: simulatedOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        items: cartItems,
        shippingAddress: user.addresses[selectedAddressIdx],
        totalAmount: finalTotal,
        discountAmount,
        couponUsed: coupon?.code,
        isMockOrder: true // bypass signature checks on backend
      });

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onToast('Simulated Payment Verified! Order created successfully. 🎉');
      clearCart();
      navigate('/orders');
    } catch (err) {
      onToast('Simulated verification failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Address & Payment Methods */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Addresses panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" /> Shipping Addresses
            </h3>

            {user.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIdx(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressIdx === idx
                        ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10'
                        : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
                    }`}
                  >
                    <p className="font-bold text-xs capitalize text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl text-xs text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5" /> No address found. Please add a shipping address below.
              </div>
            )}

            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors pt-2 block"
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border border-gray-100 dark:border-slate-700 p-4 rounded-2xl space-y-3.5 bg-gray-50/50 dark:bg-slate-900/20 animate-fade-in">
                <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300">Add Address Form</h4>
                <input
                  type="text"
                  placeholder="Street / Locality"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="text-xs font-semibold px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment method selector */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-500" /> Payment Methods
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10 font-bold'
                  : 'border-gray-100 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-900 dark:text-white">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 font-medium">Pay with cash upon package receipt</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-primary-500 focus:ring-primary-500"
                />
              </label>

              <label className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10 font-bold'
                  : 'border-gray-100 dark:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-900 dark:text-white">Credit / Debit Card / UPI</p>
                    <p className="text-[10px] text-gray-400 font-medium">Secure instant checkout via Razorpay</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="text-primary-500 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Right Side: Order summary reviews */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5" /> Order Summary
            </h3>

            {/* List items mini preview */}
            <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.product} className="flex justify-between items-center gap-4">
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                    <span className="truncate text-gray-500 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {item.quantity}x
                  </span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 pt-3.5 space-y-2">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-2.5 border-t border-gray-100 dark:border-slate-700">
                <span>Total Due</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 text-sm pt-3 transition-transform"
            >
              {checkoutLoading ? 'Processing...' : 'Place Order'}
            </button>

            <div className="flex justify-center items-center gap-1.5 text-[10px] text-gray-400 text-center pt-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>SSL Secure 256-bit Payment Verification</span>
            </div>
          </div>
        </div>

      </div>

      {/* SIMULATED PAYMENT MODAL (Fallback when Razorpay details are mocks) */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="h-12 w-12 bg-primary-50 dark:bg-primary-950/40 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <CreditCard className="h-6 w-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Simulated Payment Sandbox</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                SmartShop AI detected mock Razorpay configurations. Test checkouts instantly in this local simulated environment.
              </p>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-[10px] font-mono text-gray-400 text-left truncate">
                Simulated ID: {simulatedOrderId}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSimulatedModal(false);
                  onToast('Simulated payment cancelled');
                }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 text-xs font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePaymentSuccess}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
