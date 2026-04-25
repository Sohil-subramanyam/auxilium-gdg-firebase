import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Activity, 
  Zap, 
  BarChart3, 
  Users, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Send,
  Terminal,
  Shield,
  Cpu,
  Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BuildingMap from './BuildingMap';
import LiveAlerts from './LiveAlerts';
import ResponseStatus from './ResponseStatus';
import AIPrediction from './AIPrediction';
import EventTimeline from './EventTimeline';
import EventStream from './EventStream';
import { EmergencyEvent, ChatMessage, RoomOccupancy } from '../types';

interface AdminViewProps {
  events: EmergencyEvent[];
  messages: ChatMessage[];
  occupancy: RoomOccupancy[];
  onSendMessage: (text: string) => void;
  onResolve: (id: string) => void;
  onSelectEvent: (id: string) => void;
  selectedEventId: string | null;
  onSelectRoom: (room: string) => void;
}

export default function AdminView({ 
  events, 
  messages,
  occupancy,
  onSendMessage,
  onResolve, 
  onSelectEvent, 
  selectedEventId, 
  onSelectRoom 
}: AdminViewProps) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');
  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Mock chart data based on events
  const chartData = [
    { time: '10:00', severity: 2 },
    { time: '10:15', severity: 5 },
    { time: '10:30', severity: 3 },
    { time: '10:45', severity: 8 },
    { time: '11:00', severity: 4 },
    { time: '11:15', severity: activeEvents.length * 2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full bg-transparent p-2 font-mono overflow-y-auto lg:overflow-hidden custom-scrollbar">
      {/* Sidebar Stats - Hidden on mobile, shown on tablet/laptop */}
      <div className="hidden lg:flex flex-col gap-4 border-r border-stealth-border pr-4 py-4 w-16">
        <div className="flex flex-col items-center gap-6">
          <div className="p-2 border border-accent-primary/30 bg-accent-primary/5">
            <Shield className="w-5 h-5 text-accent-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-text-secondary uppercase">CPU</span>
            <div className="w-1 h-12 bg-bg-secondary relative">
              <div className="absolute bottom-0 w-full bg-accent-primary h-1/3" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-text-secondary uppercase">MEM</span>
            <div className="w-1 h-12 bg-bg-secondary relative">
              <div className="absolute bottom-0 w-full bg-accent-primary h-1/2" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-text-secondary uppercase">NET</span>
            <div className="w-1 h-12 bg-bg-secondary relative">
              <div className="absolute bottom-0 w-full bg-accent-primary h-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-11 gap-4 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {/* Left Column: Alerts & Comms */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-[400px] lg:h-full overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Activity className="w-3 h-3 text-accent-secondary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Live_Threat_Feed</span>
            </div>
            <LiveAlerts 
              events={events} 
              onResolve={onResolve} 
              onSelect={onSelectEvent}
              selectedId={selectedEventId}
            />
          </div>
          
          <div className="h-64 flex flex-col cyber-panel p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-4 h-4 text-accent-primary" />
              <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">HQ_Comms</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="text-[9px] p-2 bg-bg-secondary/30 rounded border border-border-primary">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className={`font-bold whitespace-nowrap ${
                      msg.role === 'Admin' ? 'text-accent-secondary' : (msg.role === 'Staff' ? 'text-blue-500' : 'text-green-500')
                    }`}>[{msg.sender}]:</span>
                    <span className="text-[7px] text-text-secondary whitespace-nowrap">{msg.timestamp}</span>
                  </div>
                  <p className="text-text-primary/80 leading-relaxed break-words">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Broadcast..." 
                className="flex-1 bg-bg-secondary/40 border border-border-primary rounded px-2 py-1.5 text-[9px] font-mono focus:outline-none focus:border-accent-primary text-text-primary"
              />
              <button 
                onClick={handleSend}
                className="p-1.5 bg-accent-primary/10 border border-accent-primary/30 rounded text-accent-primary hover:bg-accent-primary/20 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Map & Analytics */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-[500px] lg:h-full overflow-hidden">
          <div className="flex-[2] flex flex-col relative min-h-[300px]">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-bg-panel backdrop-blur-md border border-accent-primary/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-accent-primary uppercase tracking-widest whitespace-nowrap">Live_Feed_Active</span>
            </div>
            <BuildingMap 
              activeEvents={activeEvents} 
              occupancy={occupancy}
              onSelectRoom={onSelectRoom}
            />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="cyber-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-3 h-3 text-accent-primary" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Threat_Analytics</span>
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="severity" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
                    <CartesianGrid stroke="var(--border-primary)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-primary)', fontSize: '9px' }}
                      itemStyle={{ color: 'var(--accent-primary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="cyber-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-3 h-3 text-accent-primary" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">AI_Predictive</span>
              </div>
              <AIPrediction />
            </div>
          </div>
        </div>

        {/* Right Column: Response & Timeline */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-[400px] lg:h-full overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Zap className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Protocol_Status</span>
            </div>
            <ResponseStatus event={selectedEvent} onResolve={onResolve} />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Database className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Incident_Lifecycle</span>
            </div>
            <EventTimeline event={selectedEvent} />
          </div>
          <div className="h-48 flex flex-col">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Terminal className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Command_Log</span>
            </div>
            <EventStream event={selectedEvent} />
          </div>
        </div>
      </div>
    </div>
  );
}
