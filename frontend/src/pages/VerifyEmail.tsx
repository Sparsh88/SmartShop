import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { ShieldAlert, KeyRound, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <ScrollReveal direction="up" distance={25} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-10 rounded-3xl shadow-soft-sm space-y-6 relative">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-900 dark:text-white flex items-center justify-center mx-auto mb-2">
              <KeyRound size={26} />
            </div>
            <h2 className="font-editorial text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Verify Email</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              We sent a 6-digit verification code to <br />
              <strong className="text-neutral-900 dark:text-white font-bold">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block text-center">6-Digit Code</span>
              <input
                required
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-3.5 text-center tracking-[10px] text-xl font-black font-editorial text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full btn-pill-arrow group justify-between px-6 py-3.5 shadow-soft-md disabled:opacity-50"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>
          </form>

          <div className="bg-[#F4F3EF] dark:bg-[#1E1E22] p-4 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl flex gap-2.5 text-xs text-neutral-500">
            <ShieldAlert size={16} className="text-neutral-900 dark:text-white shrink-0 mt-0.5" />
            <p className="text-[11px]">
              If you didn't receive the email, please check your spam folder or review the backend server log console.
            </p>
          </div>

        </div>
      </ScrollReveal>
    </div>
  );
}
