import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import TimelinePage from './pages/TimelinePage';
import SimulationPage from './pages/SimulationPage';
import IncidentsPage from './pages/IncidentsPage';
import RescueIncidentPage from './pages/RescueIncidentPage';
import TacticalMapPage from './pages/TacticalMapPage';
import RoleSelector from './components/RoleSelector';
import LoginPage from './pages/LoginPage';
import ScannerPage from './pages/ScannerPage';
import { EmergencyEvent, UserRole, SystemStatus, ChatMessage, RoomOccupancy } from './types';
import { trackVisit, getVisitorCount } from './lib/firebase';

const SOCKET_URL = window.location.origin;

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [notifications, setNotifications] = useState<EmergencyEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [role, setRole] = useState<UserRole>('Guest');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'white' | 'purple'>('dark');
  const [occupancy, setOccupancy] = useState<RoomOccupancy[]>([]);
  const [status, setStatus] = useState<SystemStatus>({ networkFailure: false, activeEventsCount: 0, uptime: '00:00:00' });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Track visit to Firebase on initial load
    trackVisit();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'Guest') {
      setRole('Guest');
      setIsAuthenticated(false);
    } else {
      setPendingRole(newRole);
    }
  };

  const handleLogin = (newRole: UserRole, username: string) => {
    setRole(newRole);
    setCurrentUser(username);
    setIsAuthenticated(true);
    setPendingRole(null);
  };

  useEffect(() => {
    // Initial data fetch
    fetch('/api/occupancy')
      .then(res => res.json())
      .then(data => setOccupancy(data))
      .catch(err => console.error("Occupancy fetch failed:", err));

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('event_history', (history: EmergencyEvent[]) => {
      setEvents(history);
    });

    newSocket.on('message_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('system_status', (newStatus: Partial<SystemStatus>) => {
      setStatus(prev => ({ ...prev, ...newStatus }));
      if (newStatus.occupancy) {
        setOccupancy(newStatus.occupancy);
      }
      if (newStatus.error) {
        const errorEvent: EmergencyEvent = {
          id: 'error-' + Math.random().toString(36).substring(2, 9),
          type: 'PANIC',
          location: 'SECURITY_RESTRICTION',
          severity: 'CRITICAL',
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          priority: 'CRITICAL',
          assignedTeam: 'SYSTEM_ADMIN',
          recommendedAction: newStatus.error,
          actions: []
        };
        setNotifications(prev => [errorEvent, ...prev]);
      }
    });

    newSocket.on('emergency_event', (event: EmergencyEvent) => {
      setEvents(prev => {
        const exists = prev.find(e => e.id === event.id);
        if (exists) return prev.map(e => e.id === event.id ? event : e);
        return [event, ...prev];
      });
      
      // Filter notifications based on role
      if (role === 'Admin' || role === 'Staff' || (role === 'Guest' && (event.priority === 'CRITICAL' || event.priority === 'HIGH'))) {
        setNotifications(prev => [event, ...prev]);
      }
    });

    newSocket.on('event_updated', (updatedEvent: EmergencyEvent) => {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    });

    newSocket.on('event_resolved', (data: { id: string, event: EmergencyEvent }) => {
      setEvents(prev => prev.map(e => e.id === data.id ? data.event : e));
    });

    newSocket.on('occupancy_update', (data: any[]) => {
      setOccupancy(data);
    });

    return () => {
      newSocket.close();
    };
  }, [role]);

  const handleTrigger = async (type: string, location?: string) => {
    try {
      await fetch(`/api/trigger/${type.toLowerCase()}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }) 
      });
    } catch (error) {
      console.error('Trigger failed:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/resolve/${id}`, { method: 'POST' });
    } catch (error) {
      console.error('Resolve failed:', error);
    }
  };

  const handleSendMessage = (text: string, recipient: UserRole | 'All' = 'All') => {
    if (socket) {
      socket.emit('send_message', {
        sender: role === 'Guest' ? 'Resident' : (currentUser || (role === 'Admin' ? 'HQ' : 'Unit_7')),
        role,
        text,
        recipient
      });
    }
  };

  const handleStaffAction = (eventId: string, actionType: 'ARRIVAL' | 'BACKUP') => {
    if (socket) {
      socket.emit('staff_action', {
        eventId,
        actionType,
        staffName: currentUser || 'Unit_7'
      });
    }
  };

  const toggleFailure = async () => {
    try {
      await fetch('/api/system/failure', { method: 'POST' });
    } catch (error) {
      console.error('Toggle failure failed:', error);
    }
  };

  const handlePreempt = async () => {
    try {
      // Simulate a predictive action by resolving any pending simulation or adding protective measures
      await fetch('/api/preempt', { method: 'POST' });
    } catch (error) {
      console.error('Preempt failed:', error);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSelectRoom = (room: string) => {
    const event = events.find(e => e.location.includes(room) && e.status !== 'RESOLVED');
    if (event) {
      setSelectedEventId(event.id);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary selection:text-bg-primary transition-colors duration-500">
      {status.networkFailure && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 w-full bg-accent-secondary text-white py-1 text-center text-[10px] font-mono font-bold uppercase tracking-[0.5em] z-[300] shadow-lg"
        >
          CRITICAL_SYSTEM_FAILURE: PRIMARY_COMMUNICATION_OFFLINE // BACKUP_MODE_ACTIVE
        </motion.div>
      )}

      {pendingRole && (
        <LoginPage 
          onLogin={handleLogin} 
          onCancel={() => setPendingRole(null)} 
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/incident/:id" element={<RescueIncidentPage />} />
          <Route element={
            <Layout 
              role={role} 
              setRole={handleRoleChange}
              theme={theme}
              setTheme={setTheme}
              notifications={notifications} 
              onRemoveNotification={removeNotification}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          }>
            <Route path="/" element={
              <DashboardPage 
                role={role}
                events={events}
                messages={messages}
                occupancy={occupancy}
                onSendMessage={handleSendMessage}
                onStaffAction={handleStaffAction}
                onResolve={role === 'Guest' ? () => {} : handleResolve}
                onSelectEvent={setSelectedEventId}
                selectedEventId={selectedEventId}
                onSelectRoom={handleSelectRoom}
                onPreempt={handlePreempt}
                currentUser={currentUser}
              />
            } />
            <Route path="/guest" element={
              <DashboardPage 
                role="Guest"
                events={events}
                messages={messages}
                occupancy={occupancy}
                onSendMessage={handleSendMessage}
                onStaffAction={handleStaffAction}
                onResolve={() => {}}
                onSelectEvent={setSelectedEventId}
                selectedEventId={selectedEventId}
                onSelectRoom={handleSelectRoom}
                onPreempt={handlePreempt}
                currentUser={currentUser}
              />
            } />
            <Route path="/map" element={<TacticalMapPage />} />
            <Route path="/scan" element={<ScannerPage />} />
            {role !== 'Guest' && (
              <>
                <Route path="/incidents" element={
                  <IncidentsPage 
                    role={role}
                    events={events}
                    onResolve={handleResolve}
                    onSelectEvent={setSelectedEventId}
                    selectedEventId={selectedEventId}
                  />
                } />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/reports" element={<ReportsPage role={role} />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/simulation" element={
                  <SimulationPage 
                    onTrigger={handleTrigger} 
                    onToggleFailure={toggleFailure} 
                    networkFailure={status.networkFailure} 
                  />
                } />
              </>
            )}
            {/* Redirect Guests trying to access restricted pages */}
            {role === 'Guest' && (
              <Route path="*" element={<DashboardPage 
                role={role}
                events={events}
                messages={messages}
                occupancy={occupancy}
                onSendMessage={handleSendMessage}
                onStaffAction={handleStaffAction}
                onResolve={() => {}}
                onSelectEvent={setSelectedEventId}
                selectedEventId={selectedEventId}
                onSelectRoom={handleSelectRoom}
                currentUser={currentUser}
              />} />
            )}
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
