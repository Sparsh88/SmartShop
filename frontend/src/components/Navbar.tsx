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

  return (
    <nav className="sticky top-0 z-50 glass-effect dark:glass-effect border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
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
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full py-1.5 pl-4 pr-10 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button type="submit" className="absolute right-3 top-2 text-slate-400 hover:text-indigo-500 transition">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Right Action Icons - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition spring-active"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition spring-active">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition spring-active">
              <ShoppingCart size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Admin Panel Link */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-full transition spring-active flex items-center gap-1.5"
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
                  className="relative z-40 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition focus:outline-none spring-active"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition spring-active"
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
