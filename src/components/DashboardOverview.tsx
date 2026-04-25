import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Cpu, 
  MessageSquare, 
  Send,
  Shield,
  Activity,
  Zap,
  Paperclip,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BuildingMap from '../components/BuildingMap';
import AIPrediction from '../components/AIPrediction';
import VisitCounter from '../components/VisitCounter';
import { EmergencyEvent, ChatMessage, UserRole, RoomOccupancy } from '../types';

interface DashboardOverviewProps {
  role: UserRole;
  events: EmergencyEvent[];
  messages: ChatMessage[];
  occupancy: RoomOccupancy[];
  onSendMessage: (text: string, recipient?: UserRole | 'All') => void;
  onSelectRoom: (room: string) => void;
  onPreempt?: () => void;
}

export default function DashboardOverview({ 
  role, 
  events, 
  messages,
  occupancy,
  onSendMessage,
  onSelectRoom,
  onPreempt
}: DashboardOverviewProps) {
  const [input, setInput] = React.useState('');
  const [recipient, setRecipient] = React.useState<UserRole | 'All'>('All');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const lastMessageRef = React.useRef<string | null>(null);
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input, recipient);
      setInput('');
    }
  };

  const filteredMessages = messages.filter(msg => {
    // 1. Everyone sees 'All' messages
    if (msg.recipient === 'All') return true;
    
    // 2. Strict Privacy: Only sender and designated recipient role see the message
    return msg.recipient === role || msg.role === role;
  });

  React.useEffect(() => {
    const container = chatContainerRef.current;
    if (container && filteredMessages.length > 0) {
      const lastMsg = filteredMessages[filteredMessages.length - 1];
      const wasMe = lastMsg.role === role;
      const isNew = lastMsg.id !== lastMessageRef.current;
      
      if (isNew) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        if (wasMe || isAtBottom) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        lastMessageRef.current = lastMsg.id;
      }
    }
  }, [filteredMessages, role]);

  const chartData = [
    { time: '10:00', severity: 2 },
    { time: '10:15', severity: 5 },
    { time: '10:30', severity: 3 },
    { time: '10:45', severity: 8 },
    { time: '11:00', severity: 4 },
    { time: '11:15', severity: activeEvents.length * 2 },
  ];

  return (
    <div className="flex flex-col gap-6 h-full font-mono">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'System_Status', value: 'OPTIMAL', icon: Shield, color: 'text-accent-primary' },
          { label: 'Active_Threats', value: activeEvents.length, icon: Activity, color: 'text-status-danger' },
          { label: 'Network_Load', value: '12%', icon: Zap, color: 'text-status-warning' },
          { label: 'AI_Confidence', value: '98.4%', icon: Cpu, color: 'text-accent-primary' },
        ].map((stat, i) => (
          <div key={i} className="cyber-panel p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] text-text-secondary uppercase tracking-widest">{stat.label}</span>
              <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
            <stat.icon className={`w-5 h-5 ${stat.color} opacity-20`} />
          </div>
        ))}
        <div className="cyber-panel p-4 flex items-center justify-between">
          <VisitCounter />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Map */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <div className="flex-1 relative">
            <BuildingMap 
              activeEvents={activeEvents} 
              occupancy={occupancy}
              onSelectRoom={onSelectRoom}
            />
          </div>
        </div>

        {/* Right: Analytics & Comms */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          {/* Analytics */}
          <div className="cyber-panel p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Threat_Trends</span>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="severity" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
                  <CartesianGrid stroke="var(--border-primary)" vertical={false} opacity={0.1} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-primary)', fontSize: '9px' }}
                    itemStyle={{ color: 'var(--accent-primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Prediction */}
          <div className="cyber-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-3 h-3 text-accent-primary" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">AI_Predictive_Engine</span>
            </div>
            <AIPrediction onPreempt={onPreempt} />
          </div>

          {/* Comms */}
          <div className="flex-1 flex flex-col cyber-panel p-4 overflow-hidden min-h-[400px] lg:min-h-[200px]">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-4 h-4 text-accent-primary" />
              <h2 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">System_Comms</h2>
            </div>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4"
            >
              {filteredMessages.slice(-20).map((msg) => (
                <div key={msg.id} className="text-[9px] p-2 bg-bg-secondary/30 rounded border border-border-primary">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold whitespace-nowrap ${
                        msg.role === 'Admin' ? 'text-status-danger' : (msg.role === 'Staff' ? 'text-accent-primary' : 'text-status-success')
                      }`}>[{msg.sender}]:</span>
                      {msg.recipient && msg.recipient !== 'All' && (
                        <span className="text-[7px] bg-bg-secondary px-1 border border-border-primary text-text-secondary">TO: {msg.recipient}</span>
                      )}
                    </div>
                    <span className="text-[7px] text-text-secondary opacity-50">{msg.timestamp}</span>
                  </div>
                  <p className="text-text-primary/80 leading-relaxed break-words">{msg.text}</p>
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
                  <option value="Staff">TO: STAFF_ONLY</option>
                  <option value="Guest">TO: GUEST_ONLY</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type message..." 
                  className="flex-1 bg-bg-primary border border-border-primary rounded px-2 py-1.5 text-[9px] font-mono focus:outline-none focus:border-accent-primary text-text-primary placeholder:text-text-secondary/30"
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
        </div>
      </div>
    </div>
  );
}
