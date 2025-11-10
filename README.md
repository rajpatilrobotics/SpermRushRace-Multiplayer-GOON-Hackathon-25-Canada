# 🏊 Gene Pool Royale

<div align="center">

**The Ultimate Race to Fertilization!**

A hilarious multiplayer racing game where you control sperm characters swimming to reach the egg. Featuring real-time multiplayer, power-ups, obstacles, voice controls, and text-to-speech commentary.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101.svg)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#features) • [Demo](#demo) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [How to Play](#how-to-play)

</div>

---

## ✨ Features

### 🎮 Game Modes
- **Single Player** - Race against 5 AI opponents
- **Multiplayer** - Compete with up to 6 real players in real-time

### 🚀 Gameplay Features
- **Real-time Multiplayer** - Socket.IO powered instant synchronization
- **Power-Ups** - Lube Boost 💧 and Viagra 💊 for speed boosts
- **Obstacles** - Avoid condoms, pills, STDs, and antibodies
- **Mystery Eggs** - Surprise collectibles with random contents
- **Sperm-to-Sperm Collisions** - Steal power-ups and cause dizzy effects
- **Voice Controls** - Say "east or west goon hack is the best" for a speed boost!
- **Live Commentary** - Text-to-speech announcements during races
- **Particle Effects** - Explosions, sparkles, and visual polish
- **Screen Shake** - Impact feedback on collisions
- **Slipstream Mechanic** - Draft behind other racers for bonus speed

### 🎨 Visual Features
- **Realistic Sperm Design** - Teardrop heads with flowing 20-segment tails
- **Smooth Animations** - 60 FPS canvas rendering
- **Dynamic Camera** - Follows your racer smoothly
- **Collision Notifications** - Real-time event messages
- **Leaderboard** - Live race standings
- **Celebration Effects** - Confetti when you win!

---

## 🎯 Demo

**Live Demo:** Deploy this project on Replit and share your live URL here!

### Game Preview

The game features:
- **Start Screen** - Choose between single player or multiplayer modes
- **Multiplayer Lobby** - Create or join rooms with 6-character codes
- **Race Screen** - Fast-paced swimming action with real-time leaderboard
- **Finish Screen** - Celebration with confetti and race results

> **Tip:** Take screenshots of your deployed game by pressing `F12` in your browser, then `Ctrl+Shift+P` and searching for "Screenshot"

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication
- **Canvas 2D API** - High-performance game rendering
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations

### Backend
- **Node.js 20** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional events
- **TypeScript** - Type-safe server code

### Database & ORM
- **Drizzle ORM** - Type-safe database toolkit
- **Neon PostgreSQL** - Serverless database (ready to use)

### Development Tools
- **tsx** - TypeScript execution
- **ESBuild** - Fast bundler
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gene-pool-royale.git
cd gene-pool-royale
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
```
http://localhost:5000
```

That's it! The game should now be running locally. 🎉

---

## 🎮 How to Play

### Controls

| Key | Action |
|-----|--------|
| **W / ↑** | Swim Up |
| **S / ↓** | Swim Down |
| **A / ←** | Move Left |
| **D / →** | Move Right |
| **Shift** | Drop Condom (if available) |
| **Voice** | Say "east or west goon hack is the best" for boost |

### Single Player Mode

1. Click **"🎮 Single Player"** on the start screen
2. Race against 5 AI opponents
3. Collect power-ups (💧 Lube, 💊 Viagra) for speed boosts
4. Avoid obstacles (🛡️ Condoms, 💊 Pills, 🦠 STDs, 🧬 Antibodies)
5. First to reach the egg at the top wins!

### Multiplayer Mode

1. Click **"👥 Multiplayer"** on the start screen
2. **Create Room** or **Join Room** with a 6-character code
3. Wait for players to join (2-6 players)
4. Host clicks **"Start Game"** when ready
5. Race against real players in real-time!
6. Collide with opponents to steal their power-ups

### Power-Ups

| Power-Up | Effect | Duration |
|----------|--------|----------|
| 💧 **Lube Boost** | 1.5x speed multiplier | 3 seconds |
| 💊 **Viagra** | 2.0x speed multiplier | 3 seconds |

### Obstacles

| Obstacle | Effect | Duration |
|----------|--------|----------|
| 🛡️ **Condom** | Slowdown | 2 seconds |
| 💊 **Pill** | Slowdown | 1.5 seconds |
| 🦠 **STD** | Heavy slowdown | 2.5 seconds |
| 🧬 **Antibody** | Chases you and slows on hit | Until avoided |

---

## 📂 Project Structure

