import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout({ currentPath, navigate, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 grid-bg-light dark:grid-bg-dark transition-colors duration-200 relative overflow-hidden">
      
      {/* Dynamic Glowing Mesh Orbs (Hover & Drift Animation) */}
      <div className="absolute top-[5%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[100px] pointer-events-none animate-float-1 z-0" />
      <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] rounded-full bg-purple-500/10 dark:bg-purple-600/12 blur-[110px] pointer-events-none animate-float-2 z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-400/8 dark:bg-cyan-500/10 blur-[90px] pointer-events-none animate-float-3 z-0" />
      
      <Sidebar 
        currentPath={currentPath} 
        navigate={navigate} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <TopNav 
          currentPath={currentPath} 
          navigate={navigate} 
          setIsMobileOpen={setIsMobileOpen} 
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
