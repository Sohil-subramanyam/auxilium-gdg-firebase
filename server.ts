import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // System state
  let eventHistory: any[] = [];
  let resolvedHistory: any[] = [];
  let timelineLogs: any[] = [
    { id: "log1", timestamp: new Date(Date.now() - 5000).toLocaleTimeString(), message: "System initialized. All nodes operational." },
    { id: "log2", timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), message: "Security protocol v5.0.1 loaded." },
    { id: "log3", timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), message: "Network link established with Central Command." }
  ];
  let messages: any[] = [];
  let networkFailure = false;
  const MAX_HISTORY = 100;

  // Initial History for Demo
  const initialHistory = [
    {
      id: "h1a2b3c",
      type: "FIRE",
      location: "A101 - Kitchen",
      severity: "HIGH",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "RESOLVED",
      priority: "HIGH",
      assignedTeam: "Fire Response Team",
      recommendedAction: "Evacuate using nearest Stairwell immediately",
      isSimulated: true,
      source: "MANUAL",
      actions: [
        { id: "a1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), type: "DETECTION", description: "Smoke detected in Kitchen" },
        { id: "a2", timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(), type: "RESOLUTION", description: "Fire extinguished. Ventilation active." }
      ]
    },
    {
      id: "m4n5o6p",
      type: "MEDICAL",
      location: "PENTHOUSE - Lounge",
      severity: "MEDIUM",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: "RESOLVED",
      priority: "MEDIUM",
      assignedTeam: "Medical Team",
      recommendedAction: "Send nearest paramedic unit to apartment",
      isSimulated: true,
      source: "AUTO",
      actions: [
        { id: "a3", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), type: "DETECTION", description: "Medical alert triggered" },
        { id: "a4", timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(), type: "RESOLUTION", description: "Patient stabilized and transported." }
      ]
    }
  ];
  resolvedHistory.push(...initialHistory);
  eventHistory.push(...initialHistory);

  const apartments = [
    { id: "A101", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "A102", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "A103", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "A104", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "B201", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "B202", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "B203", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "B204", rooms: ["Living", "Bedroom", "Kitchen", "Bath", "Balcony"] },
    { id: "PENTHOUSE", rooms: ["Suite", "Lounge", "Terrace", "Kitchen", "Dining", "Office"] }
  ];

  const locations = apartments.flatMap(apt => apt.rooms.map(room => `${apt.id} - ${room}`));
  locations.push("Main Lobby", "Service Hallway", "Stairwell A", "Stairwell B", "Elevator Bank");

  // Occupancy Simulation
  let occupancy: any[] = [];
  const EXITS = {
    'F1': { x: 95, y: 50, label: 'MAIN_EXIT' },
    'F2': { x: 95, y: 50, label: 'STAIRS_DOWN' },
    'PH': { x: 95, y: 50, label: 'STAIRS_DOWN' }
  };

  function generateInitialOccupancy() {
    const roles: ("Admin" | "Staff" | "Guest")[] = ["Admin", "Staff", "Guest"];
    const allRooms = apartments.flatMap(apt => apt.rooms.map(r => `${apt.id}-${r}`));
    allRooms.push("Lobby", "Hallway", "StairsA", "StairsB", "Elevators");

    occupancy = allRooms.map(roomId => ({
      roomId,
      people: Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map(() => ({
        id: Math.random().toString(36).substring(2, 9),
        role: Math.random() > 0.1 ? 'Guest' : (Math.random() > 0.5 ? 'Staff' : 'Admin'),
        x: Math.random() * 70 + 15,
        y: Math.random() * 70 + 15,
        isAssisting: false
      }))
    }));
  }

  generateInitialOccupancy();

  function updateOccupancy() {
    const activeIncidents = eventHistory.filter(e => e.status !== 'RESOLVED');
    const hasEmergency = activeIncidents.some(e => e.severity === 'CRITICAL' || e.severity === 'HIGH');
    
    // Calculate total Guests still in the building
    const guestsInBuilding: any[] = [];
    occupancy.forEach(room => {
      room.people.forEach((p: any) => {
        if (p.role === 'Guest') {
          guestsInBuilding.push({ ...p, roomId: room.roomId });
        }
      });
    });
    
    const totalGuestsRemaining = guestsInBuilding.length;
    const totalStaffRemaining = occupancy.reduce((acc, room) => 
      acc + room.people.filter((p: any) => p.role === 'Staff').length, 0);
    
    // Debug logging
    if (hasEmergency && totalGuestsRemaining === 0) {
      if (totalStaffRemaining > 0) {
        console.log(`GUESTS EVACUATED - ${totalStaffRemaining} Staff remaining to clear building`);
      } else {
        console.log("ALL GUESTS AND STAFF EVACUATED - Admins should now evacuate");
      }
    }

    // Track people who need to transition between rooms
    const transitions: { from: string, to: string, personId: string }[] = [];

    const EMERGENCY_EXITS = {
      'F1': { x: 5, y: 50 },
      'F2': { x: 5, y: 50 },
      'PH': { x: 5, y: 50 }
    };

    const NORMAL_EXIT = { x: 95, y: 50 };

    // First, process each room and move people within the room
    occupancy.forEach(room => {
      let floorId = 'F1';
      if (room.roomId.startsWith('B')) floorId = 'F2';
      else if (room.roomId.startsWith('PH') || room.roomId.startsWith('PENTHOUSE')) floorId = 'PH';
      
      const exitPoint = hasEmergency ? EMERGENCY_EXITS[floorId as keyof typeof EMERGENCY_EXITS] : NORMAL_EXIT;

      const isRoomDangerous = activeIncidents.some(e => 
        e.location.includes(room.roomId) && (e.type === 'FIRE' || e.type === 'GAS')
      );

      // Determine room type
      const isApartment = room.roomId.includes('-');
      const isHallway = room.roomId === 'Hallway';
      const isLobby = room.roomId === 'Lobby';
      const isStairs = room.roomId.includes('Stairs');
      const isElevator = room.roomId.includes('Elevator');

      // CROWD DENSITY HEATMAP LOGIC
      const crowdDensity = room.people.length;
      const isCongested = isLobby && crowdDensity > 15;
      
      if (isCongested && hasEmergency) {
        if (!room.bottleneckWarningSent) {
          addMessage("SYSTEM", "AI_TRAFFIC", `BOTTLENECK DETECTED: Lobby is congested (${crowdDensity} ppl). Rerouting to STAIRS_B.`, "All");
          room.bottleneckWarningSent = true;
        }
      } else {
        room.bottleneckWarningSent = false;
      }

      // Process each person in the room
      for (let i = room.people.length - 1; i >= 0; i--) {
        const p = room.people[i];
        
        // Determine if this person should evacuate
        let shouldEvacuate = false;
        
        if (hasEmergency) {
          if (p.role === 'Guest') {
            shouldEvacuate = true;
          } else if (p.role === 'Staff') {
            shouldEvacuate = (totalGuestsRemaining === 0);
          } else if (p.role === 'Admin') {
            // Admin is absolute last
            shouldEvacuate = (totalGuestsRemaining === 0 && totalStaffRemaining === 0);
          }
        }
        
        if (shouldEvacuate) {
          // EVACUATION MODE
          const dx = exitPoint.x - p.x;
          const dy = exitPoint.y - p.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const normalizedDx = length > 0 ? dx / length : 0;
          const normalizedDy = length > 0 ? dy / length : 0;
          
          let speed = 1.5;
          if (p.role === 'Guest' && isRoomDangerous) {
            speed = 2.5;
          } else if (p.role === 'Staff' || p.role === 'Admin') {
            speed = 2.0;
          }
          
          p.x += normalizedDx * speed;
          p.y += normalizedDy * speed;
          
          // Check for room transitions
          if (isApartment) {
            if (p.x < 25) {
              transitions.push({ from: room.roomId, to: 'Hallway', personId: p.id });
              continue;
            }
          } else if (isHallway) {
            if (p.x < 22) { // Increased from 15 to be within 15-85 clamp
              transitions.push({ from: room.roomId, to: 'Lobby', personId: p.id });
              continue;
            }
          } else if (isLobby) {
            if (p.x < 20) { // Increased from 10 to be within 15-85 clamp
              transitions.push({ from: room.roomId, to: 'StairsA', personId: p.id });
              continue;
            }
          } else if (isStairs || isElevator) {
            const distToExit = Math.sqrt(Math.pow(p.x - exitPoint.x, 2) + Math.pow(p.y - exitPoint.y, 2));
            if (distToExit < 18 || p.x < 18) { // Increased from 8 to be within 15-85 clamp
              addTimelineLog(`${p.role} ${p.id.substring(0,4)} successfully evacuated from ${room.roomId}`);
              room.people.splice(i, 1);
              continue;
            }
          }
          
          p.isAssisting = false;
        } else if (hasEmergency) {
          // EMERGENCY ACTIVE BUT NOT EVACUATING (STAFF/ADMIN PROTOCOLS)
          
          if (p.role === 'Staff') {
            // PROTOCOL: Search and Chase Guests
            let targetGuest = null;
            let minDist = Infinity;

            // Look for nearest guest in current room first
            room.people.forEach((other: any) => {
              if (other.role === 'Guest') {
                // PRIORITIZE PEOPLE WHO CLICKED "NO" (Help Needed)
                let weight = 1.0;
                if (other.helpNeeded) weight = 5.0; // Higher weight for people needing help

                const d = Math.sqrt(Math.pow(other.x - p.x, 2) + Math.pow(other.y - p.y, 2)) / weight;
                if (d < minDist) {
                  minDist = d;
                  targetGuest = other;
                }
              }
            });

            if (targetGuest) {
              // Move toward guest in room
              const dx = targetGuest.x - p.x;
              const dy = targetGuest.y - p.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              p.x += (length > 0 ? dx / length : 0) * 1.8;
              p.y += (length > 0 ? dy / length : 0) * 1.8;
              p.isAssisting = true;
            } else {
              // No guest in room, move toward exit path to find them elsewhere
              const dx = exitPoint.x - p.x;
              const dy = exitPoint.y - p.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              p.x += (length > 0 ? dx / length : 0) * 1.2;
              p.y += (length > 0 ? dy / length : 0) * 1.2;
              
              // Transition toward guests (usually hallway -> apartment)
              if (isHallway && Math.random() > 0.9) {
                const nearbyRoom = occupancy.find(r => r.roomId.includes(floorId) && r.roomId.includes('-') && r.people.some(pe => pe.role === 'Guest'));
                if (nearbyRoom) {
                  transitions.push({ from: room.roomId, to: nearbyRoom.roomId, personId: p.id });
                  continue;
                }
              } else if (isApartment && !room.people.some(pe => pe.role === 'Guest')) {
                // If apartment cleared, move back to hallway to keep search
                // Staff move toward the door (left wall) to return to hallway
                if (p.x < 25) { 
                   transitions.push({ from: room.roomId, to: 'Hallway', personId: p.id });
                   continue;
                }
              }
            }
          } else if (p.role === 'Admin') {
            // PROTOCOL: Strategic Control Zones
            let targetZone = 'Lobby'; // Default
            if (floorId === 'F1') targetZone = 'Hallway';
            else if (floorId === 'F2') targetZone = 'Lobby';
            else if (floorId === 'PH') targetZone = 'Lobby';

            if (room.roomId === targetZone) {
              // Stay in zone center
              const dx = 50 - p.x;
              const dy = 50 - p.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              p.x += (length > 0 ? dx / length : 0) * 0.5;
              p.y += (length > 0 ? dy / length : 0) * 0.5;
            } else {
              // Transition toward zone
              // Simple path toward zone
              if (isApartment) {
                if (p.x < 25) { transitions.push({ from: room.roomId, to: 'Hallway', personId: p.id }); continue; }
                p.x -= 1.0; 
              } else if (isHallway && targetZone === 'Lobby') {
                if (p.x < 15) { transitions.push({ from: room.roomId, to: 'Lobby', personId: p.id }); continue; }
                p.x -= 1.0;
              } else if (isLobby && targetZone === 'Hallway') {
                if (p.x > 85) { transitions.push({ from: room.roomId, to: 'Hallway', personId: p.id }); continue; }
                p.x += 1.0;
              }
            }
            p.isAssisting = true;
          }
        } else {
          // Normal mode - wander randomly
          p.x += (Math.random() - 0.5) * 1.5;
          p.y += (Math.random() - 0.5) * 1.5;
          
          // Repopulation drift (move slowly back into building)
          if (!hasEmergency) {
            // Stronger drift for repopulation to overcome random wander
            if (isLobby || isHallway || isStairs) {
              p.x += 0.4; 
            }

            // Transition back into building frames
            if (isLobby && p.x > 78) {
               transitions.push({ from: room.roomId, to: 'Hallway', personId: p.id });
               continue;
            } else if (isHallway && p.x > 78) {
               const floorPrefix = floorId === 'F1' ? 'A' : (floorId === 'F2' ? 'B' : 'PH');
               const floorApts = occupancy.filter(r => r.roomId.startsWith(floorPrefix) && r.roomId.includes('-'));
               if (floorApts.length > 0) {
                  const target = floorApts[Math.floor(Math.random() * floorApts.length)].roomId;
                  transitions.push({ from: room.roomId, to: target, personId: p.id });
                  continue;
               }
            } else if (isStairs && p.x > 75) {
               transitions.push({ from: room.roomId, to: 'Lobby', personId: p.id });
               continue;
            }
          }
          
          p.isAssisting = false;
        }
        
        // Keep within bounds
        p.x = Math.max(15, Math.min(85, p.x));
        p.y = Math.max(15, Math.min(85, p.y));
      }

      // Natural population churn during standby
      if (Math.random() > 0.95 && !hasEmergency) {
        if (room.people.length > 0 && Math.random() > 0.5) {
          room.people.pop();
        } else if (room.people.length < 12) {
          room.people.push({
            id: Math.random().toString(36).substring(2, 9),
            role: Math.random() > 0.1 ? 'Guest' : (Math.random() > 0.5 ? 'Staff' : 'Admin'),
            x: Math.random() * 40 + 30,
            y: Math.random() * 40 + 30,
            isAssisting: false
          });
        }
      }
    });
    
    // Process transitions
    transitions.forEach(trans => {
      const fromRoom = occupancy.find(r => r.roomId === trans.from);
      const toRoom = occupancy.find(r => r.roomId === trans.to);
      if (fromRoom && toRoom) {
        const personIndex = fromRoom.people.findIndex((p: any) => p.id === trans.personId);
        if (personIndex !== -1) {
          const [person] = fromRoom.people.splice(personIndex, 1);
          
          const isEvacuating = hasEmergency && (person.role === 'Guest' || (totalGuestsRemaining === 0 && (person.role === 'Staff' || (person.role === 'Admin' && totalStaffRemaining === 0))));
          const isIncoming = !isEvacuating; // Staff searching OR Normal repopulation
          
          if (toRoom.roomId === 'Hallway') {
            person.x = isIncoming ? 18 : 80;
            person.y = 50;
          } else if (toRoom.roomId === 'Lobby') {
            person.x = isIncoming ? 15 : 70;
            person.y = 50;
          } else if (toRoom.roomId === 'StairsA') {
            person.x = 60;
            person.y = 50;
          } else if (toRoom.roomId.includes('-')) {
            // Entering an apartment
            person.x = 80;
            person.y = 50;
          } else {
            person.x = 50;
            person.y = 50;
          }
          toRoom.people.push(person);
        }
      }
    });
    
    // Repopulation: Add people back to building slowly when clear
    if (!hasEmergency) {
      const currentCount = occupancy.reduce((acc, r) => acc + r.people.length, 0);
      const targetCount = 200; // Increased from 75 to match initial density
      if (currentCount < targetCount && Math.random() > 0.6) {
        const entryRoom = occupancy.find(r => r.roomId === 'Lobby');
        if (entryRoom) {
          console.log(`REPOPULATING: Adding new occupant to Lobby. Current building population: ${currentCount}`);
          entryRoom.people.push({
            id: Math.random().toString(36).substring(2, 9),
            role: Math.random() > 0.1 ? 'Guest' : (Math.random() > 0.5 ? 'Staff' : 'Admin'),
            x: 18, // Visible entry from the left 
            y: 45 + Math.random() * 10,
            isAssisting: false
          });
        }
      }
    }
    
    // Additional cleanup
    if (hasEmergency && totalGuestsRemaining === 0) {
      occupancy.forEach(room => {
        if (room.roomId === 'Lobby' || room.roomId.includes('Stairs') || room.roomId.includes('Elevator')) {
          room.people = room.people.filter((p: any) => {
            if (p.role === 'Staff') {
              addTimelineLog(`${p.role} ${p.id.substring(0,4)} successfully evacuated from ${room.roomId}`);
              return false;
            }
            if (p.role === 'Admin' && totalStaffRemaining === 0) {
              addTimelineLog(`${p.role} ${p.id.substring(0,4)} successfully evacuated from ${room.roomId}`);
              return false;
            }
            return true;
          });
        }
      });
    }
    
    io.emit("occupancy_update", occupancy);
  }

  setInterval(updateOccupancy, 1000);

  function emitWithSimulation(event: string, data: any) {
    const delay = networkFailure ? 3000 : 0;
    setTimeout(() => {
      io.emit(event, data);
    }, delay);
  }

  function addTimelineLog(message: string) {
    const log = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message
    };
    timelineLogs.unshift(log);
    if (timelineLogs.length > MAX_HISTORY) timelineLogs.pop();
    emitWithSimulation("timeline_update", log);
  }

  function addAction(event: any, type: string, description: string) {
    const action = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type,
      description
    };
    event.actions.push(action);
    return action;
  }

  function processDecision(event: any) {
    // Decision Engine Logic
    switch (event.type) {
      case "FIRE":
        event.severity = "CRITICAL";
        event.assignedTeam = "Fire Response Team";
        event.recommendedAction = "Evacuate using nearest Stairwell immediately";
        break;
      case "GAS":
        event.severity = "HIGH";
        event.assignedTeam = "Hazmat Team";
        event.recommendedAction = "Avoid electrical switches and move to balcony/terrace";
        break;
      case "PANIC":
        event.severity = "HIGH";
        event.assignedTeam = "Security Team";
        event.recommendedAction = "Guide residents toward safe assembly points";
        break;
      case "MEDICAL":
        event.severity = "MEDIUM";
        event.assignedTeam = "Medical Team";
        event.recommendedAction = "Send nearest paramedic unit to apartment";
        break;
      default:
        event.severity = "LOW";
        event.assignedTeam = "General Security";
        event.recommendedAction = "Monitor situation";
    }

    event.priority = event.severity;
    
    addTimelineLog(`${event.type} detected in ${event.location}`);
    addTimelineLog(`Severity classified as ${event.severity}`);
    addTimelineLog(`${event.assignedTeam} assigned`);
    addTimelineLog(`Response protocol: ${event.recommendedAction}`);

    addAction(event, 'DETECTION', `${event.type} detected at ${event.location}.`);
    addAction(event, 'DECISION', `Priority evaluated as ${event.severity}.`);
    addAction(event, 'ACTION', `Assigned: ${event.assignedTeam}. Action: ${event.recommendedAction}`);
    addAction(event, 'BROADCAST', `Alert broadcasted to relevant personnel.`);

    // Simulate response progress
    setTimeout(() => {
      if (event.status === 'ACTIVE') {
        event.status = 'IN_PROGRESS';
        addAction(event, 'RESPONSE', "Response units on site. Containment in progress.");
        emitWithSimulation("event_updated", event);
        addTimelineLog(`Response team arrived at ${event.location}`);
      }
    }, 5000);
  }

  function createEvent(type: string, location?: string, source: 'AUTO' | 'MANUAL' | 'SYSTEM' = 'SYSTEM', isSimulated: boolean = false) {
    const event = {
      id: Math.random().toString(36).substring(2, 9),
      type: type.toUpperCase(),
      location: location || locations[Math.floor(Math.random() * locations.length)],
      severity: "LOW", // Will be set by decision engine
      timestamp: new Date().toISOString(),
      status: "ACTIVE",
      priority: 'LOW',
      assignedTeam: "",
      recommendedAction: "",
      actions: [],
      source,
      isSimulated
    };
    
    processDecision(event);
    
    eventHistory.unshift(event);
    // Sort by severity: CRITICAL > HIGH > MEDIUM > LOW
    const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    eventHistory.sort((a, b) => {
      if (a.status === 'RESOLVED' && b.status !== 'RESOLVED') return 1;
      if (a.status !== 'RESOLVED' && b.status === 'RESOLVED') return -1;
      return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
    });

    if (eventHistory.length > MAX_HISTORY) {
      eventHistory.pop();
    }
    
    return event;
  }

  function addMessage(sender: string, role: string, text: string, recipient: string = 'All') {
    const msg = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      sender,
      role,
      text,
      recipient
    };
    messages.push(msg);
    if (messages.length > 50) messages.shift();
    io.emit("new_message", msg);
    return msg;
  }

  // Socket.io connection
  io.on("connection", (socket) => {
    socket.emit("event_history", eventHistory);
    socket.emit("timeline_history", timelineLogs);
    socket.emit("message_history", messages);
    socket.emit("occupancy_update", occupancy);
    socket.emit("system_status", { 
      networkFailure, 
      activeEventsCount: eventHistory.filter(e => e.status !== 'RESOLVED').length,
      occupancy 
    });

    socket.on("send_message", (data) => {
      addMessage(data.sender, data.role, data.text, data.recipient);
    });

    socket.on("self_triage", (data) => {
      const { personId, helpNeeded } = data;
      let found = false;
      occupancy.forEach(room => {
        const person = room.people.find((p: any) => p.id === personId);
        if (person) {
          person.helpNeeded = helpNeeded;
          found = true;
          if (helpNeeded) {
            addTimelineLog(`SELF-TRIAGE: Help requested by occupant ${personId.substring(0,4)} in ${room.roomId}`);
            addMessage("SYSTEM", "AI_DISPATCH", `Occupant in ${room.roomId} reports 'NOT SAFE'. Prioritizing response.`, "All");
          }
        }
      });
      if (found) {
        io.emit("occupancy_update", occupancy);
      }
    });

    socket.on("staff_action", (data) => {
      const { eventId, actionType, staffName } = data;
      const event = eventHistory.find(e => e.id === eventId);
      if (event) {
        let logMsg = "";
        let actionDesc = "";
        if (actionType === "ARRIVAL") {
          if ((event as any).requesterId === staffName) {
            socket.emit("system_status", { error: "RESTRICTION: You cannot accept your own backup request. Another unit must respond." });
            return;
          }
          event.status = "IN_PROGRESS";
          logMsg = `Staff ${staffName} confirmed arrival at ${event.location}`;
          actionDesc = `Staff ${staffName} arrived on site. Status locked to IN_PROGRESS.`;
        } else if (actionType === "BACKUP") {
          logMsg = `Staff ${staffName} requested additional backup at ${event.location}`;
          actionDesc = `Tactical backup requested by ${staffName}. Dispatching units.`;
          
          // 1. Create a NEW incident for the backup request so it shows in the assessments
          const backupEvent = createEvent('PANIC', event.location, 'SYSTEM', event.isSimulated) as any;
          backupEvent.type = 'BACKUP_REQUIRED';
          backupEvent.requesterId = staffName; // Tag the requester
          backupEvent.severity = 'CRITICAL'; // Make it critical
          backupEvent.priority = 'CRITICAL';
          backupEvent.recommendedAction = `PRIORITY: Assist unit at ${event.location}. High threat level reported.`;
          backupEvent.assignedTeam = 'Security Team'; // Ensure it matches staff filter
          
          addAction(backupEvent, 'REQUEST', `Source: ${staffName} unit at ${event.id}`);
          emitWithSimulation("emergency_event", backupEvent);

          // 2. Staff Increase Logic (Existing visual feedback)
          const room = occupancy.find(r => event.location.includes(r.roomId.split('-')[1] || r.roomId));
          if (room) {
            for (let i = 0; i < 3; i++) {
              room.people.push({
                id: `backup-${Math.random().toString(36).substring(2, 7)}`,
                role: 'Staff',
                x: 80 + (Math.random() - 0.5) * 5,
                y: 50 + (Math.random() - 0.5) * 5,
                isAssisting: true
              });
            }
          }
        }
        
        addAction(event, 'RESPONSE', actionDesc);
        addTimelineLog(logMsg);
        emitWithSimulation("event_updated", event);
      }
    });
  });

  // API Endpoints
  app.get("/api/incidents/:id", (req, res) => {
    const event = eventHistory.find(e => e.id === req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: "Incident not found" });
    }
  });

  app.get("/api/occupancy", (req, res) => {
    res.json(occupancy);
  });

  app.post("/api/trigger/:type", (req, res) => {
    const { type } = req.params;
    const { location } = req.body;
    
    const validTypes = ["fire", "gas", "panic", "medical"];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ error: "Invalid event type" });
    }

    const event = createEvent(type.toUpperCase(), location, 'MANUAL', true);
    emitWithSimulation("emergency_event", event);
    res.json(event);
  });

  app.post("/api/resolve/:id", (req, res) => {
    const { id } = req.params;
    const eventIndex = eventHistory.findIndex(e => e.id === id);
    if (eventIndex !== -1) {
      const event = eventHistory[eventIndex];
      event.status = "RESOLVED";
      addAction(event, 'RESOLUTION', "Incident resolved. System returning to standby.");
      addTimelineLog(`Threat resolved: ${event.type} at ${event.location}`);
      resolvedHistory.unshift(event);
      emitWithSimulation("event_resolved", { id, event });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  });

  app.post("/api/system/failure", (req, res) => {
    networkFailure = !networkFailure;
    if (networkFailure) {
      addTimelineLog("CRITICAL: Primary communication failure detected. Switching to backup mode.");
    } else {
      addTimelineLog("System restored. Primary communication active.");
    }
    io.emit("system_status", { networkFailure });
    res.json({ networkFailure });
  });

  // Required GET Endpoints
  app.get("/api/events", (req, res) => {
    res.json(eventHistory);
  });

  app.get("/api/timeline", (req, res) => {
    res.json(timelineLogs);
  });

  app.get("/api/status", (req, res) => {
    res.json({
      networkFailure,
      activeEventsCount: eventHistory.filter(e => e.status !== 'RESOLVED').length,
      uptime: process.uptime(),
      status: networkFailure ? "FAILURE" : (eventHistory.some(e => e.status === 'ACTIVE') ? "WARNING" : "OPERATIONAL")
    });
  });

  app.get("/api/history", (req, res) => {
    res.json(resolvedHistory);
  });

  // Automatic simulation loop
  setInterval(() => {
    if (Math.random() > 0.85 && eventHistory.filter(e => e.status !== 'RESOLVED').length < 5) {
      const types = ["FIRE", "GAS", "PANIC", "MEDICAL"];
      const type = types[Math.floor(Math.random() * types.length)];
      const event = createEvent(type, undefined, 'AUTO', true);
      emitWithSimulation("emergency_event", event);
    }
  }, 15000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Auxilium Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
