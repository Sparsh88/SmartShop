import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { Plus, Ticket, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: '',
    minCartValue: '',
    expiryDate: '',
  });

  // Fetch coupons query
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.coupons;
    },
  });

  // Create Coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/coupons', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Coupon created successfully!');
      setShowForm(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minCartValue: '',
        expiryDate: '',
      });
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating coupon');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/coupons/toggle/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Coupon status toggled');
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to change coupon status');
    },
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/coupons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to delete coupon');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    createCouponMutation.mutate({
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minCartValue: parseFloat(formData.minCartValue || '0'),
      expiryDate: formData.expiryDate,
    });
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this coupon code permanently?')) {
      deleteCouponMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-[#0D0D0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 animate-page-enter">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-neutral-800 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                Discounts & Vouchers
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                Manage Coupons
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1">Configure promotional discount codes, validity dates, and minimum cart amounts.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm self-start sm:self-auto"
            >
              <Plus size={16} /> {showForm ? 'Close Form' : 'Add New Coupon'}
            </button>
          </div>
        </ScrollReveal>

        {/* Create Coupon inline form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs shadow-soft-sm animate-in zoom-in-95 duration-200">
            <div className="flex flex-col space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-300 font-bold">Coupon Code</label>
              <input
                required
                type="text"
                placeholder="WELCOME10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white uppercase focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-300 font-bold">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-300 font-bold">Discount Value</label>
              <input
                required
                type="number"
                placeholder="10"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-300 font-bold">Min Purchase Required (₹)</label>
              <input
                type="number"
                placeholder="50"
                value={formData.minCartValue}
                onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
            </div>

            <div className="flex flex-col space-y-1.5 sm:col-span-2">
              <label className="text-neutral-600 dark:text-neutral-300 font-bold">Expiry Date</label>
              <input
                required
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="sm:col-span-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm mt-2"
            >
              {createCouponMutation.isPending ? 'Generating Code...' : 'Save Promotion Code'}
            </button>
          </form>
        )}

        {/* Coupons grid/table listing */}
        {isLoading ? (
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse"></div>
        ) : (
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-soft-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-[#F4F3EF]/60 dark:bg-[#1C1C20]/60 p-4 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="p-4">Promo Code</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Min Spend</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {coupons?.map((coupon: any) => (
                    <tr key={coupon.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="p-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Ticket size={15} /> {coupon.code}
                      </td>
                      <td className="p-4 text-neutral-900 dark:text-white font-semibold">
                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      </td>
                      <td className="p-4 text-neutral-500">₹{coupon.minCartValue}</td>
                      <td className="p-4 text-neutral-500">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(coupon.id)}
                          className="transition"
                          title="Toggle Status (Active/Inactive)"
                        >
                          {coupon.isActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-full font-bold text-[10px]">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1 rounded-full font-bold text-[10px]">
                              <XCircle size={10} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 transition"
                          title="Delete code"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
