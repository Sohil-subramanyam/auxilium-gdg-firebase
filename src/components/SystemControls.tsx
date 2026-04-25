import React from 'react';
import RoleSelector from './RoleSelector';
import { UserRole } from '../types';

interface SystemControlsProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'white' | 'purple';
  setTheme: (theme: 'dark' | 'white' | 'purple') => void;
}

export default function SystemControls({ role, setRole, theme, setTheme }: SystemControlsProps) {
  return (
    <div className="flex items-center flex-wrap gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Theme</span>
        <div className="flex gap-2.5">
          {(['dark', 'white', 'purple'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center ${
                theme === t ? 'border-accent-primary scale-110 shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'border-border-primary'
              }`}
              style={{ 
                backgroundColor: t === 'dark' ? '#000' : t === 'white' ? '#fff' : '#4c1d95' 
              }}
              title={`${t.charAt(0).toUpperCase() + t.slice(1)} Theme`}
            >
              {theme === t && <div className="w-2 h-2 rounded-full bg-accent-primary" />}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-8 w-[1px] bg-border-primary opacity-20" />

      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">Access</span>
        <RoleSelector currentRole={role} onRoleChange={setRole} />
      </div>
    </div>
  );
}
