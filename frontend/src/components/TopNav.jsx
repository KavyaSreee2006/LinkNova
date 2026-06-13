import React from 'react';
import { Menu, Link2, Plus } from 'lucide-react';

export default function TopNav({ currentPath, navigate, setIsMobileOpen }) {
  const getPageTitle = () => {
    if (currentPath === '/dashboard') return 'Dashboard';
    if (currentPath.startsWith('/analytics/')) return 'Analytics Detail';
    if (currentPath === '/create') return 'Create Link';
    if (currentPath === '/settings') return 'Settings';
    return 'LinkNova';
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right nav controls */}
      <div className="flex items-center gap-3">
        {currentPath !== '/create' && (
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Shorten</span>
          </button>
        )}
      </div>
    </header>
  );
}
