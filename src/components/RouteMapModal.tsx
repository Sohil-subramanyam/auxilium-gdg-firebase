import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Map as MapIcon, Compass, Crosshair, Users, Navigation } from 'lucide-react';
import { EmergencyEvent, RoomOccupancy } from '../types';
import BuildingMapCore from './BuildingMapCore';

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvents: EmergencyEvent[];
  occupancy: RoomOccupancy[];
  title?: string;
  isRescueMode?: boolean;
  focusApt?: string;
}

export default function RouteMapModal({ 
  isOpen, 
  onClose, 
  activeEvents, 
  occupancy,
  title = "Emergency Evacuation Route Map",
  isRescueMode = false,
  focusApt
}: RouteMapModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-2 md:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-7xl h-full max-h-[96vh] bg-bg-primary border border-white/10 rounded-[20px] md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 md:px-10 md:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-20">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${isRescueMode ? 'bg-accent-primary text-bg-primary' : 'bg-status-danger text-white'} shadow-lg`}>
                   <MapIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-text-primary leading-tight">
                    {title}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[8px] md:text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] font-bold">
                       Tactical_Scan // Active_Telemetry
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2.5 md:p-3 bg-bg-secondary hover:bg-bg-secondary/80 border border-white/10 rounded-xl md:rounded-2xl text-text-secondary hover:text-white transition-all shadow-sm active:scale-90"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Map Content - Fills available space */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              <div className="flex-1 min-h-0 relative">
                <BuildingMapCore 
                  activeEvents={activeEvents} 
                  occupancy={occupancy}
                  onSelectRoom={() => {}}
                  forceShowFlowField={true}
                  isRescueMode={isRescueMode}
                  hideControls={false}
                  isMobileOverride={false} // Force desktop grid for better visibility in modal
                  focusApt={focusApt}
                />
                
                {/* Floating Guidance Overlay - Repositioned to be less intrusive */}
                <div className="absolute top-4 left-4 right-4 flex flex-col md:flex-row items-start justify-between gap-4 pointer-events-none z-[60]">
                   <motion.div 
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     className="bg-bg-panel/90 backdrop-blur-xl border border-accent-primary/20 p-2 md:p-3 rounded-xl max-w-[200px] md:max-w-xs shadow-2xl pointer-events-auto"
                   >
                      <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-1">
                         <Navigation className="w-3 h-3 text-accent-primary" />
                         <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-text-primary">Protocol_Alpha</span>
                      </div>
                      <p className="text-[8px] md:text-[10px] text-text-secondary italic leading-tight">
                         Follow <span className="text-accent-primary font-bold">Cyan Paths</span> towards <span className="text-status-success font-bold">Exit Points</span>.
                      </p>
                   </motion.div>

                   <div className="flex flex-col gap-1 md:gap-2 pointer-events-auto ml-auto">
                      <div className="px-2 py-1 bg-status-danger/20 border border-status-danger/40 rounded-lg flex items-center gap-2 backdrop-blur-md">
                         <div className="w-1 h-1 bg-status-danger rounded-full animate-pulse" />
                         <span className="text-[7px] md:text-[8px] font-mono font-black text-status-danger uppercase tracking-widest">DANGER</span>
                      </div>
                      <div className="px-2 py-1 bg-status-success/20 border border-status-success/40 rounded-lg flex items-center gap-2 backdrop-blur-md">
                         <div className="w-1 h-1 bg-status-success rounded-full" />
                         <span className="text-[7px] md:text-[8px] font-mono font-black text-status-success uppercase tracking-widest">SAFE_PATH</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t border-white/5 bg-bg-secondary/20 text-[7px] md:text-[8px] font-mono uppercase tracking-[0.4em] text-center opacity-30">
               Auxilium_OS // Tactical_Overlook // Build_V5.42
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
