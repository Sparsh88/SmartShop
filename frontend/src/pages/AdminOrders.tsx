import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { formatPrice } from '../utils/priceHelper';
import { Eye, X, Package } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal';

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
      queryClient.invalidateQueries();
      if (selectedOrder) {
        const updated = orders?.find((o: any) => o.id === selectedOrder.id);
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

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-[#0D0D0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Fulfillment Operations
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Manage Customer Orders
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1">Review live purchases, update delivery checkpoints, and inspect package invoices.</p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse"></div>
        ) : (
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-soft-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-[#F4F3EF]/60 dark:bg-[#1C1C20]/60 p-4 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Payable Total</th>
                    <th className="p-4 text-center">Fulfillment Status</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="p-4 font-bold text-neutral-900 dark:text-white">{order.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">{order.user?.name}</div>
                        <div className="text-[10px] text-neutral-400">{order.user?.email}</div>
                      </td>
                      <td className="p-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-neutral-900 dark:text-white font-extrabold">{formatPrice(order.payableAmount)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-[#F4F3EF] dark:bg-[#1C1C20] text-neutral-900 dark:text-white text-[10px] font-bold border border-neutral-300/80 dark:border-neutral-700 rounded-full px-3 py-1.5 cursor-pointer uppercase focus:outline-none"
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
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
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

        {/* ORDER DETAILS INSPECTOR MODAL WITH CREATE PORTAL */}
        {selectedOrder && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative space-y-6 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Package size={20} /> Order Invoice Summary
                </h3>
                <p className="text-xs text-neutral-400">Reference: {selectedOrder.orderNumber}</p>
              </div>

              {/* Items listing */}
              <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800/80 max-h-[180px] overflow-y-auto pr-2">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex justify-between text-xs text-neutral-700 dark:text-neutral-300">
                    <div>
                      <span className="font-bold block text-neutral-900 dark:text-white">{item.product?.name}</span>
                      <span className="text-[10px] text-neutral-400">Unit: {formatPrice(item.price)} × {item.quantity}</span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-4 text-xs text-neutral-500">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Shipping Details</span>
                  <div className="font-bold text-neutral-900 dark:text-white">{selectedOrder.address?.name}</div>
                  <div>{selectedOrder.address?.phone}</div>
                  <div className="line-clamp-2">{selectedOrder.address?.street}, {selectedOrder.address?.city}</div>
                </div>
                
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Financials</span>
                  <div>Subtotal: {formatPrice(selectedOrder.totalAmount)}</div>
                  <div>Discount: -{formatPrice(selectedOrder.discountAmount)}</div>
                  <div className="font-editorial font-extrabold text-neutral-900 dark:text-white text-base pt-1">Paid: {formatPrice(selectedOrder.payableAmount)}</div>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}

      </main>
    </div>
  );
}
