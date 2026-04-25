import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyEvent } from '../types';
import { Clock, CheckCircle2, AlertCircle, Radio, Activity, Shield } from 'lucide-react';

interface EventTimelineProps {
  event: EmergencyEvent | null;
}

export default function EventTimeline({ event }: EventTimelineProps) {
  if (!event) {
    return (
      <div className="cyber-panel p-4 h-full flex items-center justify-center border-dashed border-border-primary">
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.3em]">Select_Event_For_Timeline</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'DETECTION': return <AlertCircle className="w-3 h-3 text-status-danger" />;
      case 'DECISION': return <Shield className="w-3 h-3 text-status-warning" />;
      case 'ACTION': return <Activity className="w-3 h-3 text-accent-primary" />;
      case 'BROADCAST': return <Radio className="w-3 h-3 text-accent-primary" />;
      case 'RESPONSE': return <Clock className="w-3 h-3 text-text-secondary" />;
      case 'RESOLUTION': return <CheckCircle2 className="w-3 h-3 text-status-success" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="cyber-panel p-4 flex flex-col gap-4 h-full overflow-hidden">
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-br" />
      
      <div className="flex items-center justify-between border-b border-border-primary pb-2 gap-4">
        <div className="flex flex-col min-w-0">
          <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] truncate">
            Lifecycle_Audit
          </h2>
          <span className="text-[8px] font-mono text-accent-primary truncate">ID: {event.id}</span>
        </div>
        <div className={`px-2 py-0.5 border text-[8px] font-mono font-bold uppercase shrink-0 ${
          event.status !== 'RESOLVED' ? 'border-status-danger/30 text-status-danger' : 'border-status-success/30 text-status-success'
        }`}>
          {event.status}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative pl-4 border-l border-border-primary/30 flex flex-col gap-6 py-2">
          <AnimatePresence mode="popLayout">
            {event.actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-[21px] top-1 bg-bg-primary p-1 border border-border-primary rounded-full shrink-0">
                  {getIcon(action.type)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-[9px] font-mono font-bold text-text-primary uppercase tracking-widest truncate">{action.type}</span>
                    <span className="text-[8px] font-mono text-text-secondary opacity-50 shrink-0">{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] font-mono text-text-secondary leading-relaxed italic break-words">
                    "{action.description}"
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
