# Gene Pool Royale - Multiplayer Sperm Racing Game

## Overview

Gene Pool Royale is a humorous multiplayer racing game where players control sperm characters swimming upward to reach an egg. The game features real-time multiplayer support via Socket.IO, power-ups, obstacles, voice controls, and text-to-speech commentary. Built with React, TypeScript, and Express, it offers both single-player and multiplayer modes with a cartoonish, meme-style visual aesthetic.

## Recent Changes

**November 10, 2025 - Sperm-to-Sperm Collision System**
- Implemented comprehensive collision detection system where racers collide with each other during the race
- Added physics-based bounce mechanics with velocity-dependent impulse and 0.5 restitution coefficient
- Power-up stealing: faster racer can steal active power-up from slower racer on collision
- High-speed collision dizzy mechanic: collisions above 5 units/s apply 1-second dizzy effect to slower racer
- Visual effects: white spark ring, gold particle bursts, and dizzy stars (💫) bobbing above affected racers
- Audio feedback: collision hit sound plays via existing audio system
- Camera shake intensity scales with collision speed for enhanced impact feel
- Collision commentary: random phrases like "Direct hit!" and "Ouch! That's gotta hurt!" via voice system
- Top-left notifications: shows power-up steal messages like "⚡ Turbo stole Speedy's Viagra Boost!"
- 500ms collision cooldown prevents rapid repeated collisions between same racers
- Full support for both single-player (AI collisions) and multiplayer modes
- Collision notifications auto-fade after 2 seconds with proper timer management

**November 9, 2025 - Sperm Visual & Camera Improvements**
- Fixed sperm orientation: tails now trail downward behind characters as they swim upward
- Redesigned head shape: changed from simple ellipse to realistic teardrop/tadpole shape with pointed front
- Enhanced tail rendering: implemented flowing, tapering tail with smooth wave motion using 20 segments
- Added visual depth: gradients, multi-layer glow effects, and improved proportions
- Improved multiplayer nickname rendering: added stroke outline for better visibility
- Fixed camera positioning: player now appears at 45% down screen (instead of centered) with full sperm body visible
- Implemented mutable local camera variable for same-frame rendering without delays
- Camera initialization works across all game phases (ready, racing, finished)
- Allows negative camera values (-50% canvas height) for proper initial positioning
- Performance: Optimized rendering remains performant with per-segment gradients and per-frame camera updates

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server for fast development and optimized production builds
- Canvas-based rendering for the main game visualization (GameCanvas component)
- Zustand for state management with multiple stores handling different concerns (race state, multiplayer state, audio state, game state)

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations
- Tailwind CSS for utility-first styling with custom theme configuration
- shadcn/ui design system for consistent, reusable UI components
- CSS custom properties for theming (defined via Tailwind's theme extension)

**Game State Management**
- **useRace store**: Manages single-player race logic including racers, power-ups, obstacles, camera position, and race phase transitions
- **useMultiplayer store**: Handles multiplayer-specific state including room management, player synchronization, and network state
- **useGame store**: Controls overall game phase (ready/playing/ended)
- **useAudio store**: Manages sound effects and background music with mute controls

**Rendering Strategy**
- Canvas 2D API for real-time game rendering with manual drawing of sperm characters, power-ups, and obstacles
- React components for UI overlays (leaderboard, start screen, finish screen, lobby)
- Smooth camera follow system tracking the local player's position
- Animation using requestAnimationFrame pattern within canvas updates

### Backend Architecture

**Server Framework**
- Express.js for HTTP routing and middleware
- Node.js HTTP server wrapped with Socket.IO for WebSocket support
- Development mode uses Vite middleware for HMR; production serves static files

**Multiplayer System**
- Socket.IO for real-time bidirectional communication
- Room-based architecture where players join via 6-character room codes
- Host-controlled game start mechanism
- Server authoritative for game state synchronization including power-ups, obstacles, and player positions
- Event-driven architecture with socket events for:
  - Room creation and joining
  - Player position updates
  - Game start synchronization
  - Player finish notifications
  - Rankings updates

**Data Storage**
- In-memory storage implementation (MemStorage class)
- User schema defined with Drizzle ORM but currently using memory-based storage
- Prepared for PostgreSQL database integration (schema and configuration present)

**Game Room Management**
- Each room maintains:
  - List of connected players with their state (position, velocity, power-ups, etc.)
  - Power-ups and obstacles synchronized across all clients
  - Game started/finished flags
  - Host designation for game control
  - Real-time rankings based on player progress

### External Dependencies

**Database**
- Neon Database (Serverless PostgreSQL) configured via `@neondatabase/serverless`
- Drizzle ORM for type-safe database operations and migrations
- Schema defined in `shared/schema.ts` with users table
- Currently using in-memory storage but infrastructure ready for database migration

**Real-time Communication**
- Socket.IO (v3.x) for WebSocket-based multiplayer synchronization
- Automatic reconnection and transport fallback (WebSocket → polling)
- Event-based messaging between server and clients

**UI Libraries**
- Radix UI component primitives (accordions, dialogs, tooltips, etc.)
- React Confetti for celebration animations on race completion
- Lucide React for icon system

**Browser APIs**
- Web Speech API for text-to-speech commentary system (announces race events with funny phrases)
- SpeechRecognition API for voice-controlled boost feature
- Canvas 2D API for game rendering

**Development Tools**
- TypeScript for type safety across client, server, and shared code
- ESBuild for server-side bundling in production
- tsx for TypeScript execution in development
- Tailwind CSS with PostCSS for styling

**Styling & Theming**
- Tailwind CSS with custom configuration
- CSS Variables for dynamic theming (HSL color system)
- Custom font: Fredoka One (Google Fonts) for playful typography
- Class Variance Authority for component variant management

**Production Considerations**
- Static asset serving in production via Express
- Separate client and server build processes
- Bundle optimization with tree-shaking and code splitting via Vite
- WebSocket graceful degradation with polling fallback