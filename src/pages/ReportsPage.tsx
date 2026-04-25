import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Download, Lock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserRole, EmergencyEvent } from '../types';

interface ReportsPageProps {
  role: UserRole;
}

const incidentData = [
  { name: 'Fire', count: 12, color: '#ff003c' },
  { name: 'Gas Leak', count: 8, color: '#ffb800' },
  { name: 'Panic', count: 15, color: '#00f2ff' },
  { name: 'Medical', count: 20, color: '#10b981' },
];

const responseTimeData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 32 },
  { time: '08:00', value: 58 },
  { time: '12:00', value: 42 },
  { time: '16:00', value: 35 },
  { time: '20:00', value: 28 },
];

const successRateData = [
  { name: 'Resolved', value: 85 },
  { name: 'In Progress', value: 10 },
  { name: 'Failed', value: 5 },
];

const COLORS = ['#10b981', '#00f2ff', '#ff003c'];

export default function ReportsPage({ role }: ReportsPageProps) {
  const isGuest = role === 'Guest';
  const [fullHistory, setFullHistory] = useState<EmergencyEvent[]>([]);

  useEffect(() => {
    if (!isGuest) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => setFullHistory(data));
    }
  }, [isGuest]);

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Detailed Incidents Data
    const wsIncidents = XLSX.utils.json_to_sheet(incidentData);
    XLSX.utils.book_append_sheet(wb, wsIncidents, "Incident Distribution");
    
    // Response Time Statistics
    const wsResponse = XLSX.utils.json_to_sheet(responseTimeData);
    XLSX.utils.book_append_sheet(wb, wsResponse, "Response Times");
    
    // Success Rate Metrics
    const wsSuccess = XLSX.utils.json_to_sheet(successRateData);
    XLSX.utils.book_append_sheet(wb, wsSuccess, "Success Rates");

    // Comprehensive Logs from real history
    const logData = fullHistory.map(event => ({
      ID: event.id,
      Timestamp: new Date(event.timestamp).toLocaleString(),
      Type: event.type,
      Location: event.location,
      Severity: event.severity,
      Status: event.status,
      Assigned_Team: event.assignedTeam,
      Resolution_Action: event.recommendedAction
    }));
    
    const wsLogs = XLSX.utils.json_to_sheet(logData);
    XLSX.utils.book_append_sheet(wb, wsLogs, "Incident History Logs");
    
    // Summary Sheet for Charts
    const summaryData = [
      ["Metric", "Value", "Unit"],
      ["Total Incidents", fullHistory.length, "Count"],
      ["Resolution Rate", "85%", "Percentage"],
      ["Avg Response Time", "38", "Seconds"],
      ["", "", ""],
      ["Incident Breakdown", "Count", ""],
      ...incidentData.map(d => [d.name, d.count, ""]),
      ["", "", ""],
      ["Success Metrics", "Value", ""],
      ...successRateData.map(d => [d.name, d.value, ""])
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Analytical Summary");

    XLSX.writeFile(wb, "Auxilium_Comprehensive_Safety_Report.xlsx");
  };

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center border border-border-primary shadow-xl">
          <Lock className="w-10 h-10 text-accent-secondary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-text-primary uppercase italic tracking-tighter">
            ACCESS_RESTRICTED<span className="text-accent-secondary">.DENIED</span>
          </h1>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest max-w-md">
            Detailed analytical reports are reserved for authorized personnel only. 
            Please contact administration for access privileges.
          </p>
        </div>
        <div className="h-[1px] w-32 bg-border-primary opacity-30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase italic tracking-tighter">
            SYSTEM_REPORTS<span className="text-accent-primary">.ANALYSIS</span>
          </h1>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-1">
            Data visualization of crisis response metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-bg-secondary border border-border-primary px-4 py-2 text-xs font-mono text-text-secondary hover:text-accent-primary transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT_EXCEL</span>
          </button>
          <div className="flex items-center gap-2 bg-accent-primary/5 border border-accent-primary/20 px-4 py-2">
            <Activity className="w-4 h-4 text-accent-primary" />
            <span className="text-xs font-mono text-accent-primary uppercase font-bold">Live_Metrics_Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Incident Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-7 cyber-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-stealth-border pb-4">
            <BarChart3 className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Incident_Distribution_By_Type</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} stroke={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-5 cyber-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-stealth-border pb-4">
            <PieChartIcon className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Resolution_Success_Rate</h2>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {successRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', fontSize: '10px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">85%</span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Success</span>
            </div>
          </div>
        </motion.div>

        {/* Response Time Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 cyber-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-stealth-border pb-4">
            <TrendingUp className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Average_Response_Time_Trend (Seconds)</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00f2ff" 
                  strokeWidth={2} 
                  dot={{ fill: '#00f2ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
