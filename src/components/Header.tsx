import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Wifi, Lock, User, Menu, X as CloseIcon } from 'lucide-react';
import { UserRole } from '../types';
import SystemControls from './SystemControls';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'white' | 'purple';
  setTheme: (theme: 'dark' | 'white' | 'purple') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ role, setRole, theme, setTheme, isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const isGuest = role === 'Guest';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="cyber-panel p-2 sm:p-3 flex items-center justify-between border-b border-border-primary z-[250] transition-colors duration-500 gap-4 bg-bg-primary/80 backdrop-blur-xl">
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-tr" />
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Toggle Button - Visible on all views */}
        <button 
          onClick={toggleMobileMenu}
          className="flex p-2 hover:bg-bg-secondary rounded-lg text-text-secondary transition-all active:scale-90"
          title="Toggle Navigation"
        >
          {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* The "Attached Symbol" - Only on Desktop/Tablet Header */}
        <button 
          onClick={toggleMobileMenu}
          className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent-primary items-center justify-center text-bg-primary shrink-0 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] group"
          title="Launch Sidebar"
        >
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
        </button>

        <div className="min-w-0 ml-1 sm:ml-0">
          <h1 className="text-lg sm:text-xl font-black tracking-tighter text-text-primary uppercase italic truncate">
             {isGuest ? 'AUXILIUM' : 'AUXILIUM'}<span className="text-accent-primary">.OS</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[8px] font-mono text-accent-primary/60 uppercase tracking-[0.3em] truncate">
              {isGuest ? 'Safety Portal v5' : `Kernel v5.0.1 - ${role}_CMD`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 ml-auto">
        {/* System Stats - Tablet & Desktop only */}
        {!isGuest && (
          <div className="hidden md:flex items-center gap-4 border-l border-border-primary pl-4 lg:pl-6 mr-2 lg:mr-4">
            <div className="hidden lg:flex items-center gap-2 text-text-secondary">
              <Cpu className="w-3 h-3 opacity-50" />
              <span className="text-[9px] font-mono uppercase tracking-widest">Load: 12%</span>
            </div>
            <div className="flex items-center gap-2 text-accent-primary">
              <Wifi className="w-3 h-3" />
              <span className="text-[9px] font-mono uppercase tracking-widest hidden lg:inline">Link: Stable</span>
              <span className="text-[9px] font-mono uppercase tracking-widest lg:hidden">Stable</span>
            </div>
          </div>
        )}

        {/* Role/Theme Controls - Tablet & Desktop in header */}
        <div className="hidden md:block">
          <SystemControls role={role} setRole={setRole} theme={theme} setTheme={setTheme} />
        </div>

        <div className="bg-bg-secondary/50 px-2 sm:px-4 py-1 sm:py-1.5 border border-border-primary flex items-center gap-2 sm:gap-3">
          <span className="text-[9px] sm:text-xs font-mono text-accent-primary tracking-widest font-bold whitespace-nowrap">{time}</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-bg-primary flex items-center justify-center border border-border-primary/50 shrink-0">
            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
