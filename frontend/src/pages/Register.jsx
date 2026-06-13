import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Link2, Mail, Lock, User as UserIcon, Sun, Moon } from 'lucide-react';

export default function Register({ navigate }) {
  const { register } = useAuth();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) return;

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold tracking-wide">Get Started</h2>
          <p className="text-slate-400 text-sm mt-1.5">Create your LinkNova dashboard account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400 border-t border-white/5 pt-4">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:underline font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
