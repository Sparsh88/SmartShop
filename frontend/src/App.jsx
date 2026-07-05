import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import { ToastContainer } from './components/Toast';

// Page Imports
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Page Imports
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCoupons from './pages/AdminCoupons';
import AdminUsers from './pages/AdminUsers';

// Layout containing Navigation & Footers
const StoreLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <ChatAssistant />
      <Footer />
    </div>
  );
};

function App() {
  const [toasts, setToasts] = useState([]);

  // Toast helper function
  const triggerToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleCloseToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Router>
      {/* Dynamic Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />

      <Routes>
        {/* Customer Store Routes */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home onToast={triggerToast} />} />
          <Route path="/shop" element={<Shop onToast={triggerToast} />} />
          <Route path="/product/:id" element={<ProductDetails onToast={triggerToast} />} />
          <Route path="/cart" element={<Cart onToast={triggerToast} />} />
          <Route path="/wishlist" element={<Wishlist onToast={triggerToast} />} />
          <Route path="/checkout" element={<Checkout onToast={triggerToast} />} />
          <Route path="/profile" element={<Profile onToast={triggerToast} />} />
          <Route path="/orders" element={<Orders onToast={triggerToast} />} />
          <Route path="/login" element={<Login onToast={triggerToast} />} />
          <Route path="/register" element={<Register onToast={triggerToast} />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Administrative Backend Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts onToast={triggerToast} />} />
          <Route path="orders" element={<AdminOrders onToast={triggerToast} />} />
          <Route path="coupons" element={<AdminCoupons onToast={triggerToast} />} />
          <Route path="users" element={<AdminUsers onToast={triggerToast} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
