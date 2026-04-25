import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon,
  AlertCircle, 
  History, 
  BarChart3, 
  Activity,
  Settings,
  Menu,
  MoreHorizontal,
  QrCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

interface MobileNavProps {
  role: UserRole;
  onOpenMore: () => void;
}

export default function MobileNav({ role, onOpenMore }: MobileNavProps) {
  const isGuest = role === 'Guest';

  const allItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: MapIcon, label: 'Map', path: '/map' },
    { icon: QrCode, label: 'Scan', path: '/scan' },
    { icon: AlertCircle, label: 'Alerts', path: '/incidents', hideForGuest: true },
    { icon: Activity, label: 'Live', path: '/timeline', hideForGuest: true },
    { icon: BarChart3, label: 'Reports', path: '/reports', hideForGuest: true },
    { icon: History, label: 'History', path: '/history', hideForGuest: true },
    { icon: Settings, label: 'Sim', path: '/simulation', adminOnly: true },
  ].filter(item => {
    if (item.adminOnly && role !== 'Admin') return false;
    if (item.hideForGuest && isGuest) return false;
    return true;
  });

  // Display only first 4 items in the bar (Home, Map, Scan, +1 for staff)
  const mainItems = allItems.slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-bg-primary/95 backdrop-blur-xl border-t border-border-primary flex items-center justify-around px-2 z-[300] md:hidden pb-safe">
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        {mainItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1.5 px-1 py-1 transition-all relative flex-1 min-w-0",
              isActive ? "text-accent-primary" : "text-text-secondary"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-accent-primary/10 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-tight truncate w-full text-center">
                  {item.label}
                </span>
                {/* Active Indicator */}
                <motion.div 
                  layoutId="mobile-nav-active"
                  className={cn(
                    "absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent-primary transition-all",
                    !isActive && "opacity-0"
                  )} 
                />
              </>
            )}
          </NavLink>
        ))}
        
        <button 
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center gap-1.5 px-1 py-1 text-text-secondary hover:text-accent-primary transition-all flex-1"
        >
          <div className="p-2 rounded-xl">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
}
