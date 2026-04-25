import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Search, Filter, Download, ChevronDown, Clock, Shield, MapPin, Activity, AlertCircle } from 'lucide-react';
import { EmergencyEvent } from '../types';
import * as XLSX from 'xlsx';

export default function HistoryPage() {
  const [history, setHistory] = useState<EmergencyEvent[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  const downloadLogsExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Prepare logs data for Excel
    const logData = history.map(event => ({
      ID: event.id,
      Type: event.type,
      Location: event.location,
      Severity: event.severity,
      Status: event.status,
      Resolved_At: new Date(event.timestamp).toLocaleString(),
      Assigned_Team: event.assignedTeam,
      Recommended_Action: event.recommendedAction
    }));

    const ws = XLSX.utils.json_to_sheet(logData);
    XLSX.utils.book_append_sheet(wb, ws, "Incident Logs");
    
    XLSX.writeFile(wb, "Auxilium_Incident_Logs.xlsx");
  };

  const filteredHistory = history.filter(event => {
    const matchesFilter = filter === 'ALL' || event.type === filter;
    const matchesSearch = event.location.toLowerCase().includes(search.toLowerCase()) || 
                          event.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase italic tracking-tighter">
            INCIDENT_ARCHIVE<span className="text-accent-primary">.LOGS</span>
          </h1>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-1">
            Historical database of resolved emergency events
          </p>
        </div>
        <button 
          onClick={downloadLogsExcel}
          className="flex items-center gap-2 bg-bg-secondary border border-border-primary px-4 py-2 text-xs font-mono text-text-secondary hover:text-accent-primary transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT_DATA</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="cyber-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-50" />
            <input 
              type="text"
              placeholder="SEARCH_BY_ID_OR_LOCATION..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-secondary/40 border border-border-primary pl-10 pr-4 py-2 text-xs font-mono text-text-primary focus:border-accent-primary outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-text-secondary opacity-50" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-bg-secondary/40 border border-border-primary px-4 py-2 text-xs font-mono text-text-primary focus:border-accent-primary outline-none transition-colors"
            >
              <option value="ALL">ALL_TYPES</option>
              <option value="FIRE">FIRE</option>
              <option value="GAS">GAS</option>
              <option value="PANIC">PANIC</option>
              <option value="MEDICAL">MEDICAL</option>
            </select>
          </div>
        </div>

        {/* Tactical Card List (New Scrolling View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 custom-scrollbar p-2">
          {filteredHistory.length > 0 ? filteredHistory.map((event, idx) => (
            <div 
              key={event.id}
              className="perspective-1000 h-[220px] w-full group relative"
              onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
            >
              <motion.div 
                className="w-full h-full relative transition-all duration-700 preserve-3d"
                animate={{ rotateY: expandedId === event.id ? 180 : 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden cyber-panel p-5 flex flex-col justify-between bg-bg-panel/80">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      event.type === 'FIRE' ? 'bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary' :
                      event.type === 'GAS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                      event.type === 'PANIC' ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' :
                      'bg-green-500/10 border-green-500/30 text-green-500'
                    }`}>
                      <History className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold text-accent-primary tracking-tighter">#{event.id}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-mono font-black text-green-500">ARCHIVED</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em]">{event.type}</span>
                    <h3 className="text-lg font-bold text-text-primary truncate leading-tight group-hover:text-accent-primary transition-colors">{event.location}</h3>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-primary/50">
                    <span className={`text-[9px] font-black px-2 py-1 border rounded uppercase tracking-widest ${
                      event.severity === 'CRITICAL' ? 'border-accent-secondary text-accent-secondary' :
                      event.severity === 'HIGH' ? 'border-amber-500 text-amber-500' :
                      'border-text-secondary text-text-secondary'
                    }`}>
                      {event.severity}_LOAD
                    </span>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-text-secondary">
                      <span>TAP_TO_FLIP</span>
                      <ChevronDown className="w-3 h-3 group-hover:animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden cyber-panel p-5 [transform:rotateY(180deg)] bg-bg-secondary flex flex-col gap-4 overflow-hidden border-accent-primary/30">
                  <div className="flex items-center justify-between border-b border-border-primary pb-2">
                    <span className="text-[9px] font-mono font-black text-accent-primary uppercase tracking-widest">Incident_Protocol_Archive</span>
                    <span className="text-[9px] font-mono text-text-secondary">#{event.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[9px]">
                    <div className="space-y-2">
                      <div>
                        <p className="text-text-secondary uppercase font-bold tracking-tighter opacity-50 mb-0.5">Resolved_At</p>
                        <p className="font-bold text-text-primary">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary uppercase font-bold tracking-tighter opacity-50 mb-0.5">Assigned_Unit</p>
                        <p className="font-bold text-text-primary uppercase">{event.assignedTeam || 'FACILITY_HQ'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div>
                        <p className="text-text-secondary uppercase font-bold tracking-tighter opacity-50 mb-0.5">Precise_Loc</p>
                        <p className="font-bold text-text-primary">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary uppercase font-bold tracking-tighter opacity-50 mb-0.5">Detection</p>
                        <p className="font-bold text-text-primary uppercase">{event.source || 'SYS_SENSE'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-3 bg-bg-primary/50 border border-border-primary rounded flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent-primary/5 rounded-full -mr-8 -mt-8" />
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-accent-primary" />
                      <span className="text-[8px] font-mono font-black text-text-secondary uppercase tracking-widest">After_Action_Report</span>
                    </div>
                    <p className="text-[9px] text-text-primary/70 leading-relaxed italic line-clamp-3">
                      "{event.recommendedAction || 'Incident effectively neutralized. Structural integrity verified. Secure link terminated.'}"
                    </p>
                  </div>

                  <div className="text-center">
                    <span className="text-[8px] font-mono text-text-secondary opacity-30 uppercase tracking-[0.4em]">Tap_to_Return</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )) : (
            <div className="cyber-panel p-12 text-center">
              <div className="flex flex-col items-center gap-2 opacity-20">
                <History className="w-12 h-12 text-text-secondary" />
                <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">No historical data found</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
