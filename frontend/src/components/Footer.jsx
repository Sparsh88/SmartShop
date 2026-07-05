import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
              SmartShop AI
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Experience the next generation of e-commerce. Powered by Gemini AI for smart recommendations, context-aware queries, and visual image searching.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors"><Github className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop?category=Laptops" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Laptops</Link>
              </li>
              <li>
                <Link to="/shop?category=Shoes" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Running Shoes</Link>
              </li>
              <li>
                <Link to="/shop?category=Headphones" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Wireless Headphones</Link>
              </li>
              <li>
                <Link to="/shop?category=Furniture" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Office Furniture</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support & Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>123 Startup Hub, Bangalore, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>support@smartshopai.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Subscribe to receive updates on trending items, flash sales, and coupons!
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm flex-1"
              />
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Join
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-green-600 dark:text-green-400 animate-pulse font-medium">
                Thank you for subscribing! Check your inbox soon. 🎉
              </p>
            )}
          </div>

        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 dark:text-gray-500">
          <p>© 2026 SmartShop AI. All rights reserved. Designed for recruiters and portfolio showcase.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
