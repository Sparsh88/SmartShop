import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import { ClipboardList, CheckCircle, Printer, X } from 'lucide-react';

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
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
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

  const trackingSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const getStepIndex = (status: string) => trackingSteps.indexOf(status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-page-enter">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Order History</h1>
        <p className="text-slate-400 text-sm mt-1">Review your recent purchases and download invoices.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <ClipboardList size={48} className="mx-auto text-slate-600" />
          <p className="text-slate-400 text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((order: any) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Top Banner (Order No, Date, Status) */}
              <div className="bg-slate-950 p-5 border-b border-slate-850 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Order Number</span>
                    <strong className="text-slate-200">{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date Placed</span>
                    <strong className="text-slate-200">{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Amount Paid</span>
                    <strong className="text-indigo-400">{formatPrice(order.payableAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method</span>
                    <strong className="text-slate-200 uppercase">{order.paymentMethod}</strong>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Middle Section (Items Details) */}
              <div className="p-5 divide-y divide-slate-850">
                {order.items?.map((item: any) => {
                  const imageSrc = fixProductImage(item.product?.images?.[0], item.product?.name);

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={imageSrc}
                          alt=""
                          className="w-14 h-14 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div>
                          <h4 className="text-white font-bold text-sm line-clamp-1">{item.product?.name}</h4>
                          <span className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-5 bg-slate-950/40 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Shipped to: <strong>{order.address?.name}</strong>, {order.address?.street}, {order.address?.city}
                </div>

                <div className="flex gap-3">
                  {/* Track Order button */}
                  {order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setSelectedOrderForTracking(order)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition"
                    >
                      Track Order
                    </button>
                  )}

                  {/* View Invoice button */}
                  <button
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                  >
                    <Printer size={12} /> View Invoice
                  </button>

                  {/* Cancel button */}
                  {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TRACKING STEPPER MODAL */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative space-y-6 animate-in zoom-in-90 duration-300">
            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">Track Your Order</h3>
              <p className="text-xs text-slate-400">Order: {selectedOrderForTracking.orderNumber}</p>
            </div>

            {/* Stepper details */}
            <div className="relative pl-6 border-l border-slate-800 space-y-8 py-2">
              {trackingSteps.map((step, idx) => {
                const currentIdx = getStepIndex(selectedOrderForTracking.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative flex items-center gap-4">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? isCurrent
                          ? 'border-indigo-500 bg-slate-900 scale-125'
                          : 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-800 bg-slate-950'
                    }`}>
                      {isCompleted && !isCurrent && <CheckCircle size={8} className="text-white" />}
                      {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                        {step}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isCompleted
                          ? isCurrent
                            ? `Your package is currently in the ${step.toLowerCase()} stage.`
                            : `Order passed ${step.toLowerCase()} successfully.`
                          : `Awaiting order completion.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white text-slate-800 rounded-3xl p-8 max-w-2xl w-full relative shadow-2xl flex flex-col space-y-6 animate-in zoom-in-95 duration-500">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition print:hidden"
            >
              <X size={20} />
            </button>

            {/* Print trigger button */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <h3 className="text-lg font-bold">Tax Invoice</h3>
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Printer size={14} /> Print Invoice
              </button>
            </div>

            {/* Print Body (Billing and Receipt information) */}
            <div className="space-y-6 text-xs text-slate-600 print:text-black">
              {/* Header Info */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-indigo-600 tracking-tight font-display">SmartShop</h2>
                  <p className="text-[10px]">123 Tech Avenue, Silicon Valley</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-sm uppercase">Invoice</h4>
                  <p>No: {selectedOrderForInvoice.orderNumber}</p>
                  <p>Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-4 border-t border-b py-4 my-4">
                <div>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Billed To:</span>
                  <div className="font-bold text-slate-800">{selectedOrderForInvoice.address?.name}</div>
                  <div>{selectedOrderForInvoice.address?.street}</div>
                  <div>{selectedOrderForInvoice.address?.city}, {selectedOrderForInvoice.address?.state} - {selectedOrderForInvoice.address?.postalCode}</div>
                  <div>{selectedOrderForInvoice.address?.phone}</div>
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Payment Info:</span>
                  <div>Method: <strong className="uppercase">{selectedOrderForInvoice.paymentMethod}</strong></div>
                  <div>Status: <strong className="uppercase">{selectedOrderForInvoice.paymentStatus}</strong></div>
                  {selectedOrderForInvoice.paymentId && <div>Ref ID: {selectedOrderForInvoice.paymentId}</div>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrderForInvoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 font-semibold text-slate-800">{item.product?.name}</td>
                      <td className="py-3 text-right">{formatPrice(item.price)}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pricing Totals */}
              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span>{formatPrice(selectedOrderForInvoice.totalAmount)}</span>
                  </div>
                  {selectedOrderForInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Code:</span>
                      <span>-{formatPrice(selectedOrderForInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-800 border-t pt-2">
                    <span>Amount Paid:</span>
                    <span className="text-indigo-600">{formatPrice(selectedOrderForInvoice.payableAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom terms */}
              <div className="text-center text-[10px] text-slate-400 pt-8">
                <p>Thank you for shopping at SmartShop! For support, email support@smartshop.com</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
