import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { EmergencyEvent, RoomOccupancy } from '../types';
import RouteMapModal from './RouteMapModal';
import BuildingMapCore from './BuildingMapCore';

interface BuildingMapProps {
  activeEvents: EmergencyEvent[];
  occupancy: RoomOccupancy[];
  onSelectRoom: (room: string) => void;
  forceShowFlowField?: boolean;
  isRescueMode?: boolean;
  focusApt?: string;
}

export default function BuildingMap({ activeEvents, occupancy, onSelectRoom, forceShowFlowField, isRescueMode, focusApt }: BuildingMapProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="relative flex-1 flex flex-col min-h-0 h-full">
      <RouteMapModal 
        isOpen={isMaximized}
        onClose={() => setIsMaximized(false)}
        activeEvents={activeEvents}
        occupancy={occupancy}
        isRescueMode={isRescueMode}
        title="Tactical Layout Overview"
        focusApt={focusApt}
      />
      
      {/* Maximize Button - Better positioned and sized */}
      {isMobile && (
        <div className="absolute right-4 bottom-20 z-[30]">
          <button 
            onClick={() => setIsMaximized(true)}
            className="flex items-center gap-2 px-3 py-2 bg-accent-primary text-bg-primary rounded-lg font-black text-[9px] shadow-2xl active:scale-95 transition-transform border border-white/20 uppercase tracking-tighter"
          >
            <Maximize2 className="w-3 h-3" /> 
            TACTICAL_SCAN
          </button>
        </div>
      )}

      <BuildingMapCore 
        activeEvents={activeEvents}
        occupancy={occupancy}
        onSelectRoom={onSelectRoom}
        forceShowFlowField={forceShowFlowField}
        isRescueMode={isRescueMode}
        focusApt={focusApt}
      />
    </div>
  );
}
