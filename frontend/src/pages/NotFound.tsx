import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <ScrollReveal direction="up" distance={25} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-10 rounded-3xl shadow-soft-sm text-center space-y-6 relative">
          
          <div className="w-20 h-20 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-900 dark:text-white flex items-center justify-center mx-auto">
            <ShieldAlert size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">404 Error</span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Page Not Found</h1>
            <p className="text-neutral-500 text-xs sm:text-sm">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-soft-sm transition"
          >
            Back to Homepage <ArrowUpRight size={15} />
          </Link>

        </div>
      </ScrollReveal>
    </div>
  );
}
