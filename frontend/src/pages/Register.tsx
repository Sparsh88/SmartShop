import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

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
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

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
      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-8 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Decorative Blur BG */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black font-display text-white">Create Account</h2>
          <p className="text-slate-400 text-sm">Join SmartShop to purchase premium items</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold mb-1.5">Full Name</span>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
            {errors.name && <span className="text-rose-500 text-xs mt-1">{errors.name.message}</span>}
          </div>

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
            <span className="text-xs text-slate-500 font-bold mb-1.5">Password</span>
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
            Create Account <UserPlus size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
