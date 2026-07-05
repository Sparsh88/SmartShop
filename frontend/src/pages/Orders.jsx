import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  RotateCcw,
  Calendar,
  CreditCard
} from 'lucide-react';

const Orders = ({ onToast }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Return request state
  const [returnReason, setReturnReason] = useState('');
  const [requestingReturnId, setRequestingReturnId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error(error.message);
      onToast('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.put(`/orders/${orderId}/cancel`);
      onToast('Order cancelled successfully. Refund will be initiated if paid online. 💸');
      fetchOrders();
    } catch (error) {
      onToast(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleReturnSubmit = async (orderId) => {
    if (!returnReason.trim()) return;

    try {
      await api.put(`/orders/${orderId}/return`, { returnReason: returnReason.trim() });
      onToast('Return request submitted! 📦');
      setRequestingReturnId(null);
      setReturnReason('');
      fetchOrders();
    } catch (error) {
      onToast(error.response?.data?.message || 'Return request failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500 animate-bounce" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'returned':
        return <RotateCcw className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  // Build a nice horizontal tracking timeline
  const renderTimeline = (status) => {
    const steps = ['processing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(status);

    if (status === 'cancelled') {
      return (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3.5 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
          <XCircle className="h-4.5 w-4.5" /> Order Cancelled
        </div>
      );
    }
    if (status === 'returned') {
      return (
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 p-3.5 rounded-xl text-xs text-purple-600 font-semibold flex items-center gap-2">
          <RotateCcw className="h-4.5 w-4.5" /> Items Returned
        </div>
      );
    }

    return (
      <div className="flex items-center w-full justify-between pt-6 pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                idx <= currentIdx 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-300'
              }`}>
                {idx + 1}
              </div>
              <span className={idx <= currentIdx ? 'text-primary-500 font-black' : 'text-gray-400'}>{step}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 transition-colors ${
                idx < currentIdx ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-750'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 font-semibold">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Order History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track delivery status, cancel processings, or request returns</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <div 
                key={order._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden"
              >
                
                {/* Summary Row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-gray-500 flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-450 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="font-black text-sm text-gray-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider inline-block mt-0.5 ${
                        order.status === 'delivered' ? 'text-emerald-500' : 'text-primary-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded details timeline */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-100 dark:border-slate-750 bg-gray-50/20 dark:bg-slate-900/10 space-y-6 animate-fade-in">
                    
                    {/* Horizontal progress tracking */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm max-w-xl mx-auto">
                      {renderTimeline(order.status)}
                    </div>

                    {/* Order Details items preview */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Order Items</h4>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-4 divide-y divide-gray-100 dark:divide-slate-750">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                              <div>
                                <p className="font-extrabold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Price: ₹{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <span>{item.quantity}x</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery information summary grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-750 text-xs font-medium text-gray-500 space-y-2">
                        <p className="font-extrabold text-gray-800 dark:text-white mb-2 uppercase text-[10px] tracking-wider">Shipping Destination</p>
                        <p className="font-bold text-gray-900 dark:text-white">{user?.name || 'Customer'}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-750 text-xs font-medium text-gray-500 space-y-2">
                        <p className="font-extrabold text-gray-800 dark:text-white mb-2 uppercase text-[10px] tracking-wider">Payment Overview</p>
                        <p className="flex items-center gap-1.5 capitalize">
                          <CreditCard className="h-4 w-4" /> Mode: {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Secure'}
                        </p>
                        <p className="flex items-center gap-1.5">
                          Status: <span className={`font-black uppercase ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>{order.paymentStatus}</span>
                        </p>
                      </div>
                    </div>

                    {/* Operational triggers cancel/return */}
                    <div className="flex gap-3 justify-end">
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-red-100 dark:border-red-900/50"
                        >
                          Cancel Order
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <>
                          {requestingReturnId !== order._id ? (
                            <button
                              onClick={() => setRequestingReturnId(order._id)}
                              className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                            >
                              Request Return
                            </button>
                          ) : (
                            <div className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-750 p-4 rounded-2xl space-y-3 max-w-sm ml-auto animate-slide-in">
                              <h5 className="font-bold text-xs text-gray-800">Submit Return Details</h5>
                              <input
                                type="text"
                                placeholder="Explain reason for returning..."
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setRequestingReturnId(null)}
                                  className="text-xs font-semibold px-3 py-1.5 border rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReturnSubmit(order._id)}
                                  className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-850/30 border border-gray-100 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <Package className="h-12 w-12 text-gray-300 mx-auto" />
          <h2 className="text-lg font-bold">You have no order history</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">Once you check out products from the cart, they will appear here dynamically.</p>
          <Link
            to="/shop"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm text-xs inline-block pt-2 hover:scale-105 transition-transform"
          >
            Explore Products
          </Link>
        </div>
      )}

    </div>
  );
};

export default Orders;
