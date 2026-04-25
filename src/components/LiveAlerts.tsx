import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Wind, AlertTriangle, Clock, MapPin, ShieldAlert, Activity, QrCode as QrIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EmergencyEvent } from '../types';
import QRModal from './QRModal';

interface LiveAlertsProps {
  events: EmergencyEvent[];
  onResolve: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export default function LiveAlerts({ events, onResolve, onSelect, selectedId }: LiveAlertsProps) {
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');
  const [enlargedQR, setEnlargedQR] = React.useState<{ value: string, title: string } | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FIRE': return <Flame className="w-4 h-4" />;
      case 'GAS': return <Wind className="w-4 h-4" />;
      case 'PANIC': return <AlertTriangle className="w-4 h-4" />;
      case 'MEDICAL': return <Activity className="w-4 h-4" />;
      case 'BACKUP_REQUIRED': return <ShieldAlert className="w-4 h-4 text-accent-secondary" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-status-danger border-status-danger/30 bg-status-danger/5';
      case 'HIGH': return 'text-status-warning border-status-warning/30 bg-status-warning/5';
      case 'MEDIUM': return 'text-accent-primary border-accent-primary/30 bg-accent-primary/5';
      default: return 'text-text-secondary border-border-primary bg-bg-secondary/20';
    }
  };

  return (
    <section className="cyber-panel flex-1 flex flex-col min-h-0">
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-br" />
      
      <div className="p-4 border-b border-border-primary flex items-center justify-between bg-bg-secondary/20">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-accent-secondary" />
          <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">
            Threat_Buffer
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-secondary opacity-50">QUEUE:</span>
          <span className="text-[10px] font-mono font-bold text-accent-secondary">{activeEvents.length}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activeEvents.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-text-secondary gap-3 py-10"
            >
              <Activity className="w-8 h-8 opacity-10" />
              <p className="text-[9px] font-mono uppercase tracking-[0.3em]">No_Threats_Detected</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => onSelect(event.id)}
                  className={`p-3 border-l-2 flex flex-col gap-2 relative group cursor-pointer transition-all ${
                    selectedId === event.id ? 'bg-accent-primary/5 border-l-accent-primary scale-[1.02]' : 'bg-bg-secondary/40 border-l-border-primary'
                  } ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[8px] font-mono opacity-50 truncate">ID: {event.id}</span>
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse shrink-0" />
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-widest opacity-60 shrink-0">
                      {event.severity}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-primary/40 border border-border-primary shrink-0">
                      {getIcon(event.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-[11px] text-text-primary tracking-wider truncate">
                        {event.type}_DETECTION
                      </span>
                      <span className="text-[9px] font-mono text-text-secondary uppercase truncate">
                        LOC: {event.location}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve(event.id);
                    }}
                    className="mt-1 w-full py-1.5 bg-bg-primary/40 hover:bg-accent-primary/10 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-accent-primary transition-all border border-border-primary hover:border-accent-primary/30"
                  >
                    Resolve_Incident
                  </button>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(event.id);
                      }}
                      className="p-1.5 bg-bg-panel border border-border-primary rounded hover:border-accent-primary text-text-secondary hover:text-accent-primary transition-all"
                    >
                      <QrIcon className="w-3 h-3" />
                    </button>
                  </div>

                  {selectedId === event.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 pt-3 border-t border-border-primary flex flex-col items-center gap-3 overflow-hidden"
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnlargedQR({
                            value: `${window.location.origin}/incident/${event.id}`,
                            title: `Incident HUD: ${event.id}`,
                          });
                        }}
                        className="bg-white p-2 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform cursor-pointer block"
                      >
                        <QRCodeSVG 
                          value={`${window.location.origin}/incident/${event.id}`}
                          size={80}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-[7px] text-text-secondary uppercase tracking-[0.2em] block mb-1">Rescue_Personnel_Interface</span>
                        <a 
                          href={`${window.location.origin}/incident/${event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[8px] bg-bg-primary/50 px-2 py-0.5 rounded border border-border-primary text-accent-primary hover:border-accent-primary transition-colors cursor-pointer"
                        >
                          /incident/{event.id}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      <QRModal 
        isOpen={!!enlargedQR}
        onClose={() => setEnlargedQR(null)}
        value={enlargedQR?.value || ''}
        title={enlargedQR?.title || ''}
        subtitle="Operational Tactical Access"
      />
    </section>
  );
}
