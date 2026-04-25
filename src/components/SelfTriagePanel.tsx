import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Heart, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';

export default function SelfTriagePanel({ personId }: { personId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [helpNeeded, setHelpNeeded] = useState<boolean | null>(null);

  useEffect(() => {
    const socket = io();
    socket.on('emergency_event', () => {
      if (!hasSubmitted) {
        setIsOpen(true);
      }
    });

    return () => {
      socket.close();
    };
  }, [hasSubmitted]);

  const handleSubmit = (needed: boolean) => {
    const socket = io();
    setHelpNeeded(needed);
    
    // Use a random ID if none provided for demo
    const id = personId || `guest-${Math.random().toString(36).substring(2, 7)}`;
    
    socket.emit("self_triage", { personId: id, helpNeeded: needed });
    setHasSubmitted(true);
    
    setTimeout(() => {
      setIsOpen(false);
      socket.close();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-bg-panel/95 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 md:p-12 shadow-[0_0_100px_rgba(239,68,68,0.2)] pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-status-danger/5 to-transparent pointer-events-none" />
            
            {!hasSubmitted ? (
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-status-danger/10 border border-status-danger/30 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <ShieldAlert className="w-10 h-10 text-status-danger" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-text-primary mb-4 leading-tight">
                  Emergency_Protocol_Active
                </h2>
                <p className="text-sm font-mono text-text-secondary uppercase tracking-widest mb-10 leading-relaxed font-bold">
                  Identify your status for priority response routing
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSubmit(false)}
                    className="group relative flex flex-col items-center gap-4 p-6 bg-bg-secondary border border-white/10 rounded-2xl hover:border-status-success hover:bg-status-success/5 transition-all"
                  >
                    <CheckCircle2 className="w-8 h-8 text-status-success" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-primary group-hover:text-status-success">I am Safe</span>
                  </button>
                  
                  <button
                    onClick={() => handleSubmit(true)}
                    className="group relative flex flex-col items-center gap-4 p-6 bg-bg-secondary border border-white/10 rounded-2xl hover:border-status-danger hover:bg-status-danger/5 transition-all"
                  >
                    <Heart className="w-8 h-8 text-status-danger animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-primary group-hover:text-status-danger text-center leading-tight">I Need Help / Injured</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 text-center py-10"
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${helpNeeded ? 'bg-status-danger/20' : 'bg-status-success/20'}`}>
                  {helpNeeded ? <ShieldAlert className="w-10 h-10 text-status-danger" /> : <CheckCircle2 className="w-10 h-10 text-status-success" />}
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-text-primary mb-2">
                  Status_Logged
                </h2>
                <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
                  {helpNeeded ? "Priority response units dispatched to your location" : "Resume evacuation following tactical guidance"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