```
gene-pool-royale/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   │   ├── images/       # Game sprites
│   │   └── sounds/       # Audio files
│   └── src/
│       ├── components/   # React components
│       │   ├── ui/      # Reusable UI components
│       │   ├── GameCanvas.tsx        # Main game rendering
│       │   ├── StartScreen.tsx       # Initial screen
│       │   ├── LobbyScreen.tsx       # Multiplayer lobby
│       │   ├── FinishScreen.tsx      # Race results
│       │   └── ... more components
│       ├── lib/
│       │   ├── stores/  # Zustand state stores
│       │   │   ├── useRace.tsx       # Race state
│       │   │   ├── useMultiplayer.tsx # Multiplayer state
│       │   │   ├── useAudio.tsx      # Audio control
│       │   │   └── useGame.tsx       # Game phase
│       │   └── socket.ts             # Socket.IO client
│       ├── App.tsx       # Main app component
│       └── main.tsx      # Entry point
│
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── socket.ts         # Socket.IO multiplayer logic
│   ├── routes.ts         # HTTP routes
│   └── vite.ts           # Dev server setup
│
├── shared/               # Shared code (client + server)
│   └── schema.ts         # Database schema
│
├── docs/                 # Documentation
│   ├── TECHNICAL_DOCUMENTATION.md   # Tech details
│   └── BEGINNERS_GUIDE.md          # Complete guide
│
└── Configuration files
    ├── package.json      # Dependencies
    ├── vite.config.ts    # Vite settings
    ├── tsconfig.json     # TypeScript config
    └── tailwind.config.ts # Tailwind config
```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5000 |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | Type-check without building |
| `npm run db:push` | Push database schema |

### Development Workflow

1. **Start the dev server**
```bash
npm run dev
```

2. **Make changes** - Vite provides instant HMR (Hot Module Replacement)

3. **Test multiplayer** - Open multiple browser windows/tabs

4. **Type checking**
```bash
npm run check
```

### Adding New Features

- **Game Components**: Add to `client/src/components/`
- **Game Logic**: Update `client/src/lib/stores/useRace.tsx`
- **Multiplayer Events**: Update `server/socket.ts` and `client/src/lib/stores/useMultiplayer.tsx`
- **UI Components**: Add to `client/src/components/ui/`
- **Styling**: Use Tailwind utility classes

### Debugging

**Client-Side:**
- Open browser DevTools console
- React DevTools extension recommended

**Server-Side:**
- Check terminal console logs
- Enable Socket.IO debug: `DEBUG=socket.io* npm run dev`

**Common Issues:**
- Port 5000 in use? Change in `server/index.ts`
- HMR not working? Check `vite.config.ts` has `allowedHosts: true`
- Socket disconnections? Check `client/src/lib/socket.ts` reconnection settings

---

## 🌐 Deployment

### Deploy to Replit

This project is optimized for Replit deployment:

1. **Fork/Import** this repository to Replit
2. **Run** - Replit will auto-detect and install dependencies
3. **Publish** - Use Replit's deployment features

### Deploy to Other Platforms

**Build the project:**
```bash
npm run build
```

**Output:**
- Client: `dist/public/`
- Server: `dist/index.js`

**Environment Variables:**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_url  # Optional
```

**Start production server:**
```bash
npm run start
```

### Platform-Specific Guides

- **Vercel**: Deploy client separately, use serverless functions
- **Heroku**: Use `Procfile` with `npm run start`
- **Railway**: Auto-detects Node.js, deploy directly
- **Render**: Use build command `npm run build`, start with `npm run start`

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Database Integration** - Persistent user accounts and high scores
- [ ] **Authentication** - User registration and login
- [ ] **Global Leaderboards** - Track top players worldwide
- [ ] **Custom Rooms** - Configurable game settings
- [ ] **More Power-Ups** - Shield, teleport, freeze, etc.
- [ ] **Boss Battles** - Special boss sperm encounters
- [ ] **Spectator Mode** - Watch ongoing races
- [ ] **Mobile Support** - Touch controls for mobile devices
- [ ] **3D Graphics** - Migrate to Three.js
- [ ] **Achievements** - Unlock badges and rewards

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

4. **Commit with descriptive messages**
```bash
git commit -m "Add amazing feature"
```

5. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write TypeScript with proper types
- Test multiplayer features thoroughly
- Update documentation if needed
- Keep commits focused and atomic

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- **React** - UI framework
- **Socket.IO** - Real-time communication
- **Vite** - Amazing build tool
- **Tailwind CSS** - Styling made easy
- **Radix UI** - Accessible components
- **shadcn/ui** - Beautiful component system
- **Replit** - Development and deployment platform

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gene-pool-royale/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gene-pool-royale/discussions)
- **Twitter**: [@yourusername](https://twitter.com/yourusername)

---

## 🎉 Fun Facts

- The entire race track is **40x the screen height**!
- The game runs at **60 FPS** with smooth canvas rendering
- Sperm tails have **20 animated segments** each
- You can play with up to **6 players** simultaneously
- The voice control phrase is intentionally ridiculous 😄

---

<div align="center">

**Made with ❤️ and a sense of humor**

If you enjoyed this project, please give it a ⭐ on GitHub!

[⬆ Back to Top](#-gene-pool-royale)

</div>
