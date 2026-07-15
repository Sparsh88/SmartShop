import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../store/toastStore';
import api from '../services/api';
import { Lock, Check } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Decorative Blur BG */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black font-display text-white">Reset Password</h2>
          <p className="text-slate-400 text-sm">Please set your new account password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Password */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold mb-1.5">New Password</span>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
            {errors.password && <span className="text-rose-500 text-xs mt-1">{errors.password.message}</span>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold mb-1.5">Confirm Password</span>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
            {errors.confirmPassword && <span className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            Update Password <Check size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
