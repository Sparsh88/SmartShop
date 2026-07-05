import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

const Login = ({ onToast }) => {
  const { login, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate(redirect ? `/${redirect}` : '/admin');
      } else {
        navigate(redirect ? `/${redirect}` : '/');
      }
    }
  }, [user, navigate, redirect]);

  // Handle standard login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      onToast('Welcome back to SmartShop AI! 👋');
    } catch (err) {
      onToast(err || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  // Configure Google Sign-in (Google Identity Services)
  useEffect(() => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Placeholder client ID
          callback: handleGoogleCallback
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } catch (err) {
        console.error('Google Sign In initialization failed:', err);
      }
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    try {
      // Decode credential base64 to extract name, email, avatar for demo
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      await googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        profilePic: decoded.picture
      });
      onToast('Logged in via Google! 🌐');
    } catch (err) {
      onToast('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Mock Google Login click for testing/recruiter evaluation
  const handleMockGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin({
        email: 'jane.oauth@example.com',
        name: 'Jane Google Oauth',
        googleId: 'google_mock_id_10203040',
        profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
      });
      onToast('Simulated Google Login Successful! 🌐');
    } catch (err) {
      onToast('Mock login failed');
    } finally {
      setLoading(false);
    }
  };

  // Mock Admin Quick Login
  const handleAdminQuickLogin = async () => {
    setLoading(true);
    try {
      await login('admin@smartshop.com', 'admin123');
      onToast('Logged in as SmartShop Admin! Welcome to control board. 👑');
    } catch (err) {
      onToast(err || 'Failed to authenticate as Admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-gray-400">Sign in to your SmartShop account to place orders</p>
        </div>

        {/* Local Credential Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-3 pl-10 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-3 pl-10 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 pt-3"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center text-xs text-gray-400">
          <div className="flex-grow border-t border-gray-100 dark:border-slate-750"></div>
          <span className="flex-shrink mx-4">or continue with</span>
          <div className="flex-grow border-t border-gray-100 dark:border-slate-750"></div>
        </div>

        {/* Google Authentication Options */}
        <div className="space-y-2.5">
          <div id="google-btn" className="w-full min-h-[40px]"></div>
          
          <button
            onClick={handleMockGoogleLogin}
            className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900 dark:hover:bg-slate-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" /> Simulate Google Sign-in
          </button>
          
          <button
            onClick={handleAdminQuickLogin}
            className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-slate-950 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            👑 Quick Login as Admin
          </button>
        </div>

        <div className="text-center text-xs text-gray-400">
          New to SmartShop?{' '}
          <Link to="/register" className="text-primary-500 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
