import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Radio } from 'lucide-react';
import { EmergencyEvent } from '../types';

interface NotificationsProps {
  notifications: EmergencyEvent[];
  onRemove: (id: string) => void;
}

export default function Notifications({ notifications, onRemove }: NotificationsProps) {
  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-4 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
            className="pointer-events-auto cyber-panel bg-black/80 border-l-4 border-l-cyber-red shadow-2xl overflow-hidden"
          >
            <div className="cyber-corner corner-tr" />
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-cyber-red/20 p-2 border border-cyber-red/30">
                  <ShieldAlert className="w-5 h-5 text-cyber-red" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[10px] font-mono font-bold text-cyber-red uppercase tracking-[0.2em]">Priority_Alert</h3>
                    <Radio className="w-3 h-3 text-cyber-red animate-pulse" />
                  </div>
                  <p className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider">
                    {notif.type}_DETECTION
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">
                    ZONE: {notif.location}
                  </p>
                  {notif.priority === 'CRITICAL' && (
                    <div className="mt-2 p-1 bg-cyber-red/20 border border-cyber-red/40 animate-pulse">
                      <p className="text-[8px] font-mono text-cyber-red font-black uppercase tracking-tighter">
                        EVACUATE_IMMEDIATELY: EXIT_VIA_STAIRCASE_B
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-cyber-red/5 border border-cyber-red/20 flex items-center justify-between">
                <span className="text-[9px] font-mono text-cyber-red uppercase font-bold">
                  {notif.priority === 'CRITICAL' ? 'PROTOCOL: EVAC_ACTIVE' : 'PROTOCOL: MONITORING'}
                </span>
                <button 
                  onClick={() => onRemove(notif.id)}
                  className="text-[9px] font-mono text-zinc-600 hover:text-white transition-colors uppercase underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="h-[2px] bg-zinc-900 w-full">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={() => onRemove(notif.id)}
                className="h-full bg-cyber-red shadow-[0_0_10px_rgba(255,51,51,0.5)]"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
