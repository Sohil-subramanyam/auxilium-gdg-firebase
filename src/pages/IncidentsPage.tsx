import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Shield, Zap, Activity } from 'lucide-react';
import LiveAlerts from '../components/LiveAlerts';
import ResponseStatus from '../components/ResponseStatus';
import EventTimeline from '../components/EventTimeline';
import { EmergencyEvent, UserRole } from '../types';

interface IncidentsPageProps {
  role: UserRole;
  events: EmergencyEvent[];
  onResolve: (id: string) => void;
  onSelectEvent: (id: string) => void;
  selectedEventId: string | null;
}

export default function IncidentsPage({ 
  role, 
  events, 
  onResolve, 
  onSelectEvent, 
  selectedEventId 
}: IncidentsPageProps) {
  const selectedEvent = events.find(e => e.id === selectedEventId) || null;
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');

  return (
    <div className="flex flex-col gap-6 h-full font-mono">
      <div className="flex items-center justify-between border-b border-border-primary pb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-accent-secondary" />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-text-primary uppercase italic">Active_Incidents</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">Real-time threat management console</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-text-secondary uppercase">Active_Threats</span>
            <span className="text-xl font-bold text-accent-secondary">{activeEvents.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Incident List */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Activity className="w-3 h-3 text-accent-secondary" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Threat_Feed</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveAlerts 
              events={events} 
              onResolve={onResolve} 
              onSelect={onSelectEvent}
              selectedId={selectedEventId}
            />
          </div>
        </div>

        {/* Right: Detailed Response */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Zap className="w-3 h-3 text-accent-primary" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Response_Protocol</span>
              </div>
              <ResponseStatus event={selectedEvent} onResolve={onResolve} />
            </div>
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Shield className="w-3 h-3 text-accent-primary" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Incident_Timeline</span>
              </div>
              <EventTimeline event={selectedEvent} />
            </div>
          </div>
          
          {!selectedEvent && (
            <div className="flex-1 cyber-panel flex flex-center items-center justify-center border-dashed opacity-50">
              <div className="text-center">
                <Shield className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest text-text-secondary">Select an incident to view response details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
