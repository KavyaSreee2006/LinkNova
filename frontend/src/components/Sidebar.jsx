import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Link2, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ currentPath, navigate, isMobileOpen, setIsMobileOpen }) {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Shorten URL', path: '/create', icon: PlusCircle },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Link2 className="w-6 h-6 animate-pulse-subtle" />
        </div>
        <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          LinkNova
        </span>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30">
          <div className="text-sm font-semibold text-slate-200">{user.name}</div>
          <div className="text-xs text-slate-400 truncate">{user.email}</div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath.startsWith('/analytics'));
          return (
            <button
              key={item.name}
              onClick={() => handleNav(item.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
        >
          {isDark ? (
            <>
              <Sun className="w-5 h-5 text-amber-400" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-400" />
              Dark Mode
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-xs h-full flex flex-col z-10 animate-slide-in">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-[-45px] p-2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
