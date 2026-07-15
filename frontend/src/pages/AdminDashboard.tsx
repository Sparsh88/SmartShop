import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { IndianRupee, ShoppingCart, Users, AlertTriangle, Package } from 'lucide-react';
import { formatPrice } from '../utils/priceHelper';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
  });

  const stats = data?.stats;
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const monthlySales = data?.monthlySales || [];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 bg-slate-950 animate-page-enter">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Console Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time metrics, product stock updates, and sales reports.</p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Revenue */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Revenue</span>
                  <h3 className="text-2xl font-black text-white mt-1">{formatPrice(stats?.totalRevenue)}</h3>
                </div>
                <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-400">
                  <IndianRupee size={22} />
                </div>
              </div>

              {/* Orders */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Orders</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats?.totalOrders}</h3>
                </div>
                <div className="bg-indigo-500/10 p-3.5 rounded-xl text-indigo-400">
                  <ShoppingCart size={22} />
                </div>
              </div>

              {/* Customers */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customers</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats?.totalUsers}</h3>
                </div>
                <div className="bg-blue-500/10 p-3.5 rounded-xl text-blue-400">
                  <Users size={22} />
                </div>
              </div>

              {/* Low stock alerts */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Low Stock Items</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats?.lowStockCount}</h3>
                </div>
                <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-400">
                  <AlertTriangle size={22} />
                </div>
              </div>

            </div>

            {/* Sales Progression Chart */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6">Revenue Growth (Last 6 Months)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySales}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tables: Recent Orders & Stock warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Orders */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package size={18} className="text-indigo-400" /> Recent Purchases
                </h3>
                
                {recentOrders.length === 0 ? (
                  <p className="text-slate-500 text-sm">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                          <th className="py-2.5">No</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Method</th>
                          <th className="py-2.5 text-right">Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {recentOrders.map((order: any) => (
                          <tr key={order.id}>
                            <td className="py-3 font-semibold text-slate-200">{order.orderNumber}</td>
                            <td className="py-3 text-slate-400">{order.user?.name}</td>
                            <td className="py-3 text-slate-400 uppercase">{order.paymentMethod}</td>
                            <td className="py-3 text-right font-bold text-indigo-400">{formatPrice(order.payableAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" /> Restock Notifications
                </h3>
                
                {lowStockProducts.length === 0 ? (
                  <p className="text-emerald-400 text-sm">All inventory is fully stocked!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                          <th className="py-2.5">Product Name</th>
                          <th className="py-2.5">Brand</th>
                          <th className="py-2.5 text-center">Remaining Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {lowStockProducts.map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-3 font-semibold text-slate-200 line-clamp-1">{p.name}</td>
                            <td className="py-3 text-slate-400">{p.brand}</td>
                            <td className="py-3 text-center">
                              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/25 px-2 py-0.5 rounded font-bold">
                                {p.stock} units
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
