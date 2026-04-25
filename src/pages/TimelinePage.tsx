import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, Clock, Activity, Shield } from 'lucide-react';
import { io } from 'socket.io-client';
import { cn } from '../lib/utils';

const SOCKET_URL = window.location.origin;

interface TimelineLog {
  id: string;
  timestamp: string;
  message: string;
}

export default function TimelinePage() {
  const [logs, setLogs] = useState<TimelineLog[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    
    socket.on('timeline_history', (history: TimelineLog[]) => {
      setLogs(history);
    });

    socket.on('timeline_update', (log: TimelineLog) => {
      setLogs(prev => [log, ...prev].slice(0, 100));
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            SYSTEM_TIMELINE<span className="text-cyber-cyan">.STREAM</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
            Real-time sequential log of all system operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity className="w-3 h-3 text-cyber-cyan" />
            <span className="text-[10px] font-mono uppercase">Live_Feed: Active</span>
          </div>
          <div className="w-[1px] h-4 bg-stealth-border" />
          <div className="flex items-center gap-2 text-zinc-500">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-mono uppercase">Audit_Log: Verified</span>
          </div>
        </div>
      </div>

      <div className="cyber-panel flex-1 flex flex-col overflow-hidden bg-black/60">
        <div className="p-4 border-b border-stealth-border bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-cyan" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Kernel_Output</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-700 uppercase">Buffer: 100/100</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4 custom-scrollbar">
          {logs.map((log, idx) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-6 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-cyber-cyan/40 group-hover:bg-cyber-cyan transition-colors" />
                <div className="w-[1px] flex-1 bg-stealth-border my-1" />
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] text-cyber-cyan/60 font-bold">[{log.timestamp}]</span>
                  <div className="h-[1px] flex-1 bg-stealth-border/30" />
                </div>
                <p className={cn(
                  "text-xs uppercase tracking-wider leading-relaxed",
                  log.message.includes('CRITICAL') || log.message.includes('FIRE') ? 'text-cyber-red' : 
                  log.message.includes('resolved') ? 'text-green-500' : 'text-zinc-400'
                )}>
                  {log.message}
                </p>
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
              <Clock className="w-12 h-12" />
              <span className="text-xs uppercase tracking-[0.3em]">Awaiting system initialization...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
