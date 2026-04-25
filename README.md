# Auxilium – Real-Time Crisis Orchestration Platform

Auxilium is a software-only simulation of a real-time crisis orchestration platform. It demonstrates how emergencies can be detected, processed, coordinated, and resolved in a centralized dashboard.

## Project Overview

The system solves the problem of delayed and fragmented emergency response by simulating:
- Emergency detection
- Real-time event streaming
- Automated decision-making
- Coordination between different stakeholders
- Guided evacuation and response tracking

**Note:** This is a software simulation and is not connected to real sensors. Emergency events are triggered manually or automatically via the simulation engine.

## Features

- **Real-Time Dashboard:** Futuristic control-room aesthetic with live updates via Socket.io.
- **Decision Engine:** Automated severity classification, team assignment, and evacuation routing.
- **Role-Based Access:** Distinct views for Admin (Control), Staff (Response), and Guest (Safety).
- **Interactive Building Map:** Real-time visualization of threat locations and safe evacuation paths.
- **Simulation Control:** Manual trigger for Fire, Gas Leak, Panic, and Medical emergencies.
- **Network Failure Simulation:** Demonstrates system resilience during communication outages.
- **Predictive AI:** Mock AI analysis for preemptive threat detection.
- **Reports & Analytics:** Visualized metrics of incident distribution and response success rates.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion, Recharts, Socket.io Client
- **Backend:** Node.js, Express.js, Socket.io

## Folder Structure

```
auxilium/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page-level components (Dashboard, History, etc.)
│   ├── lib/           # Utility functions
│   ├── types.ts       # TypeScript definitions
│   └── App.tsx        # Main application logic & routing
├── server.ts          # Express server & Socket.io logic
└── README.md
```

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs both backend and frontend):
   ```bash
   npm run dev
   ```

## Future Improvements

- Integration with real IoT sensors for live data.
- Advanced AI models for more accurate threat prediction.
- Mobile application for field responders.
- Multi-building orchestration support.
"# auxilium-gdg-firebase" 
# auxilium-gdg-firebase
# auxilium-gdg-firebase
