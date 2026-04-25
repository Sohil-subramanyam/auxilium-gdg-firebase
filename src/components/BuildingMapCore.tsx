import React, { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Users, AlertCircle } from 'lucide-react';
import { EmergencyEvent, RoomOccupancy, UserRole } from '../types';
import { cn } from '../lib/utils';

export interface BuildingMapCoreProps {
  activeEvents: EmergencyEvent[];
  occupancy: RoomOccupancy[];
  onSelectRoom: (room: string) => void;
  forceShowFlowField?: boolean;
  isRescueMode?: boolean;
  hideControls?: boolean;
  isMobileOverride?: boolean;
  focusApt?: string; // Prop to automatically zoom into an apartment
}

function BuildingMapCoreComponent({ 
  activeEvents, 
  occupancy, 
  onSelectRoom, 
  forceShowFlowField, 
  isRescueMode,
  hideControls = false,
  isMobileOverride,
  focusApt
}: BuildingMapCoreProps) {
  const [isScanMode, setIsScanMode] = useState(false);
  const [zoomedApt, setZoomedApt] = useState<string | null>(null);
  const [showFlowField, setShowFlowField] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showOccupants, setShowOccupants] = useState(true);
  const [activeFloorId, setActiveFloorId] = useState<string>('F1');
  const [occupantTrails, setOccupantTrails] = useState<Record<string, {x: number, y: number}[]>>({});

  // Focus on apartment if provided
  useEffect(() => {
    if (focusApt) {
      setZoomedApt(focusApt);
      const floorId = focusApt.startsWith('A') ? 'F1' : (focusApt.startsWith('B') ? 'F2' : 'PH');
      setActiveFloorId(floorId);
    }
  }, [focusApt]);

  const effectiveShowFlowField = forceShowFlowField !== undefined ? forceShowFlowField : showFlowField;

  // Update trails (Throttled for performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOccupantTrails(prev => {
        const next = { ...prev };
        let hasChanges = false;
        occupancy.forEach(occ => {
          occ.people.forEach(p => {
            const key = `${occ.roomId}-${p.id}`;
            const trail = next[key] || [];
            if (!trail.length || trail[trail.length - 1].x !== p.x || trail[trail.length - 1].y !== p.y) {
              next[key] = [...trail.slice(-3), { x: p.x, y: p.y }];
              hasChanges = true;
            }
          });
        });
        return hasChanges ? next : prev;
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [occupancy]);

  const floors = useMemo(() => [
    { 
      id: 'F1', 
      label: 'LEVEL_01 // RESIDENTIAL',
      exit: { x: 95, y: 50 },
      emergencyExit: { x: 5, y: 50 },
      apartments: [
        { id: 'A101', x: 5, y: 10, w: 35, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'A102', x: 60, y: 10, w: 35, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'A103', x: 5, y: 55, w: 35, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'A104', x: 60, y: 55, w: 35, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
      ],
      communalSpaces: [
        { id: 'Hallway', x: 40, y: 5, w: 20, h: 90, label: 'MAIN_CORRIDOR' },
        { id: 'Lobby', x: 5, y: 45, w: 90, h: 10, label: 'FRONT_LOBBY' },
      ]
    },
    { 
      id: 'F2', 
      label: 'LEVEL_02 // EXECUTIVE',
      exit: { x: 95, y: 50 },
      emergencyExit: { x: 5, y: 50 },
      apartments: [
        { id: 'B201', x: 5, y: 10, w: 45, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'B202', x: 50, y: 10, w: 45, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'B203', x: 5, y: 55, w: 45, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
        { id: 'B204', x: 50, y: 55, w: 45, h: 35, rooms: ['Living', 'Bedroom', 'Kitchen', 'Bath', 'Balcony'] },
      ],
      communalSpaces: [
        { id: 'Hallway', x: 45, y: 45, w: 5, h: 10, label: 'STAIRS_ENTRY' },
        { id: 'Lobby', x: 5, y: 45, w: 90, h: 10, label: 'EXEC_LOUNGE' },
      ]
    },
    { 
      id: 'PH', 
      label: 'LEVEL_PH // PENTHOUSE',
      exit: { x: 95, y: 50 },
      emergencyExit: { x: 5, y: 50 },
      apartments: [
        { id: 'PENTHOUSE', x: 10, y: 10, w: 80, h: 80, rooms: ['Suite', 'Lounge', 'Terrace', 'Kitchen', 'Dining', 'Office'] },
      ]
    }
  ], []);

  const getEventInRoom = (roomFullId: string) => {
    return activeEvents.find(e => e.location.includes(roomFullId));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return '#ef4444';
      case 'Staff': return '#3b82f6';
      case 'Guest': return '#10b981';
      default: return 'var(--text-secondary)';
    }
  };

  const isCritical = activeEvents.some(e => e.priority === 'CRITICAL' || e.priority === 'HIGH');
  const [isMobile, setIsMobile] = useState(isMobileOverride ?? window.innerWidth < 1024);

  useEffect(() => {
    if (isMobileOverride !== undefined) {
      setIsMobile(isMobileOverride);
    } else {
      const handleResize = () => setIsMobile(window.innerWidth < 1024);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobileOverride]);

  // Auto-select floor with incident
  useEffect(() => {
    if (activeEvents.length > 0) {
      const incident = activeEvents[0];
      const floorId = incident.location.startsWith('A') ? 'F1' : (incident.location.startsWith('B') ? 'F2' : (incident.location.startsWith('PENT') ? 'PH' : 'F1'));
      setActiveFloorId(floorId);
    }
  }, [activeEvents.length]);

  const handleAptClick = (aptId: string) => {
    setZoomedApt(zoomedApt === aptId ? null : aptId);
  };
  return (
    <section className={`cyber-panel p-3 lg:p-6 flex-1 flex flex-col relative overflow-hidden transition-colors duration-500 ${isScanMode ? 'bg-white text-black' : ''}`}>
      <div className="cyber-corner corner-tl" />
      <div className="cyber-corner corner-tr" />
      <div className="cyber-corner corner-bl" />
      <div className="cyber-corner corner-br" />
      
      <div className="absolute inset-0 tactical-grid pointer-events-none" />
      <div className="scanline-v2 pointer-events-none z-10" />
      
      {!hideControls && (
        <div className={cn(
          "flex items-center justify-between mb-2 md:mb-6 border-b border-border-primary pb-2 z-10 gap-2 flex-wrap",
          isMobile ? "flex-col sm:flex-row" : ""
        )}>
          <div className="flex items-center gap-2">
            <Crosshair className={`w-3 h-3 ${isScanMode ? 'text-black' : 'text-accent-primary'}`} />
            <h2 className={`text-[8px] md:text-[10px] font-mono font-bold uppercase tracking-[0.2em] whitespace-nowrap ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>
              Scan_V5 // {zoomedApt ? `UNIT: ${zoomedApt}` : 'SURV'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button 
              onClick={() => setIsScanMode(!isScanMode)}
              className={`px-1.5 py-0.5 text-[7px] md:text-[8px] font-bold border rounded transition-colors ${
                isScanMode ? 'bg-text-primary text-bg-primary border-text-primary' : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-accent-primary'
              }`}
            >
              MODE
            </button>
            {zoomedApt && (
              <button 
                onClick={() => setZoomedApt(null)}
                className={`px-1.5 py-0.5 text-[7px] md:text-[8px] font-bold border border-accent-primary text-accent-primary rounded bg-accent-primary/5 transition-colors`}
              >
                GRID
              </button>
            )}
            <button 
              onClick={() => setShowFlowField(!showFlowField)}
              className={`px-1.5 py-0.5 text-[7px] md:text-[8px] font-bold border rounded transition-colors ${
                effectiveShowFlowField ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-bg-secondary border-border-primary text-text-secondary'
              }`}
            >
              EXIT_FLOW
            </button>
            <button 
              onClick={() => setShowOccupants(!showOccupants)}
              className={`px-1.5 py-0.5 text-[7px] md:text-[8px] font-bold border rounded transition-colors ${
                showOccupants ? 'bg-status-success/20 border-status-success text-status-success' : 'bg-bg-secondary border-border-primary text-text-secondary'
              }`}
            >
              LIFE_SIGNS
            </button>
            <div className="flex items-center gap-1 ml-1 scale-75 md:scale-100">
               <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isCritical ? 'bg-status-danger' : 'bg-accent-primary'}`} />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Stats - Compressed to one line */}
      {isMobile && !zoomedApt && (
        <div className="flex flex-col gap-2 mb-3 z-20">
          <div className="flex bg-bg-secondary border border-border-primary rounded-lg p-0.5 shadow-inner overflow-x-auto custom-scrollbar-hide whitespace-nowrap sticky top-0 z-[21]">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className={cn(
                  "flex-1 min-w-[50px] py-1.5 text-[9px] font-mono font-black transition-all rounded-md uppercase tracking-wider",
                  activeFloorId === floor.id 
                    ? "bg-accent-primary text-bg-primary shadow-lg shadow-accent-primary/20" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {floor.id}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-between px-2 py-1 bg-bg-secondary/40 border border-border-primary/50 rounded-lg">
             <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-status-success" />
                <span className="text-[8px] font-bold text-text-secondary uppercase">Lost:</span>
                <span className="text-xs font-black text-status-success">
                   {occupancy.filter(o => o.roomId.startsWith(activeFloorId === 'PH' ? 'PENT' : activeFloorId === 'F1' ? 'A' : 'B')).reduce((acc, curr) => acc + curr.people.filter(p => p.role === 'Guest').length, 0)}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <Crosshair className="w-3 h-3 text-accent-primary" />
                <span className="text-[8px] font-bold text-text-secondary uppercase">Units:</span>
                <span className="text-xs font-black text-accent-primary">
                   {occupancy.filter(o => o.roomId.startsWith(activeFloorId === 'PH' ? 'PENT' : activeFloorId === 'F1' ? 'A' : 'B')).reduce((acc, curr) => acc + curr.people.filter(p => p.role === 'Staff').length, 0)}
                </span>
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 relative z-10 overflow-auto custom-scrollbar pr-1 lg:pr-2">
        <AnimatePresence mode="wait">
          {zoomedApt ? (
            <motion.div 
              key="zoomed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={cn(
                "flex flex-col",
                isMobile ? "w-full min-w-[320px]" : "min-w-[600px]"
              )}
            >
              {floors.flatMap(f => f.apartments).filter(a => a.id === zoomedApt).map(apt => {
                const floor = floors.find(f => f.apartments.some(ap => ap.id === apt.id));
                const targetExit = isCritical ? (floor?.emergencyExit || floor?.exit) : floor?.exit;
                
                return (
                  <div key={apt.id} className={`flex-1 border rounded-lg p-2 lg:p-8 relative min-h-[600px] flex flex-col ${isScanMode ? 'bg-white border-black/10' : 'bg-bg-secondary/30 border-border-primary'}`}>
                    <div className={`absolute top-2 left-2 text-[8px] font-mono font-bold uppercase opacity-50 z-[1] ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>
                      Unit_{apt.id}
                    </div>
                    <div className="flex-1 w-full h-full flex items-center justify-center overflow-auto min-h-0">
                      <svg viewBox="0 0 100 100" className="w-full max-w-none h-auto aspect-square min-w-[600px] lg:min-w-0 lg:max-h-[70vh]">
                        <rect width="100" height="100" fill={isScanMode ? '#000' : 'var(--bg-primary)'} opacity={isScanMode ? '0.05' : '0.1'} rx="2" />
                        
                        {effectiveShowFlowField && isCritical && targetExit && (
                        <g opacity="0.15">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <g key={`flow-row-${i}`}>
                              {Array.from({ length: 10 }).map((_, j) => {
                                const x = i * 10 + 5;
                                const y = j * 10 + 5;
                                const dx = targetExit.x - x;
                                const dy = targetExit.y - y;
                                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                                return (
                                  <path 
                                    key={`flow-arrow-${i}-${j}`}
                                    d="M -2 0 L 2 0 M 0 -1 L 2 0 L 0 1"
                                    transform={`translate(${x}, ${y}) rotate(${angle})`}
                                    stroke={isScanMode ? '#000' : 'var(--accent-primary)'}
                                    strokeWidth="0.5"
                                    fill="none"
                                  />
                                );
                              })}
                            </g>
                          ))}
                        </g>
                      )}

                      {apt.rooms.map((room, idx) => {
                        const roomFullId = `${apt.id}-${room}`;
                        const event = getEventInRoom(roomFullId);
                        const roomW = 100;
                        const roomH = 100 / apt.rooms.length;
                        const roomX = 0;
                        const roomY = idx * roomH;
                        const roomOcc = occupancy.find(o => o.roomId === roomFullId);
                        const isCongested = (roomOcc?.people.length || 0) > 15;

                        return (
                          <g key={roomFullId} onClick={() => onSelectRoom(roomFullId)} className="cursor-pointer group">
                            <motion.rect
                              x={roomX} y={roomY} width={roomW} height={roomH}
                              animate={{
                                fill: event ? (event.priority === 'CRITICAL' ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.2)'] : 'rgba(245, 158, 11, 0.2)') : (isCongested ? ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)'] : (isScanMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)')),
                                stroke: event ? (event.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b') : (isCongested ? '#f59e0b' : (isScanMode ? 'rgba(0,0,0,0.2)' : 'var(--border-primary)'))
                               }}
                              transition={{
                                fill: { repeat: (event?.priority === 'CRITICAL' || isCongested) ? Infinity : 0, duration: 2 }
                              }}
                              strokeWidth={isCongested ? "1.2" : "0.8"}
                            />
                            <text x={roomX + 4} y={roomY + 12} fontSize="5" className={`font-mono uppercase font-black tracking-tighter ${isScanMode ? 'fill-black opacity-60' : 'fill-accent-primary opacity-40'}`}>{room}</text>
                            
                            {isCongested && !event && (
                               <text x={roomX + 4} y={roomY + 19} fontSize="3" className="fill-status-warning font-mono font-bold animate-pulse">!! CONGESTION_BOTTLENECK !!</text>
                            )}
                            
                            {isCritical && targetExit && (
                              <motion.path
                                d={`M ${roomX + roomW/2} ${roomY + roomH/2} L ${targetExit.x} ${targetExit.y}`}
                                stroke={isScanMode ? '#000' : 'var(--accent-primary)'}
                                strokeWidth="1.2"
                                strokeDasharray="4,2"
                                opacity="0.8"
                                filter="drop-shadow(0 0 8px var(--accent-primary))"
                                initial={{ pathLength: 0 }}
                                animate={{ 
                                  pathLength: 1,
                                  strokeDashoffset: [0, -20]
                                }}
                                transition={{
                                  strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" },
                                  pathLength: { duration: 1 }
                                }}
                              />
                            )}

                            {roomOcc?.people.map((person, pIdx) => {
                              const key = `${roomFullId}-${person.id}`;
                              const trail = occupantTrails[key] || [];
                              const px = roomX + (person.x / 100) * roomW + (pIdx % 3 - 1) * 2;
                              const py = roomY + (person.y / 100) * roomH + (Math.floor(pIdx / 3) % 3 - 1) * 2;

                              return (
                                <g key={person.id}>
                                  {showHeatmap && trail.map((pos, tIdx) => (
                                    <circle
                                      key={tIdx}
                                      cx={roomX + (pos.x / 100) * roomW + (pIdx % 3 - 1) * 2}
                                      cy={roomY + (pos.y / 100) * roomH + (Math.floor(pIdx / 3) % 3 - 1) * 2}
                                      r="1.2"
                                      fill={getRoleColor(person.role)}
                                      opacity={tIdx / trail.length * 0.3}
                                    />
                                  ))}
                                  
                                  {person.helpNeeded && (
                                    <motion.circle
                                      cx={px} cy={py} r="4"
                                      fill="none"
                                      stroke="#ef4444"
                                      strokeWidth="0.5"
                                      animate={{ scale: [1, 2], opacity: [1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1 }}
                                    />
                                  )}

                                  <motion.circle
                                    cx={px} cy={py} r="1.8"
                                    fill={person.helpNeeded ? '#ef4444' : getRoleColor(person.role)}
                                    animate={{ 
                                      cx: px, cy: py,
                                      scale: (person.isAssisting || person.helpNeeded) ? [1, 1.3, 1] : 1
                                    }}
                                    transition={{ repeat: (person.isAssisting || person.helpNeeded) ? Infinity : 0, duration: 1.5 }}
                                  />
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}
                      {targetExit && (
                        <g>
                           <circle cx={targetExit.x} cy={targetExit.y} r="3" fill={isCritical ? '#ef4444' : 'var(--accent-primary)'} opacity="0.4" />
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              );
            })}
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "grid gap-6 lg:gap-8 min-h-[400px]",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 min-w-[800px]"
              )}
            >
              {floors.filter(f => !isMobile || f.id === activeFloorId).map((floor) => {
                const targetExit = isCritical ? (floor.emergencyExit || floor.exit) : floor.exit;
                return (
                  <div key={floor.id} className="flex flex-col gap-3">
                    {!hideControls && (
                      <div className="flex items-center justify-between px-2">
                        <span className={`text-[9px] font-mono font-bold whitespace-nowrap ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>{floor.label}</span>
                        <div className={`h-[1px] flex-1 mx-2 opacity-20 ${isScanMode ? 'bg-black' : 'bg-border-primary'}`} />
                      </div>
                    )}
                    
                    <div className={`relative aspect-square sm:aspect-[4/5] border rounded-lg overflow-hidden p-2 ${isScanMode ? 'bg-white border-black/10' : 'bg-bg-secondary/20 border-border-primary'}`}>
                      <svg viewBox="0 0 100 100" className="w-full h-full min-h-[250px] lg:min-h-0">
                        <defs>
                          <pattern id="grid-core" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={isScanMode ? '#000' : 'var(--border-primary)'} strokeWidth="0.2" opacity="0.2"/>
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid-core)" />
  
                        {effectiveShowFlowField && isCritical && targetExit && (
                          <g opacity={isRescueMode ? 0.3 : 0.1}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <g key={`grid-row-${i}`}>
                                {Array.from({ length: 8 }).map((_, j) => {
                                  const x = i * 12 + 10;
                                  const y = j * 12 + 10;
                                  const dx = targetExit.x - x;
                                  const dy = targetExit.y - y;
                                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                                  return (
                                    <path 
                                      key={`grid-arrow-${i}-${j}`}
                                      d="M -1.5 0 L 1.5 0 M 0 -0.8 L 1.5 0 L 0 0.8"
                                      transform={`translate(${x}, ${y}) rotate(${angle})`}
                                      stroke={isScanMode ? '#000' : (isRescueMode ? '#10b981' : 'var(--accent-primary)')}
                                      strokeWidth={isRescueMode ? 0.5 : 0.3}
                                      fill="none"
                                      className={effectiveShowFlowField ? "animate-pulse" : ""}
                                      style={{ opacity: 0.4 }}
                                    />
                                  );
                                })}
                              </g>
                            ))}
                          </g>
                        )}

                        {floor.apartments.map((apt) => (
                          <g key={apt.id} onClick={() => handleAptClick(apt.id)} className="cursor-pointer group">
                            <rect 
                              x={apt.x} y={apt.y} width={apt.w} height={apt.h} 
                              fill={isScanMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'} 
                              stroke={isScanMode ? 'rgba(0,0,0,0.3)' : 'var(--accent-primary)'} 
                              strokeWidth="0.8"
                              opacity="0.6"
                            />
                            <text x={apt.x + 2} y={apt.y + 6} fontSize="4" className={`font-mono font-black uppercase tracking-tighter ${isScanMode ? 'fill-black' : 'fill-accent-primary'}`}>{apt.id}</text>
                            
                            {apt.rooms.map((room, idx) => {
                              const roomFullId = `${apt.id}-${room}`;
                              const event = getEventInRoom(roomFullId);
                              const roomW = apt.w;
                              const roomH = apt.h / apt.rooms.length;
                              const roomX = apt.x;
                              const roomY = apt.y + (idx * roomH);
                              const roomOcc = occupancy.find(o => o.roomId === roomFullId);

                              return (
                                <g key={roomFullId}>
                                  <motion.rect
                                    x={roomX} y={roomY} width={roomW} height={roomH}
                                    animate={{
                                      fill: event ? (event.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)') : 'transparent',
                                      stroke: event ? (event.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b') : (isScanMode ? 'rgba(0,0,0,0.05)' : 'var(--border-primary)')
                                    }}
                                    strokeWidth="0.3"
                                  />
                                </g>
                              );
                            })}
                          </g>
                        ))}
                        
                        {(floor as any).communalSpaces?.map((space: any) => {
                          const event = getEventInRoom(space.id);
                          return (
                            <rect 
                              key={space.id}
                              x={space.x} y={space.y} width={space.w} height={space.h} 
                              fill={event ? 'rgba(239, 68, 68, 0.1)' : (isRescueMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)')}
                              stroke={event ? '#ef4444' : (isRescueMode ? '#10b981' : 'var(--border-primary)')}
                              strokeWidth={0.2}
                              opacity="0.5"
                            />
                          );
                        })}

                        {showOccupants && occupancy.filter(o => o.roomId.startsWith(floor.id === 'PH' ? 'PENT' : (floor.id === 'F1' ? 'A' : 'B'))).map((roomOcc) => {
                          const floorAptIds = floor.apartments.map(a => a.id);
                          const isAptRoom = floorAptIds.some(id => roomOcc.roomId.startsWith(id));
                          
                          let baseX = 0;
                          let baseY = 0;
                          let baseW = 100;
                          let baseH = 100;

                          if (isAptRoom) {
                            const aptId = roomOcc.roomId.split('-')[0];
                            const apt = floor.apartments.find(a => a.id === aptId);
                            if (apt) {
                              baseX = apt.x;
                              baseY = apt.y;
                              baseW = apt.w;
                              baseH = apt.h;
                            }
                          } else {
                            const space = (floor as any).communalSpaces?.find((s: any) => s.id === roomOcc.roomId);
                            if (space) {
                              baseX = space.x;
                              baseY = space.y;
                              baseW = space.w;
                              baseH = space.h;
                            }
                          }

                          return roomOcc.people.map((person, pIdx) => {
                            const px = baseX + (person.x / 100) * baseW + (pIdx % 2 - 0.5) * 2;
                            const py = baseY + (person.y / 100) * baseH + (Math.floor(pIdx / 2) % 2 - 0.5) * 2;
                            
                                return (
                                  <circle
                                    key={`${roomOcc.roomId}-${person.id}`}
                                    cx={px} cy={py} r="1"
                                    fill={getRoleColor(person.role)}
                                    className="motion-safe:animate-pulse"
                                  />
                                );
                          });
                        })}

                        {targetExit && (
                          <circle cx={targetExit.x} cy={targetExit.y} r="2" fill={isCritical ? '#ef4444' : 'var(--accent-primary)'} opacity="0.4" />
                        )}
                      </svg>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-6 pt-4 border-t flex items-center gap-4 lg:gap-6 z-10 flex-wrap ${isScanMode ? 'border-black/10' : 'border-border-primary'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className={`text-[8px] font-mono uppercase ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>Host</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          <span className={`text-[8px] font-mono uppercase ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>Staff</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className={`text-[8px] font-mono uppercase ${isScanMode ? 'text-black' : 'text-text-secondary'}`}>Guest</span>
        </div>
      </div>
    </section>
  );
}

const BuildingMapCore = memo(BuildingMapCoreComponent);
export default BuildingMapCore;
