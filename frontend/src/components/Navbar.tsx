import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  Bell,
  X,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems, fetchCart } = useCartStore();
  const { products: wishlistItems, fetchWishlist } = useWishlistStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // System theme preference listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch cart & wishlist on auth state change
  useEffect(() => {
    fetchCart(isAuthenticated);
    fetchWishlist(isAuthenticated);
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-header shadow-soft-sm py-0'
          : 'bg-[#FAF9F6]/95 dark:bg-[#0D0D0E]/95 backdrop-blur-md border-b border-neutral-200/70 dark:border-neutral-800/70 py-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-8">
          
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center group">
              <span className="font-editorial text-xl sm:text-3xl font-black tracking-tight text-[#121212] dark:text-[#FAF9F6] uppercase">
                SMARTSHOP
              </span>
            </Link>
          </div>

          {/* 2. Center: Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-200/80 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-full py-2.5 pl-10 pr-10 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all shadow-inner-sm"
              />
              <Search size={15} className="absolute left-3.5 top-3 text-neutral-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* 3. Right: Theme, Wishlist, Cart, Admin (if admin), Profile */}
          <div className="flex items-center gap-0.5 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-1.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition"
              title="Search"
              aria-label="Toggle Search Bar"
            >
              <Search size={18} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition spring-active"
              title="Toggle Dark/Light Mode"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-1.5 sm:p-2.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition spring-active"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={19} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition spring-active"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={19} />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-[#121212] text-[#FAF9F6] dark:bg-[#FAF9F6] dark:text-[#121212] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Admin Badge Button (Only if user is logged in as ADMIN) */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-[11px] font-bold uppercase tracking-wider px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition shadow-soft-xs spring-active shrink-0"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Profile Dropdown / Sign In Button */}
            {isAuthenticated ? (
              <div className="relative shrink-0">
                {isProfileOpen && (
                  <div
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative z-40 flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full border border-neutral-300/80 dark:border-neutral-700 hover:border-neutral-400 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition bg-white/70 dark:bg-neutral-900/70 spring-active shadow-soft-xs"
                  aria-label="User Profile"
                  title="User Account Menu"
                >
                  <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs sm:text-[10px] font-bold shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[80px] sm:max-w-[100px] truncate font-medium text-xs">
                    {user?.name}
                  </span>
                  <ChevronDown size={13} className="text-neutral-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-soft-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-200 max-w-[calc(100vw-2rem)]">
                    <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
                      >
                        <LayoutDashboard size={15} />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
                    >
                      <User size={15} />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition"
                    >
                      <Bell size={15} />
                      My Orders
                    </Link>

                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-left"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 sm:gap-2 bg-[#121212] hover:bg-black dark:bg-[#FAF9F6] dark:hover:bg-neutral-200 text-[#FAF9F6] dark:text-[#121212] px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition shadow-sm spring-active shrink-0 whitespace-nowrap"
              >
                <User size={13} className="sm:hidden" />
                <span>Sign In</span>
              </Link>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Dropdown (Visible only when toggled on small screens) */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-4 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                autoFocus
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300 dark:border-neutral-700 rounded-full py-2.5 pl-10 pr-4 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              />
              <Search size={15} className="absolute left-3.5 top-3 text-neutral-400" />
            </form>
          </div>
        )}

      </div>
    </header>
  );
}
