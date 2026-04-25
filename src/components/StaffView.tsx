import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Navigation, AlertCircle, CheckCircle2, Shield, Radio, MessageSquare, Send, Paperclip, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import BuildingMap from './BuildingMap';
import QRModal from './QRModal';
import { EmergencyEvent, ChatMessage, RoomOccupancy, UserRole } from '../types';

interface StaffViewProps {
  events: EmergencyEvent[];
  messages: ChatMessage[];
  occupancy: RoomOccupancy[];
  onSendMessage: (text: string, recipient?: UserRole | 'All') => void;
  onStaffAction: (eventId: string, actionType: 'ARRIVAL' | 'BACKUP') => void;
  onSelectRoom: (room: string) => void;
  currentUser: string | null;
}

export default function StaffView({ events, messages, occupancy, onSendMessage, onStaffAction, onSelectRoom, currentUser }: StaffViewProps) {
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState<UserRole | 'All'>('All');
  const [enlargedQR, setEnlargedQR] = useState<{ value: string, title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');
  const assignedEvents = activeEvents.filter(e => e.assignedTeam.includes('Staff') || e.assignedTeam.includes('Security') || e.assignedTeam.includes('Fire') || e.assignedTeam.includes('Medical'));

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(msg => {
    // 1. Everyone sees 'All' messages
    if (msg.recipient === 'All') return true;
    
    // 2. Private messages: sender and recipient see
    return msg.recipient === 'Staff' || msg.role === 'Staff';
  });

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && filteredMessages.length > 0) {
      const lastMsg = filteredMessages[filteredMessages.length - 1];
      const wasMe = lastMsg.role === 'Staff';
      const isNew = lastMsg.id !== lastMessageRef.current;
      
      if (isNew) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        if (wasMe || isAtBottom) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        lastMessageRef.current = lastMsg.id;
      }
    }
  }, [filteredMessages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input, recipient);
      setInput('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full bg-bg-primary text-text-primary font-sans overflow-y-auto lg:overflow-hidden p-4">
      {/* Left Column: Map */}
      <div className="col-span-1 lg:col-span-8 flex flex-col gap-6 h-[500px] lg:h-auto">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Operational Tactical View</h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3" />
              <span>Channel: SEC_ALPHA</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Status: ACTIVE_DUTY</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-border-primary bg-bg-secondary/50 relative">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-bg-panel backdrop-blur-md border border-border-primary p-2 rounded text-[9px] font-mono text-text-secondary">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                <span>STAFF_UNITS: 12</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                <span>THREAT_ZONES: {activeEvents.length}</span>
              </div>
            </div>
          </div>
          <BuildingMap 
            activeEvents={activeEvents} 
            occupancy={occupancy}
            onSelectRoom={onSelectRoom}
          />
        </div>
      </div>

      {/* Right Column: Tasks & Comms */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 overflow-hidden h-[600px] lg:h-auto">
        <div className="flex-[2] flex flex-col gap-4 bg-bg-secondary/50 border border-border-primary rounded-xl p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-primary pb-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-accent-primary" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Active Assignments</h2>
            </div>
            <span className="bg-accent-primary/10 text-accent-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-accent-primary/20">
              {assignedEvents.length} Tasks
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {assignedEvents.length > 0 ? assignedEvents.map(event => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-lg border border-border-primary bg-bg-primary/50 hover:border-accent-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-text-secondary font-bold tracking-tighter">INCIDENT_{event.id}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                    event.severity === 'CRITICAL' ? 'bg-accent-secondary/20 text-accent-secondary' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {event.severity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">{event.type}</h3>
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
                
                <div className="p-3 bg-accent-primary/5 border-l-2 border-accent-primary rounded-r-md mb-4 flex items-center justify-between gap-4">
                  <p className="text-xs text-text-primary/80 leading-relaxed font-medium">
                    {event.recommendedAction}
                  </p>
                  <div 
                    onClick={() => setEnlargedQR({
                      value: `${window.location.origin}/incident/${event.id}`,
                      title: `Mission Data: ${event.id}`,
                    })}
                    className="shrink-0 p-1 bg-white rounded shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  >
                    <QRCodeSVG 
                      value={`${window.location.origin}/incident/${event.id}`}
                      size={32}
                      level="M"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onStaffAction(event.id, 'ARRIVAL')}
                      disabled={event.status === 'IN_PROGRESS' || event.requesterId === currentUser}
                      className={`py-2 text-[10px] font-bold rounded-md transition-all uppercase tracking-widest ${
                        (event.status === 'IN_PROGRESS' || event.requesterId === currentUser)
                          ? 'bg-status-success/20 text-status-success cursor-not-allowed border border-status-success/30' 
                          : 'bg-accent-primary hover:bg-accent-primary/80 text-bg-primary'
                      }`}
                    >
                      {event.status === 'IN_PROGRESS' 
                        ? 'Already at Location' 
                        : (event.requesterId === currentUser ? 'Awaiting Backup' : 'Confirm Arrival')}
                    </button>
                  <button 
                    onClick={() => onStaffAction(event.id, 'BACKUP')}
                    className="py-2 bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary text-[10px] font-bold rounded-md transition-all uppercase tracking-widest border border-border-primary"
                  >
                    Request Backup
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary/20 gap-3">
                <CheckCircle2 className="w-12 h-12" />
                <span className="text-xs font-bold uppercase tracking-widest">No active assignments</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-bg-secondary/50 border border-border-primary rounded-xl p-6 overflow-hidden min-h-[400px] lg:min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-text-secondary" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Field Comms</h2>
          </div>
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4"
          >
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="text-[10px] p-2 bg-bg-primary/20 rounded border border-border-primary">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      msg.role === 'Admin' ? 'text-accent-secondary' : (msg.role === 'Staff' ? 'text-accent-primary' : 'text-green-500')
                    }`}>[{msg.sender}]:</span>
                    {msg.recipient && msg.recipient !== 'All' && (
                      <span className="text-[8px] bg-bg-secondary px-1 border border-border-primary text-text-secondary">TO: {msg.recipient}</span>
                    )}
                  </div>
                  <span className="text-[8px] text-text-secondary opacity-50">{msg.timestamp}</span>
                </div>
                <p className="text-text-secondary leading-relaxed">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value as any)}
                className="bg-bg-primary border border-border-primary rounded px-2 py-1 text-[8px] font-mono text-accent-primary outline-none focus:border-accent-primary cursor-pointer hover:bg-bg-secondary transition-colors"
              >
                <option value="All">TO: ALL_UNITS</option>
                <option value="Admin">TO: ADMIN_HQ</option>
                <option value="Guest">TO: GUEST_RESIDENTS</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type message..." 
                className="flex-1 bg-bg-primary border border-border-primary rounded px-3 py-2 text-[10px] text-text-primary focus:outline-none focus:border-accent-primary placeholder:text-text-secondary/30"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-accent-primary rounded text-bg-primary hover:bg-accent-primary/80 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <QRModal 
        isOpen={!!enlargedQR}
        onClose={() => setEnlargedQR(null)}
        value={enlargedQR?.value || ''}
        title={enlargedQR?.title || ''}
        subtitle="Rescue Tactical Link"
      />
    </div>
  );
}
