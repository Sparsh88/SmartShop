import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { TableSkeleton } from '../components/LoaderSkeletons';
import { Percent, Trash2, Plus, Calendar, Save } from 'lucide-react';

const AdminCoupons = ({ onToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // percentage or fixed
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons/admin');
      setCoupons(data);
    } catch (err) {
      console.error(err.message);
      onToast('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      onToast('Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      onToast('Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || !expiryDate) return;

    setSubmitting(true);
    try {
      await api.post('/coupons', {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase || 0),
        maxDiscount: Number(maxDiscount || 0),
        expiryDate
      });
      onToast('Coupon created successfully! 🎟️');
      setCode('');
      setDiscountValue('');
      setMinPurchase('');
      setMaxDiscount('');
      setExpiryDate('');
      fetchCoupons();
    } catch (err) {
      onToast(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* List coupons Left */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Manage Coupons</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">View active promotional codes and manage cart thresholds</p>
        </div>

        {loading && coupons.length === 0 ? (
          <TableSkeleton cols={4} />
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-750 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-750 text-gray-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-750">
                  {coupons.map(cop => (
                    <tr key={cop._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="p-4 font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Percent className="h-4.5 w-4.5 text-primary-500" />
                        <span>{cop.code}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900 dark:text-white font-extrabold">
                          {cop.discountType === 'percentage' ? `${cop.discountValue}%` : `₹${cop.discountValue}`} OFF
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Min spend: ₹{cop.minPurchase}</p>
                      </td>
                      <td className="p-4 flex items-center gap-1 mt-1 text-gray-450">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(cop.expiryDate).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(cop._id)}
                          className="p-2 border border-red-200 dark:border-slate-700 hover:bg-red-50 rounded-lg text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form right */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4 h-fit">
        <h3 className="font-extrabold text-sm flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary-500" /> Create Coupon Code
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-500">
          <div className="space-y-1.5">
            <label className="text-gray-400">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. SMART20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl uppercase text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-gray-400">Discount type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat (₹)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-400">Value</label>
              <input
                type="number"
                placeholder="Value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-gray-400">Min Purchase (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-400">Max Discount (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-slate-905 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-1.5"
          >
            <Save className="h-4 w-4" /> {submitting ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminCoupons;
