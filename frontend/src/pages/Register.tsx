import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { Mail, Lock, User, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Ensure fields always start completely empty on page load
  useEffect(() => {
    reset({ name: '', email: '', password: '' });
  }, [reset]);

  const onSubmit = async (data: RegisterFields) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful! You can now sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <ScrollReveal direction="up" distance={25} duration={0.6} className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 p-8 sm:p-10 rounded-3xl shadow-soft-sm space-y-6 relative">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Join SmartShop
            </span>
            <h2 className="font-editorial text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Sign up today and receive exclusive access to capsule drops & private sales.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
            {/* Decoy fields to capture aggressive browser autofill */}
            <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {/* Full Name */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Full Name</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your name"
                  autoComplete="off"
                  {...register('name')}
                  className="w-full bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              </div>
              {errors.name && <span className="text-rose-500 text-xs">{errors.name.message}</span>}
            </div>

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
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Create a password"
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
              <div className="arrow-circle">
                <ArrowUpRight size={16} />
              </div>
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-neutral-900 dark:text-white underline underline-offset-2 hover:opacity-75 transition">
              Sign In
            </Link>
          </div>

        </div>
      </ScrollReveal>
    </div>
  );
}
