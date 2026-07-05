import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  Sun, 
  Moon, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  Sliders, 
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
                SmartShop AI
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search products or ask AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-full pl-4 pr-10 py-2 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all duration-200"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-primary-500 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Action Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/shop" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 font-medium text-sm transition-colors">
              Shop
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 relative transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 relative transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full border border-primary-500 object-cover" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 border border-primary-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-slate-700 z-20 transition-all duration-200">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link 
                        to="/profile" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </Link>

                      <Link 
                        to="/orders" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ClipboardList className="h-4 w-4" />
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-full font-medium text-sm shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/cart" className="p-2 text-gray-500 dark:text-gray-400 relative">
              <ShoppingBag className="h-5 w-5" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-all duration-300 py-4 px-4 space-y-4 shadow-lg">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products or ask AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-full pl-4 pr-10 py-2 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col space-y-3 font-medium">
            <Link 
              to="/shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 py-1 transition-colors"
            >
              Shop Inventory
            </Link>
            <Link 
              to="/wishlist" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 py-1 flex justify-between items-center transition-colors"
            >
              My Wishlist
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>
            </Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-500 py-1 flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Control Panel
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 py-1 flex items-center gap-2 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  My Profile
                </Link>
                <Link 
                  to="/orders" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 py-1 flex items-center gap-2 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left text-red-600 dark:text-red-400 py-2 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-primary-500 hover:bg-primary-600 text-white text-center py-2.5 rounded-full font-bold shadow-md shadow-primary-500/20 block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
