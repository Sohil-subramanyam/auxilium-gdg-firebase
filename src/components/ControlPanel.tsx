import React from 'react';
import { motion } from 'motion/react';
import { Flame, Wind, AlertTriangle, Terminal, Key } from 'lucide-react';

interface ControlPanelProps {
  onTrigger: (type: string) => void;
}

export default function ControlPanel({ onTrigger }: ControlPanelProps) {
  const controls = [
    { type: 'FIRE', icon: Flame, color: 'border-cyber-red text-cyber-red', glow: 'shadow-cyber-red/20', label: 'IGNITION_SEQ' },
    { type: 'GAS', icon: Wind, color: 'border-cyber-amber text-cyber-amber', glow: 'shadow-cyber-amber/20', label: 'BIO_LEAK_SIM' },
    { type: 'PANIC', icon: AlertTriangle, color: 'border-cyber-cyan text-cyber-cyan', glow: 'shadow-cyber-cyan/20', label: 'PANIC_OVERRIDE' },
  ];

  return (
    <section className="cyber-panel p-4 flex flex-col gap-4">
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-br" />
      
      <div className="flex items-center justify-between border-b border-stealth-border pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-cyber-cyan" />
          <h2 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Command_Input
          </h2>
        </div>
        <Key className="w-3 h-3 text-zinc-700" />
      </div>
      
      <div className="flex flex-col gap-2">
        {controls.map((ctrl) => (
          <motion.button
            key={ctrl.type}
            whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrigger(ctrl.type)}
            className={`flex items-center justify-between p-3 border-l-2 bg-black/40 transition-all group ${ctrl.color} border-zinc-800`}
          >
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-mono opacity-40 mb-1">EXEC_CMD:</span>
              <div className="flex items-center gap-3">
                <ctrl.icon className="w-4 h-4" />
                <span className="font-mono font-bold text-xs tracking-widest text-zinc-200">{ctrl.label}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-mono text-cyber-cyan">AUTH_REQ</span>
              <div className="w-8 h-[1px] bg-cyber-cyan/40 mt-1" />
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-2 p-2 bg-black/60 border border-stealth-border rounded sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" />
          <span className="text-[8px] font-mono text-zinc-500 uppercase">Input_Status: Ready</span>
        </div>
        <div className="h-1 w-full bg-zinc-900 overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="h-full w-1/3 bg-cyber-cyan/20"
          />
        </div>
      </div>
    </section>
  );
}
