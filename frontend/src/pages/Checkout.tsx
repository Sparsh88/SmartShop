import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { toast } from '../store/toastStore';
import api from '../services/api';
import { formatPrice } from '../utils/priceHelper';
import confetti from 'canvas-confetti';
import { MapPin, Plus, CreditCard, ChevronRight, Check } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuthStore();
  const { items, payableAmount, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const appliedCoupon = location.state?.appliedCoupon || null;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPrice = payableAmount - couponDiscount;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      setAddresses(res.data.addresses);
      // Auto-select default address
      const defaultAddr = res.data.addresses.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (res.data.addresses.length > 0) {
        setSelectedAddressId(res.data.addresses[0].id);
      }
    } catch (err) {
      toast.error('Error fetching addresses');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders/addresses', {
        ...addressForm,
        isDefault: addresses.length === 0, // Default if first address
      });
      toast.success('Address added successfully!');
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving address');
    }
  };

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // 1. Create Order record on express backend
      const orderRes = await api.post('/orders/create', {
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
      });

      const order = orderRes.data.order;

      if (paymentMethod === 'COD') {
        // Success for Cash on Delivery
        confetti({ particleCount: 150, spread: 80 });
        toast.success('Order placed successfully! Thank you.');
        await clearCart(true);
        setIsPlacingOrder(false);
        navigate('/orders');
      } else {
        // Razorpay payment integration
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsPlacingOrder(false);
          return;
        }

        // 2. Generate Razorpay Order parameters
        const payRes = await api.post('/payments/create-order', {
          orderId: order.id,
        });

        const payParams = payRes.data;

        if (payParams.isMock) {
          // Automatic approval for testing if sandbox secret keys are active
          toast.info('Razorpay is in test sandbox mock mode. Processing auto-approval...');
          await api.post('/payments/verify', {
            orderId: order.id,
            razorpay_order_id: payParams.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
          });

          confetti({ particleCount: 150, spread: 80 });
          toast.success('Mock Payment approved! Order completed.');
          await clearCart(true);
          setIsPlacingOrder(false);
          navigate('/orders');
        } else {
          // Open active Razorpay overlay
          const options = {
            key: payParams.keyId,
            amount: payParams.amount,
            currency: payParams.currency,
            name: 'SmartShop Inc.',
            description: `Checkout Payment for Order ${order.orderNumber}`,
            order_id: payParams.orderId,
            handler: async (response: any) => {
              try {
                // 3. Verify capture signature on server
                await api.post('/payments/verify', {
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                confetti({ particleCount: 150, spread: 80 });
                toast.success('Payment captured! Order placed.');
                await clearCart(true);
                navigate('/orders');
              } catch (verifyError: any) {
                toast.error(verifyError.response?.data?.message || 'Payment verification failed');
              }
            },
            prefill: {
              name: order.user?.name || '',
              email: order.user?.email || '',
            },
            theme: {
              color: '#4F46E5', // Indigo color matching primary
            },
            modal: {
              ondismiss: () => {
                 toast.info('Payment popup closed. Order remains pending.');
                navigate('/orders');
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setIsPlacingOrder(false);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error placing order');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-page-enter">
      <h1 className="text-3xl font-black font-display text-white">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Section */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-400" />
                Shipping Address
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {/* Address Add form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-slate-950 p-4 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Full Name</span>
                  <input
                    required
                    type="text"
                    value={addressForm.name}
                    onChange={(e: any) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Phone Number</span>
                  <input
                    required
                    type="text"
                    value={addressForm.phone}
                    onChange={(e: any) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Street Address</span>
                  <input
                    required
                    type="text"
                    value={addressForm.street}
                    onChange={(e: any) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">City</span>
                  <input
                    required
                    type="text"
                    value={addressForm.city}
                    onChange={(e: any) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">State / Province</span>
                  <input
                    required
                    type="text"
                    value={addressForm.state}
                    onChange={(e: any) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Postal Code / ZIP</span>
                  <input
                    required
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e: any) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">Country</span>
                  <input
                    required
                    type="text"
                    value={addressForm.country}
                    onChange={(e: any) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* List addresses */}
            {addresses.length === 0 ? (
              <p className="text-slate-500 text-xs">No saved shipping addresses. Please add one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr: any) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`text-left p-4 rounded-xl border flex gap-3 transition ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedAddressId === addr.id ? 'border-indigo-500 text-indigo-400' : 'border-slate-700'
                      }`}>
                        {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-400">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {addr.name} {addr.isDefault && <span className="text-[9px] font-semibold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Default</span>}
                      </div>
                      <div>{addr.phone}</div>
                      <div>{addr.street}</div>
                      <div>{addr.city}, {addr.state} - {addr.postalCode}</div>
                      <div>{addr.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800/40">
              <CreditCard size={18} className="text-indigo-400" />
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash On Delivery */}
              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition text-left ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'COD' ? 'border-indigo-500 text-indigo-400' : 'border-slate-700'
                }`}>
                  {paymentMethod === 'COD' && <Check size={12} />}
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">Cash On Delivery (COD)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay in cash when package is delivered.</p>
                </div>
              </button>

              {/* Razorpay Option */}
              <button
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition text-left ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === 'RAZORPAY' ? 'border-indigo-500 text-indigo-400' : 'border-slate-700'
                }`}>
                  {paymentMethod === 'RAZORPAY' && <Check size={12} />}
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">Razorpay Payment Gateway</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay securely via Cards, UPI, NetBanking, etc.</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Review cart summary */}
        <div className="space-y-6">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold font-display text-white">Review Items</h3>

            {/* List short line items details */}
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 text-xs">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 line-clamp-1">{item.product.name} (x{item.quantity})</span>
                  <span className="text-slate-200 font-bold shrink-0">
                    {formatPrice(item.product.discountPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing calculations */}
            <div className="space-y-3.5 text-sm border-t border-slate-850 pt-5 pb-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cart Total</span>
                <span className="text-slate-300 font-semibold">{formatPrice(payableAmount)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Coupon Discount ({appliedCoupon.code})</span>
                  <span className="text-emerald-400 font-semibold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Delivery Charges</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">FREE</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-850">
                <span className="text-slate-100 font-bold">Total Payable</span>
                <span className="text-2xl font-black text-indigo-400">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* Place Order button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || items.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              Place Order <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
