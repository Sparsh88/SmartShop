import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { Plus, Ticket, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-slate-950 animate-page-enter">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-3xl font-black font-display text-white">Manage Coupons</h1>
            <p className="text-slate-400 text-sm mt-1">Configure checkout promotion codes, discount rates, and minimum baskets.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-1.5 transition"
          >
            <Plus size={16} /> Add Coupon
          </button>
        </div>

        {/* Create Coupon inline form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold mb-1">Coupon Code</span>
              <input
                required
                type="text"
                placeholder="WELCOME10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white uppercase focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-slate-500 font-bold mb-1">Discount Type</span>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-slate-500 font-bold mb-1">Discount Value</span>
              <input
                required
                type="number"
                placeholder="10"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-slate-500 font-bold mb-1">Min Purchase Required (₹)</span>
              <input
                type="number"
                placeholder="50"
                value={formData.minCartValue}
                onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-slate-500 font-bold mb-1">Expiry Date</span>
              <input
                required
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
            >
              {createCouponMutation.isPending ? 'Generating Code...' : 'Save Promotion Code'}
            </button>
          </form>
        )}

        {/* Coupons grid/table listing */}
        {isLoading ? (
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 p-4 text-slate-500 font-bold uppercase">
                    <th className="p-4">Promo Code</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Min Spend</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {coupons?.map((coupon: any) => (
                    <tr key={coupon.id} className="hover:bg-slate-950/20 transition">
                      <td className="p-4 font-bold text-indigo-400 flex items-center gap-1.5">
                        <Ticket size={14} /> {coupon.code}
                      </td>
                      <td className="p-4 text-slate-200 font-semibold">
                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      </td>
                      <td className="p-4 text-slate-400">₹{coupon.minCartValue}</td>
                      <td className="p-4 text-slate-400">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(coupon.id)}
                          className="transition"
                          title="Toggle Status (Active/Inactive)"
                        >
                          {coupon.isActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-bold text-[10px]">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded font-bold text-[10px]">
                              <XCircle size={10} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-slate-500 hover:text-rose-500 transition"
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
