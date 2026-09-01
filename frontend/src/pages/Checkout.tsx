import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { toast } from '../store/toastStore';
import { formatPrice } from '../utils/priceHelper';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { MapPin, Plus, CreditCard, ChevronRight, Check, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { items, payableAmount, clearCart, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address Add Form State
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

  // Read passed coupon discount info from Cart routing
  const appliedCoupon = location.state?.appliedCoupon;
  const couponDiscount = location.state?.couponDiscount || 0;

  const finalPrice = Math.max(0, payableAmount - couponDiscount);

  useEffect(() => {
    fetchCart(true);
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      const addrs = res.data.addresses || [];
      setAddresses(addrs);

      if (addrs.length > 0) {
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        setSelectedAddressId(def.id);
        setShowAddressForm(false);
      } else {
        setSelectedAddressId('');
        setShowAddressForm(true);
      }
    } catch (err) {
      toast.error('Error fetching addresses');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders/addresses', addressForm);
      toast.success('Address added!');
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
      await fetchAddresses();
      if (res.data.address) {
        setSelectedAddressId(res.data.address.id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving address');
    }
  };

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
      const orderRes = await api.post('/orders/create', {
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
      });

      const order = orderRes.data.order;

      if (paymentMethod === 'COD') {
        confetti({ particleCount: 150, spread: 80 });
        toast.success('Order placed successfully! Thank you.');
        await clearCart(true);
        setIsPlacingOrder(false);
        navigate('/orders');
      } else {
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsPlacingOrder(false);
          return;
        }

        const payRes = await api.post('/payments/create-order', { orderId: order.id });
        const payParams = payRes.data;

        if (payParams.isMock) {
          toast.info('Razorpay is in test sandbox mock mode.');
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
          const options = {
            key: payParams.keyId,
            amount: payParams.amount,
            currency: payParams.currency,
            name: 'SmartShop Inc.',
            description: `Checkout Payment for Order ${order.orderNumber}`,
            order_id: payParams.orderId,
            handler: async (response: any) => {
              try {
                await api.post('/payments/verify', {
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                confetti({ particleCount: 150, spread: 80 });
                toast.success('Payment verified & order completed!');
                await clearCart(true);
                navigate('/orders');
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Payment verification failed');
              }
            },
            prefill: {
              name: order.user?.name || '',
              email: order.user?.email || '',
            },
            theme: { color: '#121212' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-page-enter">
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
            Final Step
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Checkout & Payment
          </h1>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Columns: Address & Payment Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Address Section */}
          <ScrollReveal direction="up" distance={25} duration={0.6}>
            <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-5 shadow-soft-sm">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="font-editorial font-bold text-base uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <MapPin size={17} />
                  Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1 hover:opacity-75 transition"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>

              {/* Address Add form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-[#F4F3EF] dark:bg-[#1E1E22] p-5 border border-neutral-300/80 dark:border-neutral-700 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Full Name</span>
                    <input
                      required
                      type="text"
                      placeholder="Your full name"
                      value={addressForm.name}
                      onChange={(e: any) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Phone Number</span>
                    <input
                      required
                      type="text"
                      placeholder="+91 98765 43210"
                      value={addressForm.phone}
                      onChange={(e: any) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Street Address</span>
                    <input
                      required
                      type="text"
                      placeholder="Flat, House no., Building, Street / Area"
                      value={addressForm.street}
                      onChange={(e: any) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">City</span>
                    <input
                      required
                      type="text"
                      placeholder="City / Town"
                      value={addressForm.city}
                      onChange={(e: any) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">State / Province</span>
                    <input
                      required
                      type="text"
                      placeholder="State / Province"
                      value={addressForm.state}
                      onChange={(e: any) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Postal Code</span>
                    <input
                      required
                      type="text"
                      placeholder="PIN / Postal Code"
                      value={addressForm.postalCode}
                      onChange={(e: any) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Country</span>
                    <input
                      required
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e: any) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-2.5 rounded-full text-xs uppercase tracking-wider transition"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* List addresses */}
              {addresses.length === 0 ? (
                <p className="text-neutral-500 text-xs py-2">No saved shipping addresses. Please add one above.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr: any) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`text-left p-4 rounded-2xl border flex gap-3 transition ${
                        selectedAddressId === addr.id
                          ? 'border-neutral-900 dark:border-white bg-[#F4F3EF] dark:bg-[#1E1E22] shadow-sm'
                          : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-[#161618]'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedAddressId === addr.id ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-neutral-300 dark:border-neutral-700'
                        }`}>
                          {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white"></div>}
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-neutral-500">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {addr.name} {addr.isDefault && <span className="text-[9px] font-bold uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded">Default</span>}
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
          </ScrollReveal>

          {/* Payment Section */}
          <ScrollReveal direction="up" distance={25} duration={0.6}>
            <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-5 shadow-soft-sm">
              <h3 className="font-editorial font-bold text-base uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <CreditCard size={17} />
                Payment Option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash On Delivery */}
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 transition text-left ${
                    paymentMethod === 'COD'
                      ? 'border-neutral-900 dark:border-white bg-[#F4F3EF] dark:bg-[#1E1E22] shadow-sm'
                      : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-[#161618]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === 'COD' ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'border-neutral-300 dark:border-neutral-700'
                  }`}>
                    {paymentMethod === 'COD' && <Check size={12} />}
                  </div>
                  <div>
                    <h4 className="text-neutral-900 dark:text-white font-bold text-xs">Cash On Delivery (COD)</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Pay in cash when package arrives.</p>
                  </div>
                </button>

                {/* Razorpay Option */}
                <button
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 transition text-left ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-neutral-900 dark:border-white bg-[#F4F3EF] dark:bg-[#1E1E22] shadow-sm'
                      : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-[#161618]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === 'RAZORPAY' ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'border-neutral-300 dark:border-neutral-700'
                  }`}>
                    {paymentMethod === 'RAZORPAY' && <Check size={12} />}
                  </div>
                  <div>
                    <h4 className="text-neutral-900 dark:text-white font-bold text-xs">Online Secure Gateway</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Cards, UPI, NetBanking via Razorpay.</p>
                  </div>
                </button>
              </div>
            </div>
          </ScrollReveal>

        </div>

        {/* Right Column: Pricing & Review cart summary (5 cols) */}
        <ScrollReveal direction="left" distance={30} duration={0.7} className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-6 shadow-soft-sm">
            <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white">
              Order Review
            </h3>

            {/* List short line items details */}
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 text-xs border-b border-neutral-100 dark:border-neutral-800 pb-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center gap-2">
                  <span className="text-neutral-500 line-clamp-1">{item.product.name} (x{item.quantity})</span>
                  <span className="text-neutral-900 dark:text-white font-bold shrink-0">
                    {formatPrice((item.product.discount > 0 ? item.product.discountPrice : item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing calculations */}
            <div className="space-y-3 text-xs sm:text-sm border-b border-neutral-100 dark:border-neutral-800 pb-5">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(payableAmount)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Coupon Discount ({appliedCoupon.code})</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500">
                <span>Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-editorial text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Total Amount</span>
              <span className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">{formatPrice(finalPrice)}</span>
            </div>

            {/* Place Order button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || items.length === 0}
              className="w-full btn-pill-arrow group justify-between px-6 py-4 shadow-soft-md disabled:opacity-50"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                {isPlacingOrder ? 'Processing...' : 'Place Order'}
              </span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-neutral-400">
              <ShieldCheck size={14} />
              <span>256-Bit SSL Encrypted & Protected</span>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
