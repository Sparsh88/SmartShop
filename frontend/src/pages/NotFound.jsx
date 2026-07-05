import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
      <div className="h-16 w-16 bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <HelpCircle className="h-8 w-8 animate-bounce" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-primary-500">404</h1>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          The requested page is missing or has been relocated. Explore our catalogs or use the AI Assistant helper to navigate the store.
        </p>
      </div>
      <Link
        to="/"
        className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 max-w-[200px] mx-auto hover:scale-105 transition-transform"
      >
        <ArrowLeft className="h-4 w-4" /> Back to SmartShop
      </Link>
    </div>
  );
};

export default NotFound;
