import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { LogIn, Mail, Lock, ArrowUpRight } from 'lucide-react';
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
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Ensure fields always start completely empty on page load
  useEffect(() => {
    reset({ email: '', password: '' });
  }, [reset]);

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
      <ScrollReveal direction="up" distance={25} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-10 rounded-3xl shadow-soft-sm space-y-6 relative">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Access Your Account
            </span>
            <h2 className="font-editorial text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Enter your credentials to manage orders, wishlist & profile.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
            {/* Decoy fields to capture aggressive browser autofill */}
            <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            
            {/* Email */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Email Address</span>
              <div className="relative">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  autoComplete="off"
                  {...register('email')}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              </div>
              {errors.email && <span className="text-rose-500 text-xs">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Password</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              </div>
              {errors.password && <span className="text-rose-500 text-xs">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-pill-arrow group justify-between px-6 py-3.5 shadow-soft-md disabled:opacity-50 mt-2"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>
          </form>

          {/* Form Footer */}
          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-75 transition">
              Create an Account
            </Link>
          </div>

        </div>
      </ScrollReveal>
    </div>
  );
}
