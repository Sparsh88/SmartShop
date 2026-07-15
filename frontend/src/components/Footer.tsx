import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              SmartShop
            </span>
            <p className="text-sm">
              Your one-stop destination for premium goods. Experience clean designs, fast shipping, and safe, encrypted checkouts.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-indigo-400 transition"><Facebook size={18} /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Twitter size={18} /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Instagram size={18} /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Github size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-indigo-400 transition">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-indigo-400 transition">Fashion</Link></li>
              <li><Link to="/products?category=home-kitchen" className="hover:text-indigo-400 transition">Home & Kitchen</Link></li>
              <li><Link to="/products?category=books" className="hover:text-indigo-400 transition">Books</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-indigo-400 transition">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400 transition">Order Tracking</Link></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Shipping Rates</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Returns & Exchanges</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-slate-100 font-semibold">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin size={16} /> 123 Tech Avenue, Silicon Valley</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Mail size={16} /> support@smartshop.com</li>
            </ul>
          </div>

        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartShop Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
