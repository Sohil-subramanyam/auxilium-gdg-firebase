import React from 'react';
import { UserRole } from '../types';
import { Shield, Users, User } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles: { id: UserRole; icon: any; label: string }[] = [
    { id: 'Admin', icon: Shield, label: 'ADMIN' },
    { id: 'Staff', icon: Users, label: 'STAFF' },
    { id: 'Guest', icon: User, label: 'GUEST' },
  ];

  return (
    <div className="flex items-center flex-wrap gap-2 bg-bg-secondary p-1.5 border border-border-primary rounded-sm">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded transition-all whitespace-nowrap ${
            currentRole === role.id 
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' 
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50'
          }`}
        >
          <role.icon className="w-4 h-4" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{role.label}</span>
        </button>
      ))}
    </div>
  );
}
