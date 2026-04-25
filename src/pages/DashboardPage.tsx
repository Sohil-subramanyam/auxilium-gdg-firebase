import React from 'react';
import StaffView from '../components/StaffView';
import GuestView from '../components/GuestView';
import DashboardOverview from '../components/DashboardOverview';
import SelfTriagePanel from '../components/SelfTriagePanel';
import { EmergencyEvent, UserRole, ChatMessage, RoomOccupancy } from '../types';

interface DashboardPageProps {
  role: UserRole;
  events: EmergencyEvent[];
  messages: ChatMessage[];
  occupancy: RoomOccupancy[];
  onSendMessage: (text: string, recipient?: UserRole | 'All') => void;
  onStaffAction: (eventId: string, actionType: 'ARRIVAL' | 'BACKUP') => void;
  onResolve: (id: string) => void;
  onSelectEvent: (id: string) => void;
  selectedEventId: string | null;
  onSelectRoom: (room: string) => void;
  onPreempt?: () => void;
  currentUser: string | null;
}

export default function DashboardPage({ 
  role, 
  events, 
  messages,
  occupancy,
  onSendMessage,
  onStaffAction,
  onResolve, 
  onSelectEvent, 
  selectedEventId, 
  onSelectRoom,
  onPreempt,
  currentUser
}: DashboardPageProps) {
  switch (role) {
    case 'Admin':
      return (
        <DashboardOverview 
          role={role}
          events={events} 
          messages={messages}
          occupancy={occupancy}
          onSendMessage={onSendMessage}
          onSelectRoom={onSelectRoom} 
          onPreempt={onPreempt}
        />
      );
    case 'Staff':
      return (
        <StaffView 
          events={events} 
          messages={messages}
          occupancy={occupancy}
          onSendMessage={onSendMessage}
          onStaffAction={onStaffAction}
          onSelectRoom={onSelectRoom} 
          currentUser={currentUser}
        />
      );
    case 'Guest':
      return (
        <>
          <GuestView 
            events={events} 
            messages={messages}
            occupancy={occupancy}
            onSendMessage={onSendMessage}
            onSelectRoom={onSelectRoom} 
          />
          <SelfTriagePanel />
        </>
      );
    default:
      return null;
  }
}
