import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Wind, 
  AlertTriangle, 
  Activity, 
  WifiOff, 
  CheckCircle2, 
  Terminal,
  Zap,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SimulationPageProps {
  onTrigger: (type: string, location?: string) => void;
  onToggleFailure: () => void;
  networkFailure: boolean;
}

export default function SimulationPage({ onTrigger, onToggleFailure, networkFailure }: SimulationPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const apartments = [
    "A101 - Living", "A101 - Bedroom", "A102 - Living", "A102 - Bedroom",
    "B201 - Living", "B201 - Bedroom", "B202 - Living", "B202 - Bedroom",
    "PENTHOUSE - Suite", "PENTHOUSE - Lounge", "PENTHOUSE - Terrace",
    "Main Lobby", "Service Hallway", "Stairwell A", "Stairwell B"
  ];

  const controls = [
    { type: 'FIRE', icon: Flame, color: 'text-cyber-red', border: 'border-cyber-red', bg: 'bg-cyber-red/5', label: 'FIRE_DETECTION_SIM', desc: 'Simulate high-temperature thermal anomaly' },
    { type: 'GAS', icon: Wind, color: 'text-cyber-amber', border: 'border-cyber-amber', bg: 'bg-cyber-amber/5', label: 'GAS_LEAK_SIM', desc: 'Simulate hazardous airborne chemical detection' },
    { type: 'PANIC', icon: AlertTriangle, color: 'text-cyber-cyan', border: 'border-cyber-cyan', bg: 'bg-cyber-cyan/5', label: 'CROWD_PANIC_SIM', desc: 'Simulate irregular movement patterns and stampede' },
    { type: 'MEDICAL', icon: Activity, color: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500/5', label: 'MEDICAL_EMERGENCY', desc: 'Simulate biological distress signal from occupant' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            SIMULATION_CONTROL<span className="text-cyber-cyan">.CENTER</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
            Manual override for crisis scenario testing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Location Selector */}
          <div className="cyber-panel p-6 bg-black/40">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-4 h-4 text-cyber-cyan" />
              <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Target_Location</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {apartments.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={cn(
                    "px-3 py-2 text-[9px] font-mono border transition-all uppercase",
                    selectedLocation === loc 
                      ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan" 
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                  )}
                >
                  {loc}
                </button>
              ))}
              <button
                onClick={() => setSelectedLocation('')}
                className={cn(
                  "px-3 py-2 text-[9px] font-mono border transition-all uppercase",
                  selectedLocation === '' 
                    ? "bg-zinc-700 border-zinc-600 text-white" 
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                )}
              >
                Random_Location
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {controls.map((ctrl) => (
              <motion.button
                key={ctrl.type}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.02)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTrigger(ctrl.type, selectedLocation || undefined)}
                className={cn(
                  "cyber-panel p-6 flex flex-col items-start gap-4 text-left transition-all group",
                  ctrl.border,
                  "border-opacity-20 hover:border-opacity-100"
                )}
              >
                <div className={cn("p-3 border border-opacity-30 rounded-sm", ctrl.border, ctrl.bg)}>
                  <ctrl.icon className={cn("w-6 h-6", ctrl.color)} />
                </div>
                <div>
                  <h3 className={cn("text-sm font-mono font-bold uppercase tracking-widest mb-1", ctrl.color)}>
                    {ctrl.label}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
                    {ctrl.desc}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 w-full border-t border-stealth-border">
                  <Zap className="w-3 h-3 text-zinc-700 group-hover:text-cyber-cyan transition-colors" />
                  <span className="text-[9px] font-mono text-zinc-700 group-hover:text-zinc-400 transition-colors uppercase">Execute_Sequence</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="cyber-panel p-6 bg-cyber-red/5 border-cyber-red/20">
            <div className="flex items-center gap-3 mb-4">
              <WifiOff className="w-5 h-5 text-cyber-red" />
              <h2 className="text-xs font-mono font-bold text-cyber-red uppercase tracking-widest">Network_Failure_Simulation</h2>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed mb-6">
              Simulate a total loss of primary communication channels. This will test system resilience and fallback protocols.
            </p>
            <button 
              onClick={onToggleFailure}
              className={cn(
                "w-full py-3 border font-mono text-xs font-bold uppercase tracking-widest transition-all",
                networkFailure 
                  ? "bg-cyber-red text-white border-cyber-red shadow-[0_0_20px_rgba(255,0,60,0.3)]" 
                  : "bg-transparent text-cyber-red border-cyber-red hover:bg-cyber-red hover:text-white"
              )}
            >
              {networkFailure ? 'RESTORE_CONNECTIVITY' : 'INITIATE_FAILURE'}
            </button>
          </div>

          <div className="cyber-panel p-6 bg-black/40">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-cyber-cyan" />
              <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">System_Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="text-zinc-600">Kernel_Node</span>
                <span className="text-green-500">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="text-zinc-600">Decision_Engine</span>
                <span className="text-green-500">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="text-zinc-600">Broadcast_Link</span>
                <span className={networkFailure ? 'text-cyber-red' : 'text-green-500'}>
                  {networkFailure ? 'FAILED' : 'STABLE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
