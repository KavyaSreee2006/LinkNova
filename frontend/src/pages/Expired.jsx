import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link2, Clock, ArrowRight, Sun, Moon } from 'lucide-react';

export default function Expired() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 grid-bg-dark text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[100px] pointer-events-none animate-float-2" />

      {/* Floating Theme Switcher */}
      <div className="absolute top-5 right-5 flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl z-10 relative">
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2">
          <Clock className="w-8 h-8 animate-pulse-subtle" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-wide text-rose-500">Link Expired</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The shortened URL you are trying to visit has reached its expiration date and is no longer active.
          </p>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <p className="text-xs text-slate-500">
            Need to shorten your own links with real-time statistics?
          </p>
          <a
            href="/"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
          >
            <span>Create Short Links</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
