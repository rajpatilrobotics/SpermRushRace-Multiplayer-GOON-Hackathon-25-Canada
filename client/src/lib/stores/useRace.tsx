import { create } from "zustand";

export type RacePhase = "ready" | "racing" | "finished";

export interface PowerUp {
  id: string;
  type: "lube" | "mutation" | "viagra";
  x: number;
  y: number;
  active: boolean;
}

export interface Obstacle {
  id: string;
  type: "condom" | "pill" | "antibody" | "std";
  x: number;
  y: number;
  active: boolean;
}

export interface Racer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speedMultiplier: number;
  slowdownTimer: number;
  tailPhase: number;
  isPlayer: boolean;
  slipstreamTimer: number;
  activePowerUpType: string | null;
  powerUpTimer: number;
}

export interface ActiveEffect {
  type: string;
  message: string;
  duration: number;
  timer: number;
}

interface RaceState {
  phase: RacePhase;
  racers: Racer[];
  powerUps: PowerUp[];
  obstacles: Obstacle[];
  trackHeight: number;
  cameraY: number;
  activeEffect: ActiveEffect | null;
  lastCommentaryTime: number;
  voiceBoostActive: boolean;
  voiceBoostCooldown: number;
  droppedCondoms: Obstacle[];
  
  // Actions
  startRace: () => void;
  resetRace: () => void;
  finishRace: () => void;
  updateRacer: (id: string, updates: Partial<Racer>) => void;
  collectPowerUp: (racerId: string, powerUpId: string) => void;
  hitObstacle: (racerId: string, obstacleId: string) => void;
  updateCamera: (y: number) => void;
  setActiveEffect: (effect: ActiveEffect | null) => void;
  activateVoiceBoost: () => void;
  updateTimers: (delta: number) => void;
  checkCollisions: () => void;
  dropCondom: () => void;
  checkSlipstreams: () => void;
}

const TRACK_HEIGHT = 40 * window.innerHeight;
const CANVAS_WIDTH = window.innerWidth;

// Generate power-ups along the track
const generatePowerUps = (): PowerUp[] => {
  const powerUps: PowerUp[] = [];
  const types: PowerUp["type"][] = ["lube", "mutation", "viagra"];
  
  for (let i = 500; i < TRACK_HEIGHT; i += 400) {
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({
      id: `powerup-${i}`,
      type,
      x: Math.random() * (CANVAS_WIDTH - 200) + 100,
      y: i,
      active: true,
    });
  }
  
  return powerUps;
};

// Generate obstacles along the track
const generateObstacles = (): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  const types: Obstacle["type"][] = ["condom", "pill", "antibody", "std"];
  
  for (let i = 800; i < TRACK_HEIGHT; i += 600) {
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push({
      id: `obstacle-${i}`,
      type,
      x: Math.random() * (CANVAS_WIDTH - 200) + 100,
      y: i,
      active: true,
    });
  }
  
  return obstacles;
};

