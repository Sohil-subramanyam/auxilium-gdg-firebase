import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Notifications from './Notifications';
import { EmergencyEvent, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'white' | 'purple';
  setTheme: (theme: 'dark' | 'white' | 'purple') => void;
  notifications: EmergencyEvent[];
  onRemoveNotification: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Layout({ 
  role, 
  setRole, 
  theme, 
  setTheme, 
  notifications, 
  onRemoveNotification,
  isSidebarOpen,
  setIsSidebarOpen
}: LayoutProps) {
  const isGuest = role === 'Guest';
  const location = useLocation();
  const lastPathname = React.useRef(location.pathname);

  // Close sidebar on navigation only on mobile (below 768px) and when pathname actually changes
  useEffect(() => {
    if (window.innerWidth < 768 && location.pathname !== lastPathname.current) {
      setIsSidebarOpen(false);
    }
    lastPathname.current = location.pathname;
  }, [location.pathname, setIsSidebarOpen]);

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden role-${role.toLowerCase()}`}>
      
      <Header 
        role={role} 
        setRole={setRole} 
        theme={theme} 
        setTheme={setTheme} 
        isMobileMenuOpen={isSidebarOpen}
        setIsMobileMenuOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay (Drawer for "More") */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[450]"
              />
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-4 left-4 w-[calc(100%-2rem)] max-w-sm bg-bg-primary z-[500] border border-border-primary rounded-2xl overflow-hidden shadow-2xl"
              >
                <Sidebar 
                  role={role} 
                  setRole={setRole}
                  theme={theme} 
                  setTheme={setTheme}
                  onClose={() => setIsSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tablet & Desktop Sidebar (Toggleable) */}
        <div className={cn(
          "hidden md:block h-full shrink-0 transition-all duration-300 ease-in-out border-r border-border-primary overflow-hidden",
          isSidebarOpen ? "w-64" : "w-0 opacity-0"
        )}>
          <Sidebar 
            role={role} 
            setRole={setRole}
            theme={theme} 
            setTheme={setTheme}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        
        <main className={cn(
          "flex-1 overflow-auto relative custom-scrollbar transition-all duration-300",
          isGuest ? "p-0 pb-20 md:pb-0" : "p-4 lg:p-6 pb-24 md:pb-8"
        )}>
          <Outlet />
        </main>

        {/* Mobile Navigation Interface (Bottom Bar) */}
        <MobileNav 
          role={role} 
          onOpenMore={() => setIsSidebarOpen(true)} 
        />
      </div>

      <Notifications 
        notifications={notifications} 
        onRemove={onRemoveNotification} 
      />
    </div>
  );
}
