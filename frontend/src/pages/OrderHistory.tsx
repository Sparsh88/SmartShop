import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import { ClipboardList, CheckCircle, Printer, X, PackageCheck } from 'lucide-react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

export default function OrderHistory() {
  const queryClient = useQueryClient();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);

  // Fetch customer orders
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders');
      return res.data.orders;
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.put(`/orders/cancel/${orderId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully. Refund initiated.');
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60';
      case 'PROCESSING':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60';
      case 'SHIPPED':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/60';
      case 'DELIVERED':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
    }
  };

  const trackingSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const getStepIndex = (status: string) => trackingSteps.indexOf(status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-page-enter">
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
            Purchase Records
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Order History
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1">Review your placed orders, tracking updates, and invoices.</p>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl"></div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <ScrollReveal direction="up" distance={25}>
          <div className="text-center py-20 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl space-y-3 shadow-soft-sm">
            <ClipboardList size={40} className="mx-auto text-neutral-400" />
            <p className="text-neutral-500 text-sm font-semibold">You haven't placed any orders yet.</p>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollRevealGroup staggerDelay={0.08} delayChildren={0.02} className="space-y-6">
          {data.map((order: any) => (
            <ScrollRevealItem key={order.id} direction="up" distance={25}>
              <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-soft-sm">
                
                {/* Top Banner */}
                <div className="bg-[#F4F3EF] dark:bg-[#1E1E22] p-5 sm:p-6 border-b border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Order ID</span>
                      <strong className="text-neutral-900 dark:text-white font-mono">{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Date Placed</span>
                      <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <strong className="text-neutral-900 dark:text-white font-bold">{formatPrice(order.payableAmount)}</strong>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-5 sm:p-6 divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {order.items?.map((item: any) => {
                    const img = fixProductImage(item.product?.images?.[0], item.product?.name);
                    return (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={img}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded-2xl bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-200 dark:border-neutral-800 shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">{item.product?.name}</h3>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-neutral-900 dark:text-white text-sm block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom details & Actions */}
                <div className="p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1E] border-t border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-neutral-500">
                    Shipped to: <strong className="text-neutral-900 dark:text-white">{order.address?.name}</strong>, {order.address?.street}, {order.address?.city}
                  </div>

                  <div className="flex gap-2">
                    {/* Track Order button */}
                    {order.status !== 'CANCELLED' && (
                      <button
                        onClick={() => setSelectedOrderForTracking(order)}
                        className="bg-white dark:bg-[#161618] hover:border-neutral-900 dark:hover:border-white border border-neutral-300/80 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm cursor-pointer"
                      >
                        Track
                      </button>
                    )}

                    {/* View Invoice button */}
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="bg-white dark:bg-[#161618] hover:border-neutral-900 dark:hover:border-white border border-neutral-300/80 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-soft-sm cursor-pointer"
                    >
                      <Printer size={13} /> Invoice
                    </button>

                    {/* Cancel button */}
                    {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      )}

      {/* TRACKING STEPPER MODAL WITH CREATE PORTAL */}
      {selectedOrderForTracking && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrderForTracking(null)}
        >
          <div 
            className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative space-y-6 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">Real-Time Status</span>
              <h3 className="font-editorial text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <PackageCheck size={22} /> Order Tracking
              </h3>
              <p className="text-xs text-neutral-500 font-mono">Order: {selectedOrderForTracking.orderNumber}</p>
            </div>

            {/* Stepper */}
            <div className="relative pl-6 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-8 py-2 ml-2">
              {trackingSteps.map((step, idx) => {
                const currentIdx = getStepIndex(selectedOrderForTracking.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative flex items-center gap-4">
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? isCurrent
                          ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 scale-110'
                          : 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#161618]'
                    }`}>
                      {isCompleted && !isCurrent && <CheckCircle size={8} className="text-white dark:text-neutral-950" />}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                        {step}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {isCompleted
                          ? isCurrent
                            ? `Package is currently in the ${step.toLowerCase()} stage.`
                            : `Order passed ${step.toLowerCase()} successfully.`
                          : `Awaiting progress.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PRINT INVOICE MODAL WITH CREATE PORTAL */}
      {selectedOrderForInvoice && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedOrderForInvoice(null)}
        >
          <div 
            className="bg-white text-neutral-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl flex flex-col space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition print:hidden cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Print trigger button */}
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4 print:hidden">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">Official Receipt</span>
                <h3 className="font-editorial text-xl font-bold text-neutral-900">Tax Invoice</h3>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-[#121212] hover:bg-black text-white font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-soft-sm cursor-pointer mr-8"
              >
                <Printer size={14} /> Print Invoice
              </button>
            </div>

            {/* Print Body */}
            <div className="space-y-6 text-xs text-neutral-600 print:text-black">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-editorial text-2xl font-black text-neutral-900 tracking-tight">SMARTSHOP</h2>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Lovely Professional University, Phagwara, Punjab – 144411</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-sm uppercase text-neutral-900">Tax Invoice</h4>
                  <p className="font-mono">No: {selectedOrderForInvoice.orderNumber}</p>
                  <p>Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-neutral-200 py-4 my-4">
                <div>
                  <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Billed To:</span>
                  <div className="font-bold text-neutral-900">{selectedOrderForInvoice.address?.name}</div>
                  <div>{selectedOrderForInvoice.address?.street}</div>
                  <div>{selectedOrderForInvoice.address?.city}, {selectedOrderForInvoice.address?.state} - {selectedOrderForInvoice.address?.postalCode}</div>
                  <div>{selectedOrderForInvoice.address?.phone}</div>
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Payment Info:</span>
                  <div>Method: <strong className="uppercase text-neutral-900">{selectedOrderForInvoice.paymentMethod}</strong></div>
                  <div>Status: <strong className="uppercase text-neutral-900">{selectedOrderForInvoice.paymentStatus}</strong></div>
                  {selectedOrderForInvoice.paymentId && <div className="font-mono text-[10px] mt-0.5">Ref ID: {selectedOrderForInvoice.paymentId}</div>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {selectedOrderForInvoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 font-semibold text-neutral-900">{item.product?.name}</td>
                      <td className="py-3 text-right">{formatPrice(item.price)}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pricing Totals */}
              <div className="flex justify-end pt-4 border-t border-neutral-200">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal:</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(selectedOrderForInvoice.totalAmount)}</span>
                  </div>
                  {selectedOrderForInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedOrderForInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base text-neutral-900 border-t border-neutral-200 pt-2">
                    <span>Total Paid:</span>
                    <span>{formatPrice(selectedOrderForInvoice.payableAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-400 pt-6 border-t border-neutral-100">
                <p>Thank you for shopping at SmartShop! For support: sparshchauhan050@gmail.com</p>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
