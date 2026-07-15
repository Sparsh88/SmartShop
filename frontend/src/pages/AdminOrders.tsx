import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { formatPrice } from '../utils/priceHelper';
import { ShoppingBag, Eye, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders');
      return res.data.orders;
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.put(`/admin/orders/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      // Refresh current inspector modal if active
      if (selectedOrder) {
        const updated = orders.find((o: any) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    },
    onError: () => {
      toast.error('Error updating order status');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-slate-950 animate-page-enter">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Manage Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Review purchases, update fulfillment steps, and inspect tracking checkpoints.</p>
        </div>

        {isLoading ? (
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 p-4 text-slate-500 font-bold uppercase">
                    <th className="p-4">Order No</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Payable</th>
                    <th className="p-4 text-center">Fulfillment</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-950/20 transition">
                      <td className="p-4 font-bold text-slate-200">{order.orderNumber}</td>
                      <td className="p-4 text-slate-400">
                        <div className="font-bold text-slate-300">{order.user?.name}</div>
                        <div className="text-[10px] text-slate-500">{order.user?.email}</div>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-200 font-semibold">{formatPrice(order.payableAmount)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`bg-slate-950 text-[10px] font-bold border border-slate-800 rounded-lg p-1.5 cursor-pointer uppercase ${
                              order.status === 'DELIVERED' || order.status === 'CANCELLED' ? 'opacity-65' : ''
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-slate-500 hover:text-indigo-400 transition"
                          title="Inspect Order Items & Shipping details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDER DETAILS INSPECTOR MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full relative space-y-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-white">Order Details Summary</h3>
                <p className="text-xs text-slate-400">Invoice Ref: {selectedOrder.orderNumber}</p>
              </div>

              {/* Items listing */}
              <div className="space-y-3 divide-y divide-slate-850 max-h-[160px] overflow-y-auto pr-2">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex justify-between text-xs text-slate-300">
                    <div>
                      <span className="font-bold block text-white">{item.product?.name}</span>
                      <span className="text-[10px] text-slate-500">Price: {formatPrice(item.price)} × {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-100">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Billing Info</span>
                  <div className="font-bold text-slate-200">{selectedOrder.address?.name}</div>
                  <div>{selectedOrder.address?.phone}</div>
                  <div>{selectedOrder.address?.street}, {selectedOrder.address?.city}</div>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fulfillment Stats</span>
                  <div>Subtotal: {formatPrice(selectedOrder.totalAmount)}</div>
                  <div>Discount Code: -{formatPrice(selectedOrder.discountAmount)}</div>
                  <div className="font-bold text-indigo-400 text-sm mt-1">Paid: {formatPrice(selectedOrder.payableAmount)}</div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
