import React, { useEffect } from 'react';
import { X, CheckCircle, Info } from 'lucide-react';

const Toast = ({ id, message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 text-gray-800 dark:text-white px-4 py-3.5 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 animate-slide-in max-w-sm pointer-events-auto">
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : (
        <Info className="h-5 w-5 text-primary-500 flex-shrink-0" />
      )}
      <p className="text-sm font-semibold flex-1 leading-normal pr-2">{message}</p>
      <button 
        onClick={() => onClose(id)} 
        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
};

// Container for rendering multiple toast messages
export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
export default Toast;
