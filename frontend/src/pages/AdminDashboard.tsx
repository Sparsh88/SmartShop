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
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-[#0D0D0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 animate-page-enter">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Store Analytics
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1">Real-time revenue metrics, inventory health, and recent customer orders.</p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* KPI Cards Grid */}
            <ScrollRevealGroup staggerDelay={0.08} delayChildren={0.02} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Revenue */}
              <ScrollRevealItem direction="up" distance={20}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl flex items-center justify-between shadow-soft-sm">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1">{formatPrice(stats?.totalRevenue)}</h3>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <IndianRupee size={22} />
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Orders */}
              <ScrollRevealItem direction="up" distance={20}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl flex items-center justify-between shadow-soft-sm">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Orders</span>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1">{stats?.totalOrders}</h3>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3.5 rounded-2xl text-neutral-900 dark:text-white">
                    <ShoppingCart size={22} />
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Customers */}
              <ScrollRevealItem direction="up" distance={20}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl flex items-center justify-between shadow-soft-sm">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Customers</span>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1">{stats?.totalUsers}</h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/60 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Users size={22} />
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Low stock alerts */}
              <ScrollRevealItem direction="up" distance={20}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl flex items-center justify-between shadow-soft-sm">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Low Stock Items</span>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1">{stats?.lowStockCount}</h3>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/60 p-3.5 rounded-2xl text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={22} />
                  </div>
                </div>
              </ScrollRevealItem>

            </ScrollRevealGroup>

            {/* Sales Progression Chart */}
            <ScrollReveal direction="up" distance={25} duration={0.6}>
              <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-soft-sm">
                <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-white mb-6">Revenue Growth Trend (Last 6 Months)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySales}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#121212" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#121212" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#161618',
                          border: '1px solid #27272a',
                          borderRadius: '16px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#121212"
                        className="dark:stroke-white"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>

            {/* Tables: Recent Orders & Stock warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Orders */}
              <ScrollReveal direction="up" distance={25} duration={0.6}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl space-y-4 shadow-soft-sm">
                  <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Package size={17} /> Recent Purchases
                  </h3>
                  
                  {recentOrders.length === 0 ? (
                    <p className="text-neutral-400 text-xs py-4">No orders placed yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase text-[10px]">
                            <th className="py-2.5">Order No</th>
                            <th className="py-2.5">Customer</th>
                            <th className="py-2.5">Method</th>
                            <th className="py-2.5 text-right">Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                          {recentOrders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                              <td className="py-3 font-semibold text-neutral-900 dark:text-white">{order.orderNumber}</td>
                              <td className="py-3 text-neutral-500">{order.user?.name}</td>
                              <td className="py-3 text-neutral-500 uppercase">{order.paymentMethod}</td>
                              <td className="py-3 text-right font-extrabold text-neutral-900 dark:text-white">{formatPrice(order.payableAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Low stock alerts */}
              <ScrollReveal direction="up" distance={25} duration={0.6}>
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-3xl space-y-4 shadow-soft-sm">
                  <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={17} className="text-amber-500" /> Stock Level Warnings
                  </h3>

                  {lowStockProducts.length === 0 ? (
                    <p className="text-neutral-400 text-xs py-4">All products have sufficient inventory.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase text-[10px]">
                            <th className="py-2.5">Product</th>
                            <th className="py-2.5">Brand</th>
                            <th className="py-2.5 text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                          {lowStockProducts.map((prod: any) => (
                            <tr key={prod.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                              <td className="py-3 font-semibold text-neutral-900 dark:text-white">{prod.name}</td>
                              <td className="py-3 text-neutral-500">{prod.brand}</td>
                              <td className="py-3 text-right font-bold text-rose-500">{prod.stock} left</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </ScrollReveal>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
