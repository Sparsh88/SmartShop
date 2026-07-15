import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-xl text-center space-y-6 relative overflow-hidden">
        
        {/* Animated Background Gradients */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="inline-flex p-5 rounded-full bg-indigo-500/10 text-indigo-400">
          <ShieldAlert size={48} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black font-display text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-slate-400 text-sm">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105 active:scale-95"
        >
          <Home size={16} /> Back to Homepage
        </Link>

      </div>
    </div>
  );
}
