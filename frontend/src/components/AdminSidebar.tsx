import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Users,
  Ticket,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  const { logout } = useAuthStore();
  const activeClass = 'flex items-center gap-3 px-4 py-3 rounded-2xl text-white dark:text-neutral-950 bg-[#121212] dark:bg-white text-xs uppercase tracking-wider font-bold shadow-soft-sm transition';
  const inactiveClass = 'flex items-center gap-3 px-4 py-3 rounded-2xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs uppercase tracking-wider font-bold transition';

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#161618] border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800 flex flex-col md:min-h-[calc(100vh-5rem)] p-4 space-y-6 shrink-0 transition-colors duration-300">
      
      {/* Label */}
      <div className="px-4 pt-2">
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
          Admin Portal
        </h3>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <NavLink
          to="/admin"
          end
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <ShoppingBag size={18} />
          Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <ListOrdered size={18} />
          Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <Users size={18} />
          Users
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }: { isActive: boolean }) => (isActive ? activeClass : inactiveClass)}
        >
          <Ticket size={18} />
          Coupons
        </NavLink>
      </nav>

      {/* Back link & Logout */}
      <div className="border-t border-neutral-200/80 dark:border-neutral-800 pt-4 space-y-1.5">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs uppercase tracking-wider font-bold transition"
        >
          <ArrowLeft size={16} />
          Back to Store
        </NavLink>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs uppercase tracking-wider font-bold transition text-left"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

    </aside>
  );
}
