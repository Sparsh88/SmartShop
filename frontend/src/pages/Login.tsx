import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import api from '../services/api';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      
      if (redirectUrl === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSendingForgot(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Reset link sent! Please check your email inbox.');
      setForgotMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error requesting reset link');
    } finally {
      setIsSendingForgot(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Decorative Blur BG */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        {/* Back option in Forgot Mode */}
        {forgotMode && (
          <button
            onClick={() => setForgotMode(false)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black font-display text-white">
            {forgotMode ? 'Recover Password' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm">
            {forgotMode
              ? 'Enter email to receive password recovery details'
              : 'Enter credentials to access your SmartShop account'}
          </p>
        </div>

        {forgotMode ? (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold mb-1.5">Email Address</span>
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingForgot}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              {isSendingForgot ? 'Sending Link...' : 'Request Reset Link'}
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold mb-1.5">Email Address</span>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              {errors.email && <span className="text-rose-500 text-xs mt-1">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-500 font-bold">Password</span>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              Sign In <LogIn size={16} />
            </button>
          </form>
        )}

        {/* Form Footer */}
        {!forgotMode && (
          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-bold hover:underline">
              Create Account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
