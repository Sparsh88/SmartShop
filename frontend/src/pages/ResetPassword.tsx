import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../store/toastStore';
import api from '../services/api';
import { Lock, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetFields = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFields) => {
    if (!token) return;
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired password reset link');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <ScrollReveal direction="up" distance={25} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-10 rounded-3xl shadow-soft-sm space-y-6 relative">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Security
            </span>
            <h2 className="font-editorial text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Reset Password
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Please enter and confirm your new account password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Password */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">New Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              </div>
              {errors.password && <span className="text-rose-500 text-xs">{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Confirm Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              </div>
              {errors.confirmPassword && <span className="text-rose-500 text-xs">{errors.confirmPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-pill-arrow group justify-between px-6 py-3.5 shadow-soft-md disabled:opacity-50 mt-2"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>
          </form>

        </div>
      </ScrollReveal>
    </div>
  );
}
