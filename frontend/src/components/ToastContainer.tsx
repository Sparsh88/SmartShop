import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../store/toastStore';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800/50 text-emerald-200'
                : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-800/50 text-rose-200'
                  : 'bg-indigo-950/90 border-indigo-800/50 text-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <XCircle size={20} className="text-rose-400 shrink-0" />}
              {toast.type === 'info' && <AlertCircle size={20} className="text-indigo-400 shrink-0" />}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
