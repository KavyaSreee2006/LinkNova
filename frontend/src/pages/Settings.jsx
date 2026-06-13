import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, Key, Sliders, Monitor } from 'lucide-react';

export default function Settings() {
  const { user, token } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">User Profile</h3>
              <p className="text-xs text-slate-400">Your account credentials</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase">Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase">Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Preferences</h3>
              <p className="text-xs text-slate-400">Configure your workspace look and feel</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100/50 dark:border-slate-900/50">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">Dark Theme Mode</span>
                <span className="text-xs text-slate-400">Switch between dark and light workspace styles</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-indigo-500/10 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* API Keys Reference */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Key className="w-4 h-4 text-slate-500" />
              <span>Developer API Credentials</span>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-900 rounded-xl space-y-2">
              <span className="text-xs text-slate-400 block font-mono">Authorization Token (JWT Bearer)</span>
              <div className="flex items-center justify-between gap-4">
                <input
                  type="password"
                  value={token || ''}
                  readOnly
                  className="bg-transparent border-none text-xs font-mono text-slate-500 w-full focus:outline-none select-all truncate"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Use this JWT token in your curl requests: <code className="text-indigo-400 bg-indigo-500/5 px-1 py-0.5 rounded font-mono">Authorization: Bearer [token]</code>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
