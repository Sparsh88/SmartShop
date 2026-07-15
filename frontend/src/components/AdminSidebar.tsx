import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Users,
  Ticket,
  ArrowLeft,
} from 'lucide-react';

export default function AdminSidebar() {
  const activeClass = 'flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-indigo-600 font-semibold transition';
  const inactiveClass = 'flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col min-h-[calc(100vh-4rem)] p-4 space-y-6">
      
      {/* Label */}
      <div className="px-4">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
          Admin Management
        </h3>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 flex flex-col gap-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <ShoppingBag size={20} />
          Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <ListOrdered size={20} />
          Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <Users size={20} />
          Users
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <Ticket size={20} />
          Coupons
        </NavLink>
      </nav>

      {/* Back link */}
      <div className="border-t border-slate-800 pt-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </NavLink>
      </div>

    </aside>
  );
}
