import { Server as SocketServer } from "socket.io";
import type { Server } from "http";

export interface Player {
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

export interface GameRoom {
  id: string;
  players: Map<string, Player>;
  powerUps: any[];
  obstacles: any[];
  droppedCondoms: any[];
  gameStarted: boolean;
  gameFinished: boolean;
  host: string;
  createdAt: number;
}

const rooms = new Map<string, GameRoom>();
const playerColors = ["#FF6B9D", "#3498DB", "#9B59B6", "#E74C3C", "#2ECC71", "#F39C12"];

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a unique room code that doesn't already exist
function createRoomCode(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  return code;
}

export function setupSocket(httpServer: Server) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new room
    socket.on("create-room", (data: { nickname: string }) => {
      const roomCode = createRoomCode();
      const colorIndex = 0;
      
      const player: Player = {
        id: socket.id,
        socketId: socket.id,
        nickname: data.nickname || "Player",
        color: playerColors[colorIndex],
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        y: 100,
        velocityX: 0,
        velocityY: 0,
        speedMultiplier: 1,
        slowdownTimer: 0,
        tailPhase: 0,
        slipstreamTimer: 0,
        activePowerUpType: null,
        powerUpTimer: 0,
        finished: false,
      };

      const room: GameRoom = {
        id: roomCode,
        players: new Map([[socket.id, player]]),
        powerUps: [],
        obstacles: [],
        droppedCondoms: [],
        gameStarted: false,
        gameFinished: false,
        host: socket.id,
        createdAt: Date.now(),
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);
      
      socket.emit("room-created", {
        roomCode,
        player,
        isHost: true,
      });

      console.log(`Room created: ${roomCode} by ${data.nickname}`);
    });

    // Join an existing room
    socket.on("join-room", (data: { roomCode: string; nickname: string }) => {
      const room = rooms.get(data.roomCode.toUpperCase());
      
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      if (room.players.size >= 3) {
        socket.emit("room-error", { message: "Room is full (max 3 players)" });
        return;
      }

      if (room.gameStarted) {
        socket.emit("room-error", { message: "Game already in progress" });
        return;
      }

      const colorIndex = room.players.size % playerColors.length;
      
      const player: Player = {
        id: socket.id,
        socketId: socket.id,
        nickname: data.nickname || `Player ${room.players.size + 1}`,
        color: playerColors[colorIndex],
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        y: 100,
        velocityX: 0,
        velocityY: 0,
        speedMultiplier: 1,
        slowdownTimer: 0,
        tailPhase: 0,
        slipstreamTimer: 0,
        activePowerUpType: null,
        powerUpTimer: 0,
        finished: false,
      };

      room.players.set(socket.id, player);
      socket.join(data.roomCode.toUpperCase());

      // Send room state to the joining player
      socket.emit("room-joined", {
        roomCode: data.roomCode.toUpperCase(),
        player,
        players: Array.from(room.players.values()),
        isHost: room.host === socket.id,
      });

      // Notify other players
      socket.to(data.roomCode.toUpperCase()).emit("player-joined", {
        player,
        players: Array.from(room.players.values()),
      });

      console.log(`${data.nickname} joined room ${data.roomCode.toUpperCase()}`);
    });

    // Start the game (host only)
    socket.on("start-game", (data: { roomCode: string; powerUps: any[]; obstacles: any[] }) => {
      const room = rooms.get(data.roomCode);
      
      if (!room) return;
      if (room.host !== socket.id) {
        socket.emit("room-error", { message: "Only host can start the game" });
        return;
      }

      room.gameStarted = true;
      room.powerUps = data.powerUps;
      room.obstacles = data.obstacles;

      io.to(data.roomCode).emit("game-started", {
        powerUps: data.powerUps,
        obstacles: data.obstacles,
        players: Array.from(room.players.values()),
      });

      console.log(`Game started in room ${data.roomCode}`);
    });

    // Update player position
    socket.on("update-position", (data: {
      roomCode: string;
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
    }) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      // Update player data
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

      // Broadcast to other players in the room
      socket.to(data.roomCode).emit("player-update", {
        playerId: socket.id,
        ...data,
      });
    });

    // Collect power-up
    socket.on("collect-powerup", (data: { roomCode: string; powerUpId: string }) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      io.to(data.roomCode).emit("powerup-collected", {
        playerId: socket.id,
        powerUpId: data.powerUpId,
      });
    });

    // Hit obstacle
    socket.on("hit-obstacle", (data: { roomCode: string; obstacleId: string }) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      io.to(data.roomCode).emit("obstacle-hit", {
        playerId: socket.id,
        obstacleId: data.obstacleId,
      });
    });

    // Drop condom
    socket.on("drop-condom", (data: { roomCode: string; condom: any }) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      room.droppedCondoms.push(data.condom);

      socket.to(data.roomCode).emit("condom-dropped", {
        playerId: socket.id,
        condom: data.condom,
      });
    });

    // Player finished race
    socket.on("player-finished", (data: { roomCode: string }) => {
      const room = rooms.get(data.roomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player || player.finished) return;

      player.finished = true;
      player.finishTime = Date.now() - room.createdAt;

      io.to(data.roomCode).emit("player-crossed-finish", {
        playerId: socket.id,
        nickname: player.nickname,
        finishTime: player.finishTime,
        position: Array.from(room.players.values()).filter(p => p.finished).length,
      });

      // Check if all players finished
      const allFinished = Array.from(room.players.values()).every(p => p.finished);
      if (allFinished) {
        room.gameFinished = true;
        const rankings = Array.from(room.players.values())
          .filter(p => p.finished)
          .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));

        io.to(data.roomCode).emit("game-finished", {
          rankings,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      // Find and remove player from all rooms
      for (const [roomCode, room] of Array.from(rooms.entries())) {
        if (room.players.has(socket.id)) {
          const player = room.players.get(socket.id);
          room.players.delete(socket.id);

          // Notify other players
          io.to(roomCode).emit("player-left", {
            playerId: socket.id,
            nickname: player?.nickname,
            players: Array.from(room.players.values()),
          });

          // If host left, assign new host
          if (room.host === socket.id && room.players.size > 0) {
            const newHost = Array.from(room.players.keys())[0];
            room.host = newHost;
            io.to(roomCode).emit("new-host", { hostId: newHost });
          }

          // Delete empty rooms
          if (room.players.size === 0) {
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (empty)`);
          }

          break;
        }
      }
    });
  });

  // Clean up old rooms periodically (every 10 minutes)
  setInterval(() => {
    const now = Date.now();
    const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    for (const [roomCode, room] of Array.from(rooms.entries())) {
      if (now - room.createdAt > ROOM_TIMEOUT) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (timeout)`);
      }
    }
  }, 10 * 60 * 1000);

  return io;
}
