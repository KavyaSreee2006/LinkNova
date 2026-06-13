import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Link2, Mail, Lock, Sun, Moon } from 'lucide-react';

export default function Login({ navigate }) {
  const { login } = useAuth();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 grid-bg-dark text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px] pointer-events-none animate-float-2" />
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[80px] pointer-events-none animate-pulse-subtle" />

      {/* Floating Theme Switcher */}
      <div className="absolute top-5 right-5 flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10 relative">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white mb-3 shadow-lg shadow-indigo-600/30">
            <Link2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to manage your link analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400 border-t border-white/5 pt-6">
          New to LinkNova?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:underline font-semibold"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
