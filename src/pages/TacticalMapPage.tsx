import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Layout as LayoutIcon, Maximize2, Minimize2 } from 'lucide-react';
import BuildingMapCore from '../components/BuildingMapCore';
import SelfTriagePanel from '../components/SelfTriagePanel';
import { EmergencyEvent, RoomOccupancy } from '../types';

export default function TacticalMapPage() {
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [occupancy, setOccupancy] = useState<RoomOccupancy[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("History fetch failed:", err));

    fetch('/api/occupancy')
      .then(res => res.json())
      .then(data => setOccupancy(data))
      .catch(err => console.error("Occupancy fetch failed:", err));

    const newSocket = io();

    newSocket.on('event_history', (history: EmergencyEvent[]) => {
      setEvents(history);
    });

    newSocket.on('emergency_event', (event: EmergencyEvent) => {
      setEvents(prev => {
        const exists = prev.find(e => e.id === event.id);
        if (exists) return prev.map(e => e.id === event.id ? event : e);
        return [event, ...prev];
      });
    });

    newSocket.on('occupancy_update', (data: any[]) => {
      setOccupancy(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const activeEvents = events.filter(e => e.status !== 'RESOLVED');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] w-full bg-bg-primary overflow-hidden flex flex-col relative rounded-3xl border border-white/5 shadow-2xl">
      {/* HUD Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[40] p-4 md:p-6 lg:p-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 md:gap-6 bg-bg-panel/90 backdrop-blur-2xl border border-white/10 p-3 md:p-4 rounded-[24px] md:rounded-[32px] pointer-events-auto shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.02]">
          <div className="p-2.5 md:p-4 bg-accent-primary text-bg-primary rounded-xl md:rounded-2xl shadow-lg shadow-accent-primary/20">
            <LayoutIcon className="w-5 h-5 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xs md:text-2xl font-black uppercase tracking-tighter text-text-primary leading-tight">
              Tactical_Command_View
            </h1>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[7px] md:text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] font-bold">
                Structural_Scan // {activeEvents.length > 0 ? 'CRITICAL_MODE' : 'MONITORING'}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${activeEvents.length > 0 ? 'bg-status-danger animate-pulse' : 'bg-accent-primary animate-pulse'}`} />
            </div>
          </div>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="hidden md:flex items-center gap-4 px-6 py-4 bg-bg-secondary/90 backdrop-blur-2xl border border-white/10 rounded-2xl text-text-secondary hover:text-white transition-all shadow-xl pointer-events-auto active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          <span className="text-[10px] font-mono font-black uppercase tracking-widest">Fullscreen</span>
        </button>
      </div>

      {/* Map Content - Edge to Edge */}
      <div className="flex-1 w-full h-full relative">
        <BuildingMapCore 
          activeEvents={activeEvents}
          occupancy={occupancy}
          onSelectRoom={() => {}}
          forceShowFlowField={activeEvents.length > 0}
          isRescueMode={activeEvents.length > 0}
          hideControls={false}
          isMobileOverride={false} // Use full grid
        />
        <SelfTriagePanel />
      </div>

      {/* Tactical Bottom Bar for Page Mode */}
      <div className="absolute bottom-6 left-6 right-6 z-[40] pointer-events-none flex justify-center">
        <div className="bg-bg-panel/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-danger" />
            <span className="text-[9px] font-mono font-bold text-text-secondary uppercase">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-primary" />
            <span className="text-[9px] font-mono font-bold text-text-secondary uppercase">UNITS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success" />
            <span className="text-[9px] font-mono font-bold text-text-secondary uppercase">RESIDENTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
