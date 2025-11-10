import { create } from "zustand";
import { getSocket } from "../socket";
import { useRace } from "./useRace";

export interface MultiplayerPlayer {
  id: string;
  socketId: string;
  nickname: string;
  color: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speedMultiplier: number;
  slowdownTimer: number;
  tailPhase: number;
  slipstreamTimer: number;
  activePowerUpType: string | null;
  powerUpTimer: number;
  finished: boolean;
  finishTime?: number;
}

interface MultiplayerState {
  isMultiplayer: boolean;
  roomCode: string | null;
  localPlayerId: string | null;
  localPlayerNickname: string | null;
  players: Map<string, MultiplayerPlayer>;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
  gameStarted: boolean;
  rankings: MultiplayerPlayer[];
  listenersSetup: boolean;

  // Actions
  setMultiplayer: (enabled: boolean) => void;
  createRoom: (nickname: string) => void;
  joinRoom: (roomCode: string, nickname: string) => void;
  leaveRoom: () => void;
  startGame: (powerUps: any[], obstacles: any[]) => void;
  updatePosition: (data: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    tailPhase: number;
    speedMultiplier: number;
    slowdownTimer: number;
    slipstreamTimer: number;
    activePowerUpType: string | null;
    powerUpTimer: number;
  }) => void;
  collectPowerUp: (powerUpId: string) => void;
  hitObstacle: (obstacleId: string) => void;
  dropCondom: (condom: any) => void;
  playerFinished: () => void;
  setupSocketListeners: () => void;
  clearError: () => void;
}

