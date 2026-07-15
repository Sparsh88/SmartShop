import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { ShieldAlert, KeyRound } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If email parameter is missing, send back to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error('Verification code must be exactly 6 digits');
      return;
    }

    try {
      await verifyEmail(email, code.trim());
      toast.success('Email verified successfully! Welcome to SmartShop.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed. Incorrect code.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Decorative Blur BG */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-2">
            <KeyRound size={28} />
          </div>
          <h2 className="text-3xl font-black font-display text-white">Verify Email</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            We sent a 6-digit verification code to <br />
            <strong className="text-slate-200">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold mb-1.5 text-center">Verification Code</span>
            <input
              required
              type="text"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="bg-slate-950 border border-slate-805 border-slate-800 rounded-xl p-3 text-center tracking-[8px] text-lg font-black font-display text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl flex gap-2.5 text-xs text-slate-400">
          <ShieldAlert size={16} className="text-indigo-400 shrink-0" />
          <p>
            If you did not receive the email, please check your spam folder. For local sandbox testing, check your backend server log console.
          </p>
        </div>

      </div>
    </div>
  );
}
