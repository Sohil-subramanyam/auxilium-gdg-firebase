export type EventType = 'FIRE' | 'GAS' | 'PANIC' | 'MEDICAL';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventStatus = 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED';
export type UserRole = 'Admin' | 'Staff' | 'Guest';

export interface EventAction {
  id: string;
  timestamp: string;
  description: string;
  type: 'DETECTION' | 'DECISION' | 'ACTION' | 'BROADCAST' | 'RESPONSE' | 'RESOLUTION';
}

export interface EmergencyEvent {
  id: string;
  type: EventType;
  location: string;
  severity: Severity;
  timestamp: string;
  status: EventStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTeam: string;
  recommendedAction: string;
  actions: EventAction[];
  isSimulated?: boolean;
  source?: 'AUTO' | 'MANUAL' | 'SYSTEM';
  requesterId?: string;
}

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export interface OccupancyPoint {
  id: string;
  role: UserRole;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  isAssisting?: boolean;
  helpNeeded?: boolean;
}

export interface RoomOccupancy {
  roomId: string;
  people: OccupancyPoint[];
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: string;
  role: string;
  text: string;
  recipient?: UserRole | 'All';
}

export interface SystemStatus {
  networkFailure: boolean;
  activeEventsCount: number;
  uptime: string;
  occupancy: RoomOccupancy[];
  error?: string;
}
