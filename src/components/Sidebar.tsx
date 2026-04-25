import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon,
  AlertCircle, 
  History, 
  Settings, 
  BarChart3, 
  Terminal,
  Activity,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import SystemControls from './SystemControls';
import VisitCounter from './VisitCounter';

interface SidebarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'white' | 'purple';
  setTheme: (theme: 'dark' | 'white' | 'purple') => void;
  onClose?: () => void;
}

export default function Sidebar({ role, setRole, theme, setTheme, onClose }: SidebarProps) {
  const isAdmin = role === 'Admin';
  const isGuest = role === 'Guest';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MapIcon, label: 'Tactical Map', path: '/map' },
    { icon: AlertCircle, label: 'Active Incidents', path: '/incidents', hideForGuest: true },
    { icon: Activity, label: 'System Timeline', path: '/timeline', hideForGuest: true },
    { icon: BarChart3, label: 'Analytical Reports', path: '/reports', hideForGuest: true },
    { icon: History, label: 'Incident History', path: '/history', hideForGuest: true },
    { icon: Settings, label: 'Simulation_Center', path: '/simulation', hideForGuest: true },
  ].filter(item => {
    if (item.hideForGuest && isGuest) return false;
    return true;
  });

  return (
    <aside className="w-full h-full border-r border-border-primary bg-bg-primary flex flex-col relative transition-all duration-300">
      <div className="p-6 border-b border-border-primary shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-accent-primary" />
          <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">Navigation_System</span>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 bg-bg-secondary/50 border border-border-primary rounded-full text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose?.()}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-6 py-4 text-sm font-mono transition-all relative group",
              isActive 
                ? "text-accent-primary bg-accent-primary/5 border-r-2 border-accent-primary" 
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <item.icon className="w-4 h-4 transition-colors" />
            <span className="uppercase tracking-widest text-[11px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-border-primary flex flex-col gap-6 bg-bg-secondary/30">
        <div className="flex flex-col gap-4">
          <VisitCounter />
          <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">System_Controls</span>
          <SystemControls 
            role={role} 
            setRole={(r) => { setRole(r); onClose?.(); }} 
            theme={theme} 
            setTheme={(t) => { setTheme(t); onClose?.(); }} 
          />
        </div>

        <div className="p-4 rounded-sm border bg-accent-primary/5 border-accent-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-accent-primary" />
            <span className="text-[9px] font-mono uppercase font-bold text-accent-primary">System_Secure</span>
          </div>
          <p className="text-[8px] font-mono text-text-secondary leading-relaxed uppercase">
            All nodes operational. Encrypted link established with Central Command.
          </p>
        </div>
      </div>
    </aside>
  );
}
