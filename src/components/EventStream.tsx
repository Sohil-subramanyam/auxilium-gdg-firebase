import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Terminal, Database, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { EmergencyEvent } from '../types';
import { cn } from '../lib/utils';

interface EventStreamProps {
  event?: EmergencyEvent | null;
}

export default function EventStream({ event = null }: EventStreamProps) {
  const pipelineSteps = [
    { type: 'DETECTION', label: 'Sensor Triggered' },
    { type: 'DECISION', label: 'Event Processed' },
    { type: 'ACTION', label: 'Decision Executed' },
    { type: 'BROADCAST', label: 'Broadcast Sent' },
    { type: 'RESPONSE', label: 'Response Assigned' },
  ];

  const getStepStatus = (type: string) => {
    if (!event) return 'pending';
    const action = event.actions.find(a => a.type === type);
    if (action) return 'completed';
    return 'processing';
  };

  return (
    <section className="cyber-panel flex-1 flex flex-col min-h-0">
      <div className="cyber-corner corner-tr" />
      <div className="cyber-corner corner-bl" />
      
      <div className="p-4 border-b border-border-primary flex items-center justify-between bg-bg-secondary/20">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3 text-accent-primary" />
          <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">
            Pipeline_Stream
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
          <span className="text-[9px] font-mono text-accent-primary/60">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[9px] custom-scrollbar bg-bg-secondary/40 space-y-6">
        {event ? (
          <div className="flex flex-col gap-4">
            {pipelineSteps.map((step, idx) => {
              const status = getStepStatus(step.type);
              return (
                <div key={step.type} className="flex flex-col gap-2">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "flex items-center gap-4 p-3 border transition-all",
                      status === 'completed' ? 'border-accent-primary/40 bg-accent-primary/5' : 
                      status === 'processing' ? 'border-border-primary bg-bg-secondary/40' : 'border-border-primary opacity-20'
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border shrink-0",
                      status === 'completed' ? 'border-accent-primary text-accent-primary' : 'border-border-primary text-text-secondary opacity-30'
                    )}>
                      {status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[8px]">{idx + 1}</span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest truncate",
                          status === 'completed' ? 'text-accent-primary' : 'text-text-secondary opacity-50'
                        )}>
                          {step.label}
                        </span>
                        {status === 'processing' && <Loader2 className="w-3 h-3 text-accent-primary animate-spin shrink-0" />}
                      </div>
                      {status === 'completed' && (
                        <p className="text-[8px] text-text-secondary uppercase leading-tight truncate">
                          {event.actions.find(a => a.type === step.type)?.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                  
                  {idx < pipelineSteps.length - 1 && (
                    <div className="flex justify-center h-4">
                      <div className={cn(
                        "w-[1px] h-full",
                        status === 'completed' ? 'bg-accent-primary/40' : 'bg-border-primary opacity-20'
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-4">
            <Activity className="w-12 h-12 opacity-10 animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.5em] font-bold">Awaiting_Event</span>
          </div>
        )}
      </div>
      
      <div className="p-2 bg-bg-secondary/30 border-t border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-2.5 h-2.5 text-accent-primary/40" />
          <span className="text-[8px] text-text-secondary uppercase font-bold tracking-tighter">I/O_ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-text-secondary opacity-30 font-mono">0x{Math.random().toString(16).substring(2, 6).toUpperCase()}</span>
        </div>
      </div>
    </section>
  );
}
