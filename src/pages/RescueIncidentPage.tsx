import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion } from 'motion/react';
import { Shield, MapPin, AlertCircle, Clock, ChevronLeft, Activity, Flame, Wind, AlertTriangle, QrCode, Navigation, UserCheck, PlusSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import BuildingMap from '../components/BuildingMap';
import RouteMapModal from '../components/RouteMapModal';
import QRModal from '../components/QRModal';
import { EmergencyEvent, RoomOccupancy } from '../types';

export default function RescueIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EmergencyEvent | null>(null);
  const [occupancy, setOccupancy] = useState<RoomOccupancy[]>([]);
  const [enlargedQR, setEnlargedQR] = useState<{ value: string, title: string } | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Attempt to fetch event data via API as a fallback/immediate load
    fetch(`/api/incidents/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 403 || res.status === 401 ? "Access Denied: Rescue Authentication Required" : "Incident Expired");
        return res.json();
      })
      .then(data => {
        if (data.id) setEvent(data);
        else setError("Incident record not found.");
      })
      .catch((err) => setError(err.message || "Network link failure."));

    fetch('/api/occupancy')
      .then(res => res.json())
      .then(data => setOccupancy(data))
      .catch(err => console.error("Rescue occupancy fetch failed:", err));

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('event_history', (history: EmergencyEvent[]) => {
      const found = history.find(e => e.id === id);
      if (found) setEvent(found);
    });

    newSocket.on('emergency_event', (e: EmergencyEvent) => {
      if (e.id === id) setEvent(e);
    });

    newSocket.on('event_updated', (e: EmergencyEvent) => {
      if (e.id === id) setEvent(e);
    });

    newSocket.on('occupancy_update', (data: RoomOccupancy[]) => {
      setOccupancy(data);
    });

    return () => {
      newSocket.close();
    };
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6">
        <div className="text-center">
          <Activity className="w-12 h-12 text-accent-secondary animate-pulse mx-auto mb-4" />
          <h1 className="text-xl font-mono font-black uppercase tracking-widest">Searching_Incident...</h1>
          <p className="text-text-secondary text-xs mt-2 uppercase">ID: {id}</p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-status-danger border-status-danger bg-status-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      case 'HIGH': return 'text-status-warning border-status-warning bg-status-warning/10';
      case 'MEDIUM': return 'text-accent-primary border-accent-primary bg-accent-primary/10';
      default: return 'text-text-secondary border-border-primary bg-bg-secondary/20';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FIRE': return <Flame className="w-6 h-6" />;
      case 'GAS': return <Wind className="w-6 h-6" />;
      case 'PANIC': return <AlertTriangle className="w-6 h-6" />;
      case 'MEDICAL': return <Activity className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const handleStaffAction = (actionType: string) => {
    if (socket && event) {
      socket.emit('staff_action', { 
        eventId: event.id, 
        actionType,
        staffName: "Staff_Alpha_Unit", // Simulated identity
        metadata: { notes: `Via Rescue Terminal` }
      });
    }
  };

  const getAptId = (location: string) => {
    // Standardize location to extract Apartment ID (e.g., "A101 - Bedroom" -> "A101")
    return location.split(' - ')[0].split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono selection:bg-accent-primary selection:text-bg-primary flex flex-col">
      <RouteMapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        activeEvents={event ? [event] : []}
        occupancy={occupancy}
        isRescueMode={true}
        title={`Tactical Evacuation: ${event.type} @ ${event.location}`}
        focusApt={getAptId(event.location)}
      />
      {/* Header */}
      <div className="p-4 border-b border-border-primary bg-bg-secondary/40 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link to="/" className="p-2 border border-border-primary hover:border-accent-primary transition-colors text-text-secondary hover:text-accent-primary">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-secondary">Rescue_Active_Terminal</h1>
          <p className="text-[8px] opacity-50 uppercase tracking-widest">Incident_ID: {event.id}</p>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-6 max-w-7xl mx-auto w-full">
        {/* Status Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`p-6 border rounded-lg flex flex-col lg:flex-row items-center gap-6 lg:gap-12 ${getSeverityStyle(event.severity)}`}
        >
          <div className="p-4 bg-bg-primary/20 rounded-full shrink-0 animate-pulse">
            {getIcon(event.type)}
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
              {event.isSimulated && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm mr-2 align-middle">
                  {event.source === 'AUTO' ? 'AUTO_SIM' : 'SIMULATED'}
                </span>
              )}
              {event.type}_EMERGENCY
            </h2>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-[10px] uppercase opacity-80">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className="flex items-center gap-1 font-bold"><Shield className="w-3 h-3" /> STTS: {event.status}</span>
            </div>
          </div>
          <div className="px-4 py-2 border border-current rounded font-black text-sm uppercase tracking-widest">
            {event.severity}_LEVEL
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Map Viewer */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <div className="flex items-center gap-2 mb-3 bg-bg-secondary px-3 py-1.5 border border-border-primary rounded-t-lg">
              <AlertCircle className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live_Structural_Floor_Map</span>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <BuildingMap 
                activeEvents={[event]} 
                occupancy={occupancy} 
                onSelectRoom={() => {}}
                forceShowFlowField={true}
                isRescueMode={true}
                focusApt={getAptId(event.location)}
              />
            </div>
          </div>

          {/* Action Protocols & Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="cyber-panel p-6 flex flex-col gap-4">
              <div className="cyber-corner corner-tl" />
              <div className="cyber-corner corner-br" />
              <h3 className="text-xs font-black uppercase tracking-widest text-accent-primary border-b border-border-primary pb-2 flex items-center justify-between">
                <span>Tactical_Overview</span>
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-text-secondary uppercase">Danger_Intensity</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: event.severity === 'CRITICAL' ? '100%' : (event.severity === 'HIGH' ? '75%' : '40%') }}
                        className={`h-full ${event.severity === 'CRITICAL' ? 'bg-status-danger' : 'bg-status-warning'}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-text-primary underline decoration-status-danger">{event.severity}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-text-secondary uppercase">Occupancy_Load</span>
                  <span className="text-[10px] font-bold text-text-primary">
                    {occupancy.reduce((acc, curr) => acc + curr.people.length, 0)} TOTAL_SOULS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handleStaffAction('ARRIVAL')}
                  disabled={event.status === 'IN_PROGRESS'}
                  className={`flex items-center justify-center gap-2 py-3 border rounded transition-all group ${
                    event.status === 'IN_PROGRESS' 
                      ? 'bg-status-success/20 border-status-success/40 text-status-success cursor-not-allowed' 
                      : 'bg-status-success/10 border-status-success/30 text-status-success hover:bg-status-success/20'
                  }`}
                >
                  <UserCheck className="w-4 h-4 group-active:scale-95" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">
                    {event.status === 'IN_PROGRESS' ? 'Already at Location' : 'Confirm Arrival'}
                  </span>
                </button>
                <button 
                  onClick={() => handleStaffAction('BACKUP')}
                  className="flex items-center justify-center gap-2 py-3 bg-accent-primary/10 border border-accent-primary/30 rounded text-accent-primary hover:bg-accent-primary/20 transition-all group"
                >
                  <PlusSquare className="w-4 h-4 group-active:scale-95" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Request Backup</span>
                </button>
              </div>

              <div className="space-y-3 mt-2">
                <div 
                   onClick={() => setIsMapModalOpen(true)}
                   className="flex items-start gap-3 p-3 bg-accent-primary text-bg-primary rounded cursor-pointer hover:brightness-110 transition-all shadow-lg"
                >
                  <Navigation className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase block">View Detailed Route</span>
                    <span className="text-[8px] uppercase font-bold opacity-80">Full-Screen Tactical Plan</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-status-success/5 border border-status-success/20 rounded">
                  <Shield className="w-4 h-4 text-status-success shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold uppercase text-status-success block">Primary_Safe_Zone</span>
                    <span className="text-[8px] text-text-secondary uppercase">Stairwell A // Level 01 Lobby</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-border-primary bg-bg-secondary/40 rounded flex flex-col items-center gap-3">
                 <div 
                   onClick={() => setEnlargedQR({
                     value: `${window.location.origin}/incident/${event.id}`,
                     title: `Rescue HUD: ${event.id}`,
                   })}
                   className="p-2 bg-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer hover:scale-105 transition-transform"
                 >
                    <QRCodeSVG 
                      value={`${window.location.origin}/incident/${event.id}`}
                      size={100}
                      level="M"
                      includeMargin={false}
                    />
                 </div>
                 <div className="text-center">
                    <span className="text-[8px] font-mono font-black text-text-secondary uppercase tracking-[0.2em] block mb-1">Rescue_Team_Entry_Link</span>
                    <span className="text-[7px] text-accent-secondary opacity-50 uppercase italic">Scan for Mobile HUD Access</span>
                 </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border-primary">
                <div className="flex items-center justify-between text-[10px] uppercase text-text-secondary">
                  <span>Target_Location</span>
                  <span className="text-text-primary font-bold">{event.location}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase text-text-secondary">
                  <span>Assigned_Unit</span>
                  <span className="text-text-primary font-bold">{event.assignedTeam}</span>
                </div>
              </div>
            </section>

            <section className="cyber-panel p-6 flex-1 flex flex-col gap-4">
              <div className="cyber-corner corner-tr" />
              <div className="cyber-corner corner-bl" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary border-b border-border-primary pb-2">
                Mission_Log
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {event.actions.slice().reverse().map((action, i) => (
                  <div key={action.id} className="border-l-2 border-border-primary pl-3 py-1 relative">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-border-primary" />
                    <span className="text-[8px] opacity-40 uppercase block mb-1">
                      {new Date(action.timestamp).toLocaleTimeString()} // {action.type}
                    </span>
                    <p className="text-[10px] uppercase tracking-tight text-text-secondary">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="p-2 border-t border-border-primary bg-bg-secondary/20 flex flex-wrap items-center justify-center gap-4 lg:gap-8 text-[8px] font-mono uppercase opacity-50 tracking-widest text-center">
        <span>G-AUTH: RESCUE_PERSONNEL_IDENTIFIED</span>
        <span>LAT: 40.7128° N, LON: 74.0060° W</span>
        <span>SYS_VER: 5.0.42_R</span>
        <span>CONNECTION_STATUS: SECURE_STABLE</span>
      </div>
      <QRModal 
        isOpen={!!enlargedQR}
        onClose={() => setEnlargedQR(null)}
        value={enlargedQR?.value || ''}
        title={enlargedQR?.title || ''}
        subtitle="Rescue Tactical Team Access"
      />
    </div>
  );
}
