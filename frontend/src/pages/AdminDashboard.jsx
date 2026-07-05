import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { DashboardSkeleton } from '../components/LoaderSkeletons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { IndianRupee, ShoppingBag, Users, ClipboardList, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/analytics');
        setData(data);
      } catch (error) {
        console.error('Failed to load analytics dashboard:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    { name: 'Total Revenue', value: `₹${data?.totalRevenue?.toLocaleString() || 0}`, icon: <IndianRupee className="h-6 w-6 text-green-500" /> },
    { name: 'Total Orders', value: data?.totalOrders || 0, icon: <ClipboardList className="h-6 w-6 text-indigo-500" /> },
    { name: 'Active Users', value: data?.totalUsers || 0, icon: <Users className="h-6 w-6 text-sky-500" /> },
    { name: 'Total Products', value: data?.totalProducts || 0, icon: <ShoppingBag className="h-6 w-6 text-pink-500" /> }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Analytics Overview</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Review monthly income, sales stats, and inventory warnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{card.name}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</h3>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Area Chart: Monthly Revenue */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Monthly Sales Revenue</h3>
          <div className="h-72 w-full text-xs font-semibold text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlySales || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Category Sales volume */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Item Performance (Sales count)</h3>
          <div className="h-72 w-full text-xs font-semibold text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categorySales || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Units Sold']} />
                <Legend />
                <Bar dataKey="sales" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Volume Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid listing Warnings & Tops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top-Selling Products list */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Top Performing Items</h3>
          <div className="divide-y divide-gray-100 dark:divide-slate-750">
            {data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map(prod => (
                <div key={prod._id} className="py-3 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <img src={prod.images[0]} alt="" className="w-8 h-8 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-gray-900 dark:text-white line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{prod.brand} • {prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-black">{prod.purchaseCount} sales</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Stock: {prod.stock} left</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-4">No product purchases recorded yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Warnings list */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Low Stock Warnings</h3>
          <div className="divide-y divide-gray-100 dark:divide-slate-750">
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map(prod => (
                <div key={prod._id} className="py-3 flex justify-between items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-gray-900 dark:text-white line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-gray-450 mt-0.5">Brand: {prod.brand} • Cat: {prod.category}</p>
                    </div>
                  </div>
                  <span className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/50 text-[10px] font-black px-2.5 py-1 rounded-full">
                    {prod.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-4">All catalog items satisfy threshold quantities. Good job! 👍</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