export const useMultiplayer = create<MultiplayerState>((set, get) => ({
  isMultiplayer: false,
  roomCode: null,
  localPlayerId: null,
  localPlayerNickname: null,
  players: new Map(),
  isHost: false,
  isConnected: false,
  error: null,
  gameStarted: false,
  rankings: [],
  listenersSetup: false,

  setMultiplayer: (enabled) => set({ isMultiplayer: enabled }),

  createRoom: (nickname) => {
    const socket = getSocket();
    set({ localPlayerNickname: nickname, error: null });
    localStorage.setItem("multiplayerNickname", nickname);
    socket.emit("create-room", { nickname });
  },

  joinRoom: (roomCode, nickname) => {
    const socket = getSocket();
    set({ localPlayerNickname: nickname, error: null });
    localStorage.setItem("multiplayerRoomCode", roomCode.toUpperCase());
    localStorage.setItem("multiplayerNickname", nickname);
    socket.emit("join-room", { roomCode: roomCode.toUpperCase(), nickname });
  },

  leaveRoom: () => {
    const socket = getSocket();
    socket.disconnect();
    socket.connect();
    localStorage.removeItem("multiplayerRoomCode");
    localStorage.removeItem("multiplayerNickname");
    set({
      roomCode: null,
      localPlayerId: null,
      localPlayerNickname: null,
      players: new Map(),
      isHost: false,
      isConnected: false,
      gameStarted: false,
      rankings: [],
      error: null,
    });
  },

  startGame: (powerUps, obstacles) => {
    const socket = getSocket();
    const { roomCode } = get();
    if (roomCode) {
      socket.emit("start-game", { roomCode, powerUps, obstacles });
    }
  },

  updatePosition: (data) => {
    const socket = getSocket();
    const { roomCode, localPlayerId } = get();
    if (roomCode && localPlayerId) {
      socket.emit("update-position", {
        roomCode,
        ...data,
      });

      // Update local player in the players map
      set((state) => {
        const newPlayers = new Map(state.players);
        const localPlayer = newPlayers.get(localPlayerId);
        if (localPlayer) {
          Object.assign(localPlayer, data);
        }
        return { players: newPlayers };
      });
    }
  },

  collectPowerUp: (powerUpId) => {
    const socket = getSocket();
    const { roomCode } = get();
    if (roomCode) {
      socket.emit("collect-powerup", { roomCode, powerUpId });
    }
  },

  hitObstacle: (obstacleId) => {
    const socket = getSocket();
    const { roomCode } = get();
    if (roomCode) {
      socket.emit("hit-obstacle", { roomCode, obstacleId });
    }
  },

  dropCondom: (condom) => {
    const socket = getSocket();
    const { roomCode } = get();
    if (roomCode) {
      socket.emit("drop-condom", { roomCode, condom });
    }
  },

  playerFinished: () => {
    const socket = getSocket();
    const { roomCode } = get();
    if (roomCode) {
      socket.emit("player-finished", { roomCode });
    }
  },

  setupSocketListeners: () => {
    // Only set up listeners once
    if (get().listenersSetup) {
      return;
    }
    
    const socket = getSocket();
    set({ listenersSetup: true });

    // Room created
    socket.on("room-created", (data: { roomCode: string; player: MultiplayerPlayer; isHost: boolean }) => {
      const newPlayers = new Map<string, MultiplayerPlayer>();
      newPlayers.set(data.player.id, data.player);
      localStorage.setItem("multiplayerRoomCode", data.roomCode);
      set({
        roomCode: data.roomCode,
        localPlayerId: data.player.id,
        players: newPlayers,
        isHost: data.isHost,
        isConnected: true,
      });
    });

    // Room joined
    socket.on("room-joined", (data: {
      roomCode: string;
      player: MultiplayerPlayer;
      players: MultiplayerPlayer[];
      isHost: boolean;
    }) => {
      const newPlayers = new Map<string, MultiplayerPlayer>();
      data.players.forEach((p) => newPlayers.set(p.id, p));
      localStorage.setItem("multiplayerRoomCode", data.roomCode);
      set({
        roomCode: data.roomCode,
        localPlayerId: data.player.id,
        players: newPlayers,
        isHost: data.isHost,
        isConnected: true,
      });
    });

    // Player joined (notification for existing players)
    socket.on("player-joined", (data: { player: MultiplayerPlayer; players: MultiplayerPlayer[] }) => {
      const newPlayers = new Map<string, MultiplayerPlayer>();
      data.players.forEach((p) => newPlayers.set(p.id, p));
      set({ players: newPlayers });
    });

    // Player left
    socket.on("player-left", (data: { playerId: string; nickname: string; players: MultiplayerPlayer[] }) => {
      const newPlayers = new Map<string, MultiplayerPlayer>();
      data.players.forEach((p) => newPlayers.set(p.id, p));
      set({ players: newPlayers });
    });

    // New host
    socket.on("new-host", (data: { hostId: string }) => {
      const { localPlayerId } = get();
      set({ isHost: data.hostId === localPlayerId });
    });

    // Game started
    socket.on("game-started", (data: { powerUps: any[]; obstacles: any[]; players: MultiplayerPlayer[] }) => {
      const newPlayers = new Map<string, MultiplayerPlayer>();
      data.players.forEach((p) => newPlayers.set(p.id, p));
      set({ gameStarted: true, players: newPlayers });
      
      // Trigger race start for all clients
      useRace.getState().startRace();
    });

    // Player update
    socket.on("player-update", (data: any) => {
      set((state) => {
        const newPlayers = new Map(state.players);
        const player = newPlayers.get(data.playerId);
        if (player) {
          Object.assign(player, {
            x: data.x,
            y: data.y,
            velocityX: data.velocityX,
            velocityY: data.velocityY,
            tailPhase: data.tailPhase,
            speedMultiplier: data.speedMultiplier,
            slowdownTimer: data.slowdownTimer,
            slipstreamTimer: data.slipstreamTimer,
            activePowerUpType: data.activePowerUpType,
            powerUpTimer: data.powerUpTimer,
          });
        }
        return { players: newPlayers };
      });
    });

    // Power-up collected
    socket.on("powerup-collected", (data: { playerId: string; powerUpId: string }) => {
      // This will be handled by the game logic
    });

    // Obstacle hit
    socket.on("obstacle-hit", (data: { playerId: string; obstacleId: string }) => {
      // This will be handled by the game logic
    });

    // Condom dropped
    socket.on("condom-dropped", (data: { playerId: string; condom: any }) => {
      // This will be handled by the game logic
    });

    // Player crossed finish
    socket.on("player-crossed-finish", (data: {
      playerId: string;
      nickname: string;
      finishTime: number;
      position: number;
    }) => {
      set((state) => {
        const newPlayers = new Map(state.players);
        const player = newPlayers.get(data.playerId);
        if (player) {
          player.finished = true;
          player.finishTime = data.finishTime;
        }
        return { players: newPlayers };
      });
    });

    // Game finished
    socket.on("game-finished", (data: { rankings: MultiplayerPlayer[] }) => {
      set({ rankings: data.rankings });
    });

    // Error
    socket.on("room-error", (data: { message: string }) => {
      set({ error: data.message });
      // If room not found during reconnection, clear localStorage
      if (data.message === "Room not found") {
        localStorage.removeItem("multiplayerRoomCode");
      }
    });
  },

  clearError: () => set({ error: null }),
}));

// Auto-reconnection on page load
if (typeof window !== 'undefined') {
  // Set up socket listeners immediately
  useMultiplayer.getState().setupSocketListeners();
  
  const savedRoomCode = localStorage.getItem("multiplayerRoomCode");
  const savedNickname = localStorage.getItem("multiplayerNickname");
  
  if (savedRoomCode && savedNickname) {
    // Wait a bit for socket to initialize, then reconnect
    setTimeout(() => {
      console.log(`Attempting to reconnect to room ${savedRoomCode} as ${savedNickname}`);
      useMultiplayer.getState().joinRoom(savedRoomCode, savedNickname);
    }, 1000);
  }
}
