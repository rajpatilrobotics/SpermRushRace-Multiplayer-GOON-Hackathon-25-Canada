# Gene Pool Royale - Project Documentation

## Overview
Gene Pool Royale is a hilarious multiplayer racing game where players control sperm characters swimming to reach the egg. Built with React, TypeScript, Socket.IO for real-time multiplayer, and Canvas 2D API for rendering.

**Current Status:** Fully functional and running on port 5000

## Recent Changes
- **December 1, 2025**: Initial setup completed
  - Installed Node.js 20 and all npm dependencies
  - Configured development workflow on port 5000
  - Verified application is running correctly with webview

## Project Architecture

### Frontend (React + TypeScript)
- **Location:** `client/src/`
- **Key Components:**
  - `GameCanvas.tsx` - Main game rendering with Canvas 2D API
  - `StartScreen.tsx` - Initial game mode selection
  - `LobbyScreen.tsx` - Multiplayer lobby with room codes
  - `FinishScreen.tsx` - Race results with confetti
  - `GameUI.tsx` - HUD, leaderboard, and race UI
  - UI Components in `components/ui/` using Radix UI primitives

### Backend (Express + Socket.IO)
- **Location:** `server/`
- **Files:**
  - `index.ts` - Main server entry, configured for port 5000 on 0.0.0.0
  - `socket.ts` - Real-time multiplayer logic with Socket.IO
  - `vite.ts` - Dev server setup with HMR and allowedHosts: true
  - `routes.ts` - HTTP API routes

### State Management
- **Zustand stores** in `client/src/lib/stores/`:
  - `useRace.tsx` - Race logic, physics, collisions
  - `useMultiplayer.tsx` - Room management, player sync
  - `useAudio.tsx` - Background music and sound effects
  - `useGame.tsx` - Game phase state machine

### Shared Code
- `shared/schema.ts` - Database schema (Drizzle ORM)

## Development Setup

### Running the Application
```bash
npm run dev
```
The app runs on **http://localhost:5000** (already configured)

### Other Commands
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## Key Features
1. **Single Player** - Race against 5 AI opponents
2. **Multiplayer** - Up to 6 players in real-time with Socket.IO
3. **Power-Ups** - Lube Boost (1.5x speed) and Viagra (2.0x speed)
4. **Obstacles** - Condoms, pills, STDs, antibodies
5. **Voice Controls** - Voice recognition for speed boost
6. **Physics** - Smooth swimming mechanics with 20-segment animated tails
7. **Audio** - Background music and sound effects
8. **Visual Effects** - Particles, screen shake, confetti

## Technical Stack
- **React 18** with TypeScript
- **Vite** for build tooling (configured with allowedHosts: true)
- **Express** server on port 5000, host 0.0.0.0
- **Socket.IO** for real-time multiplayer
- **Canvas 2D API** for 60 FPS game rendering
- **Zustand** for state management
- **Tailwind CSS** + Radix UI for styling
- **Drizzle ORM** + Neon PostgreSQL (ready but not required)

## Important Configuration
- **Port:** Always 5000 (configured in `server/index.ts`)
- **Host:** 0.0.0.0 (allows Replit proxy access)
- **Vite Dev Server:** allowedHosts set to true in `server/vite.ts`
- **HMR:** Configured with server instance for hot reload

## User Preferences
None specified yet.

## Notes
- The game works completely without database (uses in-memory storage)
- Database integration is optional for persistent leaderboards
- Multiplayer uses Socket.IO rooms with 6-character codes
- Voice control requires microphone permissions
