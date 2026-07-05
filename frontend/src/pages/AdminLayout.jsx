import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, ClipboardList, Percent, Users, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const links = [
    { name: 'Analytics', path: '/admin', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag className="h-4.5 w-4.5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList className="h-4.5 w-4.5" /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Percent className="h-4.5 w-4.5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="h-4.5 w-4.5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex flex-col md:flex-row transition-colors">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-r border-gray-150 dark:border-slate-850 p-6 space-y-8 flex-shrink-0">
        <div className="space-y-2">
          <Link to="/" className="text-gray-500 hover:text-primary-500 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Store
          </Link>
          <h2 className="text-xl font-black text-gray-905 dark:text-white pt-2">Admin Control</h2>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-none">
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Admin nested route content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
