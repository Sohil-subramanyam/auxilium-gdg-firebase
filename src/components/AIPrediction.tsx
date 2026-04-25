import React from 'react';
import { motion } from 'motion/react';
import { Brain, AlertCircle, TrendingUp } from 'lucide-react';

export default function AIPrediction({ onPreempt }: { onPreempt?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cyber-panel p-4 bg-accent-primary/5 border-accent-primary/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Brain className="w-12 h-12 text-accent-primary" />
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
        <h3 className="text-[10px] font-mono font-bold text-accent-primary uppercase tracking-[0.2em]">AI_Predictive_Analysis</h3>
      </div>

      <div className="space-y-3">
        <div className="p-2 bg-bg-secondary/40 border border-accent-primary/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-text-secondary uppercase">Anomalous_Heat_Pattern</span>
            <span className="text-[9px] font-mono text-status-danger font-bold">87% RISK</span>
          </div>
          <p className="text-[10px] font-mono text-text-primary uppercase leading-tight">
            Kitchen overheating detected. High probability of fire within 10 minutes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono text-text-secondary uppercase">Confidence</span>
              <span className="text-[8px] font-mono text-accent-primary">94.2%</span>
            </div>
            <div className="h-1 w-full bg-bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '94.2%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-accent-primary"
              />
            </div>
          </div>
          <div className="relative group">
            <button 
              onClick={() => onPreempt?.()}
              className="px-3 py-1 border border-accent-primary/40 text-[9px] font-mono text-accent-primary hover:bg-accent-primary hover:text-bg-primary transition-all uppercase font-bold"
            >
              Preempt
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-bg-panel border border-border-primary text-[8px] font-mono text-text-secondary uppercase leading-tight opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              <span className="text-accent-primary font-bold block mb-1">PREEMPTIVE_ACTION:</span>
              Proactively deploy resources to neutralize a threat before it escalates based on AI probability.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
