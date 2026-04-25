import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Navigation, 
  Phone, 
  Info, 
  AlertTriangle, 
  ArrowRight, 
  MessageSquare,
  Send,
  X,
  MapPin,
  Heart,
  Paperclip,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import BuildingMap from './BuildingMap';
import RouteMapModal from './RouteMapModal';
import QRModal from './QRModal';
import { EmergencyEvent, RoomOccupancy, ChatMessage, UserRole } from '../types';

interface GuestViewProps {
  events: EmergencyEvent[];
  messages: ChatMessage[];
  occupancy: RoomOccupancy[];
  onSendMessage: (text: string, recipient?: UserRole | 'All') => void;
  onSelectRoom: (room: string) => void;
}

export default function GuestView({ events, messages, occupancy, onSendMessage, onSelectRoom }: GuestViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [recipient, setRecipient] = useState<UserRole | 'All'>('Staff');
  const [forceEvacRoute, setForceEvacRoute] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [enlargedQR, setEnlargedQR] = useState<{ value: string, title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);
  
  const activeEvents = useMemo(() => events.filter(e => e.status !== 'RESOLVED'), [events]);
  const criticalEvents = useMemo(() => activeEvents.filter(e => e.priority === 'CRITICAL' || e.priority === 'HIGH'), [activeEvents]);
  const hasEmergency = criticalEvents.length > 0;

  const safetyScore = useMemo(() => Math.max(0, 100 - (activeEvents.length * 15) - (hasEmergency ? 30 : 0)), [activeEvents.length, hasEmergency]);

  const filteredMessages = useMemo(() => messages.filter(msg => {
    // 1. Everyone sees 'All' messages
    if (msg.recipient === 'All') return true;
    
    // 2. Private messages: only sender and recipient can see
    // Guests only see messages if they are the sender or the recipient is 'Guest'
    return msg.recipient === 'Guest' || msg.role === 'Guest';
  }), [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && filteredMessages.length > 0) {
      const lastMsg = filteredMessages[filteredMessages.length - 1];
      const wasMe = lastMsg.role === 'Guest';
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
    if (chatInput.trim()) {
      onSendMessage(chatInput, recipient);
      setChatInput('');
    }
  };

  return (
    <div className="min-h-full bg-bg-primary text-text-primary font-serif p-4 md:p-8 overflow-y-auto transition-colors duration-500">
      <RouteMapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        activeEvents={activeEvents}
        occupancy={occupancy}
        title="Immediate Evacuation Route"
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Map & Status */}
        <div className="col-span-1 md:col-span-2 lg:col-span-7 flex flex-col gap-8">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border-primary pb-8">
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-accent-primary"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[11px] font-sans uppercase tracking-[0.3em] font-bold">Safety_Protocol_Active</span>
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-text-primary">
                {hasEmergency ? "Emergency Guidance" : "Your Safety is Our Priority"}
              </h1>
              <p className="text-base md:text-lg text-text-secondary font-light max-w-xl italic">
                {hasEmergency 
                  ? "Please follow the instructions below and remain calm. Our response teams are on site." 
                  : "Welcome to Auxilium. All safety systems are fully operational and monitoring your environment 24/7."}
              </p>
            </div>

            {/* Safety Score Widget */}
            <div className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-3xl shadow-sm border border-border-primary min-w-[120px] self-start sm:self-auto">
              <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-text-secondary">Safety Score</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-border-primary"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={176}
                    initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 176 - (176 * safetyScore) / 100 }}
                    className={safetyScore > 70 ? "text-green-500" : (safetyScore > 40 ? "text-amber-500" : "text-accent-secondary")}
                  />
                </svg>
                <span className="absolute text-xl font-sans font-bold text-text-primary">{safetyScore}</span>
              </div>
            </div>
          </header>

          <div className="aspect-[16/10] rounded-[32px] overflow-hidden shadow-2xl border border-border-primary bg-bg-secondary p-4 min-h-[400px] relative group/map flex flex-col">
            <BuildingMap 
              activeEvents={activeEvents} 
              occupancy={occupancy}
              onSelectRoom={onSelectRoom}
              forceShowFlowField={forceEvacRoute}
            />
            <div className="absolute bottom-4 right-4 bg-bg-panel/80 backdrop-blur-md border border-border-primary px-3 py-1.5 rounded-full text-[10px] font-sans font-bold text-text-secondary opacity-0 group-hover/map:opacity-100 transition-opacity pointer-events-none">
              SCROLL_TO_PAN_MAP
            </div>
          </div>
        </div>

        {/* Right Column: Instructions & Actions */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col gap-8">
          {hasEmergency ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-accent-secondary text-white p-6 md:p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <AlertTriangle className="w-24 h-24" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-sans uppercase tracking-widest font-bold">Immediate Action Required</span>
                </div>

                <div className="space-y-6">
                  {criticalEvents.map(event => (
                    <div key={event.id} className="space-y-3">
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-sans uppercase tracking-widest">{event.type} DETECTED IN {event.location}</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold leading-tight">
                        {event.recommendedAction}
                      </h2>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                        <button 
                          onClick={() => setIsMapModalOpen(true)}
                          className="bg-white text-accent-secondary px-6 py-3 rounded-2xl font-sans font-black uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                          <Navigation className="w-4 h-4" /> View Full Route Map
                        </button>
                        <div 
                          onClick={() => setEnlargedQR({
                            value: `${window.location.origin}/guest`,
                            title: "Guest Safety HUD",
                          })}
                          className="flex items-center gap-4 p-3 bg-white/10 rounded-2xl border border-white/20 cursor-pointer hover:bg-white/15 transition-all group"
                        >
                          <div className="p-1 bg-white rounded-sm shrink-0 group-hover:scale-110 transition-transform">
                             <QRCodeSVG 
                                value={`${window.location.origin}/guest`}
                                size={40}
                                level="M"
                             />
                          </div>
                          <div>
                            <span className="text-[8px] font-sans font-black uppercase tracking-widest block text-white/80">Scan for Mobile HUD</span>
                            <span className="text-[7px] font-sans uppercase tracking-[0.2em] opacity-40">Dynamic_Route_Sync</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-bg-secondary p-6 md:p-10 rounded-[40px] shadow-xl border border-border-primary space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-text-primary">Current Status</h3>
                <div className="flex items-center gap-3 text-green-500">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-sans uppercase tracking-widest text-xs font-bold">All Systems Normal</span>
                </div>
                <p className="text-text-secondary leading-relaxed italic">
                  No active incidents reported in your area. You are in a secure zone.
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-sans uppercase tracking-widest font-bold text-text-secondary opacity-50">Safety Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Nearest Exit", value: "Main Lobby (F1)", icon: Navigation },
                    { label: "Assembly Point", value: "North Garden", icon: MapPin },
                    { label: "Security Desk", value: "EXT 404", icon: Phone },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-bg-primary border border-border-primary">
                      <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center shadow-sm border border-border-primary">
                        <item.icon className="w-4 h-4 text-accent-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-sans uppercase tracking-widest text-text-secondary opacity-50 font-bold">{item.label}</p>
                        <p className="text-sm font-bold text-text-primary">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-10 rounded-[40px] border border-dashed border-border-primary flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center border border-border-primary">
              <Heart className="w-6 h-6 text-text-secondary opacity-20" />
            </div>
            <h3 className="text-lg font-bold italic text-text-primary">Need Assistance?</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              If you have questions about building safety or need non-emergency help, our concierge is here 24/7.
            </p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="text-accent-primary font-sans font-bold uppercase tracking-widest text-[10px] border-b border-accent-primary pb-1 hover:text-text-primary transition-colors"
            >
              Contact Safety Concierge
            </button>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-8 md:bottom-8 w-auto md:w-96 max-h-[70vh] md:max-h-[600px] bg-bg-panel rounded-3xl shadow-2xl border border-border-primary z-[400] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            <div className="p-4 bg-accent-primary text-bg-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold">Safety Concierge</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-black/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-4 py-2 border-b border-border-primary bg-bg-primary">
              <label className="text-[8px] font-sans uppercase tracking-widest text-text-secondary block mb-1">Recipient</label>
              <select 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value as any)}
                className="w-full bg-transparent text-[10px] font-sans font-bold text-accent-primary focus:outline-none cursor-pointer"
              >
                <option value="Staff">Safety Concierge (Staff)</option>
                <option value="Admin">Building Manager (Admin)</option>
                <option value="All">Broadcast (All)</option>
              </select>
            </div>
 
            <div 
              ref={chatContainerRef}
              className="h-64 p-4 overflow-y-auto font-sans text-[11px] space-y-3 bg-bg-secondary/50 custom-scrollbar"
            >
              {filteredMessages.map((msg, i) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'Guest' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    msg.role === 'Guest' ? 'bg-accent-primary text-bg-primary rounded-tr-none' : 'bg-bg-primary text-text-primary border border-border-primary rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] opacity-40 mt-1">
                    {msg.role === 'Guest' ? 'You' : msg.sender} • {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
              {filteredMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-30 gap-2">
                  <MessageSquare className="w-8 h-8" />
                  <span className="text-[10px] uppercase tracking-widest">No messages yet</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-primary flex gap-2 bg-bg-panel">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onSendMessage(`[Attachment: ${file.name}]`, recipient);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-bg-secondary border border-border-primary rounded-xl text-text-secondary hover:text-accent-primary transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..." 
                className="flex-1 bg-bg-primary border border-border-primary rounded-xl px-3 py-2 text-xs font-sans text-text-primary focus:outline-none focus:border-accent-primary"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-accent-primary text-bg-primary rounded-xl hover:bg-accent-primary/80 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QRModal 
        isOpen={!!enlargedQR}
        onClose={() => setEnlargedQR(null)}
        value={enlargedQR?.value || ''}
        title={enlargedQR?.title || ''}
        subtitle="Guest Emergency Access Link"
      />
    </div>
  );
}