export const useRace = create<RaceState>((set, get) => ({
  phase: "ready",
  racers: [
    {
      id: "player",
      name: "You",
      color: "#FF6B9D",
      x: CANVAS_WIDTH / 2,
      y: 100,
      velocityX: 0,
      velocityY: 0,
      speedMultiplier: 1,
      slowdownTimer: 0,
      tailPhase: 0,
      isPlayer: true,
      slipstreamTimer: 0,
      activePowerUpType: null,
      powerUpTimer: 0,
    },
    {
      id: "speedy",
      name: "Speedy",
      color: "#9B59B6",
      x: CANVAS_WIDTH / 2 - 100,
      y: 100,
      velocityX: 0,
      velocityY: 0,
      speedMultiplier: 1,
      slowdownTimer: 0,
      tailPhase: 0,
      isPlayer: false,
      slipstreamTimer: 0,
      activePowerUpType: null,
      powerUpTimer: 0,
    },
    {
      id: "turbo",
      name: "Turbo",
      color: "#F39C12",
      x: CANVAS_WIDTH / 2 + 100,
      y: 100,
      velocityX: 0,
      velocityY: 0,
      speedMultiplier: 1,
      slowdownTimer: 0,
      tailPhase: 0,
      isPlayer: false,
      slipstreamTimer: 0,
      activePowerUpType: null,
      powerUpTimer: 0,
    },
  ],
  powerUps: generatePowerUps(),
  obstacles: generateObstacles(),
  trackHeight: TRACK_HEIGHT,
  cameraY: 0,
  activeEffect: null,
  lastCommentaryTime: 0,
  voiceBoostActive: false,
  voiceBoostCooldown: 0,
  droppedCondoms: [],
  
  startRace: () => set({ phase: "racing" }),
  
  resetRace: () => {
    set({
      phase: "ready",
      racers: [
        {
          id: "player",
          name: "You",
          color: "#FF6B9D",
          x: CANVAS_WIDTH / 2,
          y: 100,
          velocityX: 0,
          velocityY: 0,
          speedMultiplier: 1,
          slowdownTimer: 0,
          tailPhase: 0,
          isPlayer: true,
          slipstreamTimer: 0,
          activePowerUpType: null,
          powerUpTimer: 0,
        },
        {
          id: "speedy",
          name: "Speedy",
          color: "#9B59B6",
          x: CANVAS_WIDTH / 2 - 100,
          y: 100,
          velocityX: 0,
          velocityY: 0,
          speedMultiplier: 1,
          slowdownTimer: 0,
          tailPhase: 0,
          isPlayer: false,
          slipstreamTimer: 0,
          activePowerUpType: null,
          powerUpTimer: 0,
        },
        {
          id: "turbo",
          name: "Turbo",
          color: "#F39C12",
          x: CANVAS_WIDTH / 2 + 100,
          y: 100,
          velocityX: 0,
          velocityY: 0,
          speedMultiplier: 1,
          slowdownTimer: 0,
          tailPhase: 0,
          isPlayer: false,
          slipstreamTimer: 0,
          activePowerUpType: null,
          powerUpTimer: 0,
        },
      ],
      powerUps: generatePowerUps(),
      obstacles: generateObstacles(),
      cameraY: 0,
      activeEffect: null,
      lastCommentaryTime: 0,
      voiceBoostActive: false,
      voiceBoostCooldown: 0,
      droppedCondoms: [],
    });
  },
  
  finishRace: () => set({ phase: "finished" }),
  
  updateRacer: (id, updates) => {
    set((state) => ({
      racers: state.racers.map((racer) =>
        racer.id === id ? { ...racer, ...updates } : racer
      ),
    }));
  },
  
  collectPowerUp: (racerId, powerUpId) => {
    const state = get();
    const powerUp = state.powerUps.find((p) => p.id === powerUpId);
    if (!powerUp || !powerUp.active) return;
    
    // Deactivate power-up
    set({
      powerUps: state.powerUps.map((p) =>
        p.id === powerUpId ? { ...p, active: false } : p
      ),
    });
    
    // Apply effect
    const racer = state.racers.find((r) => r.id === racerId);
    if (!racer) return;
    
    const playerName = (racer as any).nickname || racer.name;
    let message = "";
    let multiplier = 1;
    
    switch (powerUp.type) {
      case "lube":
        multiplier = 1.5;
        message = `💧 ${playerName} got Lube Boost!`;
        break;
      case "mutation":
        multiplier = 1.3;
        message = `🧬 ${playerName} got Mutation!`;
        break;
      case "viagra":
        multiplier = 1.7;
        message = `💊 ${playerName} got Viagra Power!`;
        break;
    }
    
    get().updateRacer(racerId, { 
      speedMultiplier: multiplier,
      activePowerUpType: powerUp.type,
      powerUpTimer: 3000,
    });
    get().setActiveEffect({ type: powerUp.type, message, duration: 3000, timer: 3000 });
  },
  
  hitObstacle: (racerId, obstacleId) => {
    const state = get();
    const obstacle = state.obstacles.find((o) => o.id === obstacleId);
    if (!obstacle || !obstacle.active) return;
    
    // Deactivate obstacle
    set({
      obstacles: state.obstacles.map((o) =>
        o.id === obstacleId ? { ...o, active: false } : o
      ),
    });
    
    const racer = state.racers.find((r) => r.id === racerId);
    if (!racer) return;
    
    const playerName = (racer as any).nickname || racer.name;
    let message = "";
    let slowdownDuration = 0;
    
    switch (obstacle.type) {
      case "condom":
        slowdownDuration = 2000;
        message = `🚫 ${playerName} hit Condom Barrier!`;
        break;
      case "pill":
        slowdownDuration = 1500;
        message = `💊 ${playerName} hit Birth Control!`;
        break;
      case "antibody":
        slowdownDuration = 3000;
        message = `🦠 ${playerName} hit Antibody!`;
        break;
      case "std":
        slowdownDuration = 3000;
        message = `🦠 ${playerName} hit STD!`;
        break;
    }
    
    get().updateRacer(racerId, { speedMultiplier: 0.5, slowdownTimer: slowdownDuration });
    get().setActiveEffect({ type: obstacle.type, message, duration: slowdownDuration, timer: slowdownDuration });
  },
  
  updateCamera: (y) => set({ cameraY: y }),
  
  setActiveEffect: (effect) => set({ activeEffect: effect }),
  
  activateVoiceBoost: () => {
    const state = get();
    if (state.voiceBoostCooldown > 0) return;
    
    set({ voiceBoostActive: true, voiceBoostCooldown: 10000 });
    
    const player = state.racers.find((r) => r.isPlayer);
    if (player) {
      get().updateRacer(player.id, { speedMultiplier: 2 });
      get().setActiveEffect({
        type: "voice",
        message: "🎤 VOICE BOOST! East or West, Goon Hack is the Best!",
        duration: 3000,
        timer: 3000,
      });
      
      setTimeout(() => {
        get().updateRacer(player.id, { speedMultiplier: 1 });
        set({ voiceBoostActive: false });
      }, 3000);
    }
  },
  
  updateTimers: (delta) => {
    set((state) => {
      const newRacers = state.racers.map((racer) => {
        let updates: Partial<Racer> = {};
        
        // Handle slowdown timer
        if (racer.slowdownTimer > 0) {
          const newTimer = Math.max(0, racer.slowdownTimer - delta);
          updates.slowdownTimer = newTimer;
          if (newTimer === 0 && !racer.activePowerUpType) {
            updates.speedMultiplier = 1;
          }
        }
        
        // Handle power-up timer
        if (racer.powerUpTimer > 0) {
          const newPowerUpTimer = Math.max(0, racer.powerUpTimer - delta);
          updates.powerUpTimer = newPowerUpTimer;
          if (newPowerUpTimer === 0) {
            updates.speedMultiplier = 1;
            updates.activePowerUpType = null;
          }
        }
        
        // Handle slipstream timer decay
        if (racer.slipstreamTimer > 0) {
          const newSlipstreamTimer = Math.max(0, racer.slipstreamTimer - delta);
          updates.slipstreamTimer = newSlipstreamTimer;
        }
        
        return Object.keys(updates).length > 0 ? { ...racer, ...updates } : racer;
      });
      
      const newActiveEffect = state.activeEffect
        ? {
            ...state.activeEffect,
            timer: Math.max(0, state.activeEffect.timer - delta),
          }
        : null;
      
      const newVoiceBoostCooldown = Math.max(0, state.voiceBoostCooldown - delta);
      
      return {
        racers: newRacers,
        activeEffect: newActiveEffect && newActiveEffect.timer > 0 ? newActiveEffect : null,
        voiceBoostCooldown: newVoiceBoostCooldown,
      };
    });
  },
  
  checkCollisions: () => {
    const state = get();
    
    state.racers.forEach((racer) => {
      // Check power-up collisions
      state.powerUps.forEach((powerUp) => {
        if (!powerUp.active) return;
        const dx = racer.x - powerUp.x;
        const dy = racer.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40) {
          get().collectPowerUp(racer.id, powerUp.id);
        }
      });
      
      // Check obstacle collisions
      state.obstacles.forEach((obstacle) => {
        if (!obstacle.active) return;
        const dx = racer.x - obstacle.x;
        const dy = racer.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40) {
          get().hitObstacle(racer.id, obstacle.id);
        }
      });
      
      // Check dropped condom collisions
      state.droppedCondoms.forEach((condom) => {
        if (!condom.active) return;
        const dx = racer.x - condom.x;
        const dy = racer.y - condom.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40) {
          // Deactivate the dropped condom
          set((state) => ({
            droppedCondoms: state.droppedCondoms.map((c) =>
              c.id === condom.id ? { ...c, active: false } : c
            ),
          }));
          
          // Apply slowdown
          get().updateRacer(racer.id, { speedMultiplier: 0.5, slowdownTimer: 2000 });
          get().setActiveEffect({
            type: "condom",
            message: "🚫 CONDOM BARRIER! -50% Speed!",
            duration: 2000,
            timer: 2000,
          });
        }
      });
    });
    
    // Check racer-to-racer collisions (bumping/bouncing and power-up stealing)
    for (let i = 0; i < state.racers.length; i++) {
      for (let j = i + 1; j < state.racers.length; j++) {
        const racer1 = state.racers[i];
        const racer2 = state.racers[j];
        
        const dx = racer1.x - racer2.x;
        const dy = racer1.y - racer2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
          // Bump/bounce physics
          const angle = Math.atan2(dy, dx);
          const pushStrength = 3;
          
          get().updateRacer(racer1.id, {
            x: racer1.x + Math.cos(angle) * pushStrength,
            velocityX: Math.cos(angle) * pushStrength,
          });
          
          get().updateRacer(racer2.id, {
            x: racer2.x - Math.cos(angle) * pushStrength,
            velocityX: -Math.cos(angle) * pushStrength,
          });
          
          // Power-up stealing (only steal once per collision)
          const state = get();
          const currentRacer1 = state.racers.find(r => r.id === racer1.id);
          const currentRacer2 = state.racers.find(r => r.id === racer2.id);
          
          if (currentRacer1 && currentRacer2) {
            if (currentRacer1.activePowerUpType && currentRacer1.powerUpTimer > 100 && !currentRacer2.activePowerUpType) {
              get().updateRacer(racer2.id, {
                speedMultiplier: currentRacer1.speedMultiplier,
                activePowerUpType: currentRacer1.activePowerUpType,
                powerUpTimer: currentRacer1.powerUpTimer,
              });
              get().updateRacer(racer1.id, {
                speedMultiplier: 1,
                activePowerUpType: null,
                powerUpTimer: 0,
              });
              get().setActiveEffect({
                type: "steal",
                message: `${racer2.name} stole ${racer1.name}'s power-up!`,
                duration: 2000,
                timer: 2000,
              });
            } else if (currentRacer2.activePowerUpType && currentRacer2.powerUpTimer > 100 && !currentRacer1.activePowerUpType) {
              get().updateRacer(racer1.id, {
                speedMultiplier: currentRacer2.speedMultiplier,
                activePowerUpType: currentRacer2.activePowerUpType,
                powerUpTimer: currentRacer2.powerUpTimer,
              });
              get().updateRacer(racer2.id, {
                speedMultiplier: 1,
                activePowerUpType: null,
                powerUpTimer: 0,
              });
              get().setActiveEffect({
                type: "steal",
                message: `${racer1.name} stole ${racer2.name}'s power-up!`,
                duration: 2000,
                timer: 2000,
              });
            }
          }
        }
      }
    }
  },
  
  dropCondom: () => {
    const state = get();
    const player = state.racers.find((r) => r.isPlayer);
    if (!player) return;
    
    const newCondom: Obstacle = {
      id: `dropped-condom-${Date.now()}`,
      type: "condom",
      x: player.x,
      y: player.y - 50,
      active: true,
    };
    
    set((state) => ({
      droppedCondoms: [...state.droppedCondoms, newCondom],
    }));
    
    console.log("Condom dropped at", player.x, player.y);
  },
  
  checkSlipstreams: () => {
    const state = get();
    
    state.racers.forEach((follower) => {
      let inSlipstream = false;
      
      state.racers.forEach((leader) => {
        if (follower.id === leader.id) return;
        
        // Check if follower is behind leader
        const dy = leader.y - follower.y;
        const dx = Math.abs(leader.x - follower.x);
        
        // Slipstream conditions: 80-120 units behind, within 50 units laterally
        if (dy > 80 && dy < 120 && dx < 50) {
          inSlipstream = true;
          
          // Apply slipstream bonus (only if not already in slipstream and no active power-up)
          if (follower.slipstreamTimer === 0 && !follower.activePowerUpType && follower.slowdownTimer === 0) {
            get().updateRacer(follower.id, {
              speedMultiplier: 1.2,
              slipstreamTimer: 500,
            });
            
            if (follower.isPlayer) {
              get().setActiveEffect({
                type: "slipstream",
                message: `⚡ SLIPSTREAM! Following ${leader.name}!`,
                duration: 500,
                timer: 500,
              });
            }
          }
        }
      });
      
      // Reset speed multiplier when slipstream ends
      if (!inSlipstream && follower.slipstreamTimer <= 0) {
        const currentFollower = state.racers.find(r => r.id === follower.id);
        if (currentFollower && !currentFollower.activePowerUpType && currentFollower.slowdownTimer === 0) {
          if (currentFollower.speedMultiplier !== 1) {
            get().updateRacer(follower.id, {
              speedMultiplier: 1,
            });
          }
        }
      }
    });
  },
}));
