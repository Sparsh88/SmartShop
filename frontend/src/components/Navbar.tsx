import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Bell,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems, fetchCart } = useCartStore();
  const { products: wishlistItems, fetchWishlist } = useWishlistStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dark Mode Toggle Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0a0a0a';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch cart & wishlist on login
  useEffect(() => {
    fetchCart(isAuthenticated);
    fetchWishlist(isAuthenticated);
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Text/icon color adapts to theme + scroll state
  const isLightTop = theme === 'light' && !scrolled;  // light mode, at top
  const isLightScrolled = theme === 'light' && scrolled; // light mode, scrolled
  const textCol = (isLightTop || isLightScrolled) ? 'text-slate-900' : 'text-white';
  const iconCol = (isLightTop || isLightScrolled)
    ? 'text-slate-700 hover:text-orange-500'
    : 'text-white/80 hover:text-orange-400';
  const inputCls = (isLightTop || isLightScrolled)
    ? 'w-full bg-white/80 border border-slate-300 rounded-full py-1.5 pl-4 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition'
    : 'w-full bg-white/10 backdrop-blur border border-white/20 rounded-full py-1.5 pl-4 pr-10 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'light'
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-md'
            : 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* Shopping Bag Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className={`text-2xl font-black tracking-tight ${textCol} transition-colors duration-300`}>
                SmartShop
              </span>
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={inputCls}
              />
              <button type="submit" className={`absolute right-3 top-2 transition ${
                (isLightTop || isLightScrolled) ? 'text-slate-400 hover:text-orange-500' : 'text-white/60 hover:text-orange-400'
              }`}>
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Right Action Icons - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`${iconCol} transition spring-active`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className={`relative ${iconCol} transition spring-active`}>
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className={`relative ${iconCol} transition spring-active`}>
              <ShoppingCart size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Admin Panel Link */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3.5 py-2 rounded-full transition spring-active flex items-center gap-1.5"
                title="Go to Admin Panel"
              >
                <LayoutDashboard size={14} />
                Admin Panel
              </Link>
            )}

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                {/* Click outside overlay to dismiss dropdown menu */}
                {isProfileOpen && (
                  <div 
                    className="fixed inset-0 z-30 cursor-default" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`relative z-40 flex items-center gap-1.5 ${iconCol} transition focus:outline-none spring-active`}
                >
                  <User size={20} />
                  <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown size={14} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-40">
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Bell size={16} />
                      Order History
                    </Link>
                    <hr className="border-slate-200 dark:border-slate-800 my-1" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition spring-active shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-600 dark:text-slate-300 transition"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/cart" className="relative text-slate-600 dark:text-slate-300 transition">
              <ShoppingCart size={18} />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-3 bg-white dark:bg-slate-950">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full my-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="absolute right-3 top-2 text-slate-400">
              <Search size={16} />
            </button>
          </form>

          <Link
            to="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500"
          >
            All Products
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500"
          >
            Wishlist ({wishlistItems.length})
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-indigo-500"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500"
              >
                Order History
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 w-full text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block bg-indigo-600 text-white text-center py-2 rounded-full text-sm font-semibold"
            >
              Sign In
            </Link>
          )}

        </div>
      )}
    </nav>
  );
}
