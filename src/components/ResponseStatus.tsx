import React from 'react';
import { Shield, Users, CheckCircle2, AlertCircle, History, Fingerprint, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { EmergencyEvent } from '../types';
import { cn } from '../lib/utils';

interface ResponseStatusProps {
  events?: EmergencyEvent[];
  event?: EmergencyEvent | null;
  onResolve?: (id: string) => void;
}

export default function ResponseStatus({ events = [], event = null, onResolve }: ResponseStatusProps) {
  const activeCount = events.filter(e => e.status !== 'RESOLVED').length;
  const resolvedCount = events.filter(e => e.status === 'RESOLVED').length;

  const responders = [
    { name: 'UNIT_ALPHA_01', status: 'DEPLOYED', bio: '98%' },
    { name: 'UNIT_BETA_04', status: 'ON_SITE', bio: '92%' },
    { name: 'MED_TEAM_02', status: 'STANDBY', bio: '100%' },
  ];

  if (event) {
    return (
      <section className="cyber-panel p-5 flex flex-col gap-5 h-full">
        <div className="cyber-corner corner-tl" />
        <div className="cyber-corner corner-tr" />
        
        <div className="flex items-center justify-between border-b border-border-primary pb-3 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-3 h-3 text-accent-primary shrink-0" />
            <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] truncate">
              Response_Status
            </h2>
          </div>
          <span className="text-[10px] font-mono text-accent-primary font-bold shrink-0">#{event.id}</span>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-text-secondary uppercase opacity-50">Assigned_Team</span>
            <div className="p-3 bg-accent-primary/5 border border-accent-primary/20 flex items-center gap-3">
              <Users className="w-4 h-4 text-accent-primary" />
              <span className="text-xs font-mono font-bold text-text-primary uppercase truncate">{event.assignedTeam}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-text-secondary uppercase opacity-50">Response_Progress</span>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono uppercase">
                <span className="text-text-secondary">{event.status}</span>
                <span className="text-accent-primary">{event.status === 'RESOLVED' ? '100%' : event.status === 'IN_PROGRESS' ? '65%' : '15%'}</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: event.status === 'RESOLVED' ? '100%' : event.status === 'IN_PROGRESS' ? '65%' : '15%' }}
                  className={cn(
                    "h-full transition-all duration-1000",
                    event.status === 'RESOLVED' ? 'bg-status-success' : 'bg-accent-primary'
                  )}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-bg-secondary/40 border border-border-primary">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3 h-3 text-accent-primary" />
              <span className="text-[9px] font-mono text-text-secondary uppercase opacity-50">Current_State</span>
            </div>
            <p className="text-[11px] font-mono text-text-primary uppercase leading-relaxed mb-4">
              {event.status === 'RESOLVED' 
                ? 'Threat neutralized. Area cleared for re-entry.' 
                : event.status === 'IN_PROGRESS' 
                ? 'Containment measures active. Response units engaged.' 
                : 'Awaiting first responder arrival. Protocol initiated.'}
            </p>
            {event.status !== 'RESOLVED' && onResolve && (
              <button 
                onClick={() => onResolve(event.id)}
                className="w-full py-2 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-[10px] font-bold uppercase tracking-widest hover:bg-accent-primary/20 transition-all"
              >
                Mark Incident Resolved
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cyber-panel p-5 flex flex-col gap-5">
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-tr" />
      
      <div className="flex items-center justify-between border-b border-border-primary pb-3 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Fingerprint className="w-3 h-3 text-accent-primary shrink-0" />
          <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] truncate">
            Unit_Logistics
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-1 h-1 rounded-full bg-accent-primary" />
          <span className="text-[8px] font-mono text-text-secondary opacity-50">AUTH_LEVEL: 4</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-secondary/40 border border-border-primary p-4 relative group">
          <div className="absolute top-1 right-1">
            <Activity className="w-3 h-3 text-text-secondary opacity-20 group-hover:text-accent-primary transition-colors" />
          </div>
          <p className="text-[8px] font-mono text-text-secondary uppercase mb-1">Active</p>
          <p className={`text-2xl font-mono font-black ${activeCount > 0 ? 'text-status-danger' : 'text-text-secondary opacity-30'}`}>
            {activeCount.toString().padStart(2, '0')}
          </p>
          <div className="w-full h-[1px] bg-border-primary opacity-20 mt-2" />
        </div>

        <div className="bg-bg-secondary/40 border border-border-primary p-4 relative group">
          <div className="absolute top-1 right-1">
            <History className="w-3 h-3 text-text-secondary opacity-20 group-hover:text-status-warning transition-colors" />
          </div>
          <p className="text-[8px] font-mono text-text-secondary uppercase mb-1">Resolved</p>
          <p className="text-2xl font-mono font-black text-text-secondary opacity-50">
            {resolvedCount.toString().padStart(2, '0')}
          </p>
          <div className="w-full h-[1px] bg-border-primary opacity-20 mt-2" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Users className="w-3 h-3" />
          Active_Personnel
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {responders.map((unit) => (
            <div key={unit.name} className="flex items-center justify-between p-2 bg-bg-secondary/20 border border-border-primary/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-4 bg-accent-primary/20 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono font-bold text-text-primary truncate">{unit.name}</span>
                  <span className="text-[7px] font-mono text-text-secondary opacity-50">BIO_SYNC: {unit.bio}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className={`text-[8px] font-mono font-bold px-2 py-0.5 border rounded-sm ${
                  unit.status === 'DEPLOYED' ? 'border-status-danger/30 text-status-danger' : 
                  unit.status === 'ON_SITE' ? 'border-status-warning/30 text-status-warning' : 
                  'border-border-primary text-text-secondary opacity-50'
                }`}>
                  {unit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
