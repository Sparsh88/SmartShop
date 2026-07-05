import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { TableSkeleton } from '../components/LoaderSkeletons';
import { ClipboardList, ChevronDown, ChevronUp, Edit2, Calendar } from 'lucide-react';

const AdminOrders = ({ onToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status updating fields
  const [status, setStatus] = useState('processing');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err.message);
      onToast('Failed to load orders lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
        carrier,
        trackingNumber
      });
      onToast('Order status updated successfully! ✨');
      setExpandedOrderId(null);
      fetchOrders();
    } catch (err) {
      onToast('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRowClick = (order) => {
    const isExpanded = expandedOrderId === order._id;
    if (isExpanded) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(order._id);
      setStatus(order.status);
      setCarrier(order.trackingDetails?.carrier || '');
      setTrackingNumber(order.trackingDetails?.trackingNumber || '');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Manage Orders</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Track purchase transactions, update timelines, and verify payments</p>
      </div>

      {loading && orders.length === 0 ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-750 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-750 text-gray-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750">
                {orders.map(order => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <React.Fragment key={order._id}>
                      <tr 
                        onClick={() => handleRowClick(order)}
                        className="hover:bg-gray-50/50 dark:hover:bg-slate-750/30 transition-colors cursor-pointer"
                      >
                        <td className="p-4">
                          <p className="font-extrabold text-gray-900 dark:text-white">
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-900 dark:text-white font-extrabold">{order.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-gray-405">{order.user?.email || 'N/A'}</p>
                        </td>
                        <td className="p-4 font-black text-gray-900 dark:text-white">
                          ₹{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'delivered' ? 'text-green-500' : 'text-primary-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-gray-400 inline" /> : <ChevronDown className="h-4.5 w-4.5 text-gray-400 inline" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="bg-gray-50/20 dark:bg-slate-905 p-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500">
                              
                              {/* Left: Items preview */}
                              <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h4 className="font-black text-gray-800 dark:text-white uppercase text-[10px]">Order Items</h4>
                                <div className="divide-y divide-gray-100 pr-1 max-h-32 overflow-y-auto">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                                      <span className="truncate max-w-[150px]">{item.name}</span>
                                      <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Center: Address details */}
                              <div className="space-y-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h4 className="font-black text-gray-800 dark:text-white uppercase text-[10px] mb-2">Shipping address</h4>
                                <p className="font-bold text-gray-900 dark:text-white">{order.user?.name}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                              </div>

                              {/* Right: Status Change form */}
                              <div className="space-y-3.5 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h4 className="font-black text-gray-800 dark:text-white uppercase text-[10px] mb-2 flex items-center gap-1">
                                  <Edit2 className="h-3.5 w-3.5" /> Update status
                                </h4>
                                
                                <div className="space-y-2">
                                  <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100"
                                  >
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="returned">Returned</option>
                                  </select>

                                  {status === 'shipped' && (
                                    <div className="grid grid-cols-2 gap-2 animate-slide-in">
                                      <input
                                        type="text"
                                        placeholder="Carrier"
                                        value={carrier}
                                        onChange={(e) => setCarrier(e.target.value)}
                                        className="bg-gray-50 dark:bg-slate-900 border border-gray-250 px-2 py-1.5 rounded-lg"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Tracking #"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="bg-gray-50 dark:bg-slate-900 border border-gray-250 px-2 py-1.5 rounded-lg"
                                      />
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleUpdateStatus(order._id)}
                                    disabled={updating}
                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 rounded-lg text-xs"
                                  >
                                    {updating ? 'Updating...' : 'Save status'}
                                  </button>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
