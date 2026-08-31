import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { LogIn, Mail, Lock } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast.success('Successfully logged in!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <ScrollReveal direction="up" distance={30} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
          
          {/* Decorative Blur BG */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black font-display text-white">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm">
              Enter credentials to access your SmartShop account
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold mb-1.5">Email Address</span>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              {errors.email && <span className="text-rose-500 text-xs mt-1">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-500 font-bold">Password</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              {errors.password && <span className="text-rose-500 text-xs mt-1">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.99]"
            >
              Sign In <LogIn size={16} />
            </button>
          </form>

          {/* Form Footer */}
          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-400 font-bold hover:underline">
              Create Account
            </Link>
          </div>

        </div>
      </ScrollReveal>
    </div>
  );
}
