import { useEffect, useRef, useState } from "react";
import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import type { Racer, PowerUp, Obstacle } from "@/lib/stores/useRace";

interface Keys {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  ArrowUp: boolean;
  ArrowLeft: boolean;
  ArrowDown: boolean;
  ArrowRight: boolean;
  Shift: boolean;
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    phase,
    racers,
    powerUps,
    obstacles,
    trackHeight,
    cameraY,
    droppedCondoms,
    updateRacer,
    updateCamera,
    updateTimers,
    checkCollisions,
    checkSlipstreams,
    dropCondom,
    finishRace,
  } = useRace();
  
  const {
    isMultiplayer,
    players: multiplayerPlayers,
    localPlayerId,
    updatePosition,
    playerFinished,
  } = useMultiplayer();
  
  const keysRef = useRef<Keys>({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    Shift: false,
  });
  
  const lastShiftPressRef = useRef<number>(0);
  
  const lastTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keysRef.current) {
        keysRef.current[e.key as keyof Keys] = true;
      }
      
      // Handle Shift key for dropping condoms
      if (e.key === "Shift" && phase === "racing") {
        const now = Date.now();
        if (now - lastShiftPressRef.current > 500) {
          lastShiftPressRef.current = now;
          dropCondom();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keysRef.current) {
        keysRef.current[e.key as keyof Keys] = false;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, dropCondom]);
  
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const delta = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Get current state from store
      const state = useRace.getState();
      const { phase, racers, powerUps, obstacles, droppedCondoms, trackHeight } = state;
      
      // Use mutable local camera variable for this frame's rendering
      let currentCameraY = state.cameraY;
      
      // Initialize camera position when player is at starting position (works for all phases)
      if (currentCameraY === 0 && racers.some(r => r.y === 100)) {
        const player = racers.find((r) => r.isPlayer);
        if (player) {
          // Don't clamp initially - allow negative values to position player correctly
          const minCameraY = -canvas.height * 0.5;
          currentCameraY = Math.max(minCameraY, player.y - canvas.height * 0.55);
        }
      }
      
      if (phase === "racing") {
        
        // Update timers
        state.updateTimers(delta);
        
        // Update player
        const player = racers.find((r) => r.isPlayer);
        if (player) {
          const keys = keysRef.current;
          const speed = 5 * player.speedMultiplier;
          
          let newVelX = 0;
          let newVelY = 0;
          
          if (keys.w || keys.ArrowUp) newVelY = speed;
          if (keys.s || keys.ArrowDown) newVelY = -speed * 0.3;
          if (keys.a || keys.ArrowLeft) newVelX = -speed * 0.7;
          if (keys.d || keys.ArrowRight) newVelX = speed * 0.7;
          
          const newX = Math.max(50, Math.min(canvas.width - 50, player.x + newVelX));
          const newY = player.y + newVelY;
          const newTailPhase = (player.tailPhase + 0.1) % (Math.PI * 2);
          
          state.updateRacer(player.id, {
            x: newX,
            y: newY,
            velocityX: newVelX,
            velocityY: newVelY,
            tailPhase: newTailPhase,
          });
          
          // Send position update to server if in multiplayer mode
          if (isMultiplayer) {
            updatePosition({
              x: newX,
              y: newY,
              velocityX: newVelX,
              velocityY: newVelY,
              tailPhase: newTailPhase,
              speedMultiplier: player.speedMultiplier,
              slowdownTimer: player.slowdownTimer,
              slipstreamTimer: player.slipstreamTimer,
              activePowerUpType: player.activePowerUpType,
              powerUpTimer: player.powerUpTimer,
            });
          }
          
          // Update camera to follow player (player stays in lower portion with full body visible)
          const targetCameraY = newY - canvas.height * 0.55;
          // Allow negative camera values at start to position player in lower portion correctly
          const minCameraY = -canvas.height * 0.5;  // Allow camera to go up to half screen height below zero
          currentCameraY = Math.max(minCameraY, targetCameraY);
          
          // Check if player finished
          if (newY >= trackHeight - 200) {
            state.finishRace();
            if (isMultiplayer) {
              playerFinished();
            }
          }
        }
        
        // Update AI racers (only in single-player mode)
        if (!isMultiplayer) {
          racers.forEach((racer) => {
            if (racer.isPlayer) return;
            
            const aiSpeed = racer.name === "Speedy" ? 4.2 : 4.5;
            const adjustedSpeed = aiSpeed * racer.speedMultiplier;
            
            // AI tries to avoid obstacles and collect power-ups
            let targetX = racer.x;
            const nearbyPowerUp = powerUps.find(
              (p) => p.active && Math.abs(p.y - racer.y) < 200 && Math.abs(p.x - racer.x) < 150
            );
            
            if (nearbyPowerUp) {
              targetX = nearbyPowerUp.x;
            }
            
            const nearbyObstacle = obstacles.find(
              (o) => o.active && Math.abs(o.y - racer.y) < 150 && Math.abs(o.x - racer.x) < 100
            );
            
            if (nearbyObstacle) {
              targetX = racer.x + (racer.x > nearbyObstacle.x ? 50 : -50);
            }
            
            const dx = targetX - racer.x;
            const moveX = Math.sign(dx) * Math.min(Math.abs(dx), 3);
            
            const newX = Math.max(50, Math.min(canvas.width - 50, racer.x + moveX));
            const newY = racer.y + adjustedSpeed;
            const newTailPhase = (racer.tailPhase + 0.1) % (Math.PI * 2);
            
            state.updateRacer(racer.id, {
              x: newX,
              y: newY,
              tailPhase: newTailPhase,
            });
            
            // Check if AI finished
            if (newY >= trackHeight - 200) {
              state.finishRace();
            }
          });
        }
        
        // Check collisions
        state.checkCollisions();
        
        // Check slipstreams
        state.checkSlipstreams();
      }
      
      // Sync camera back to store (after all updates, for all phases)
      state.updateCamera(currentCameraY);
      
      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#E8C4F5");
      gradient.addColorStop(1, "#C4E8F5");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Distance markers
      ctx.fillStyle = "#333";
      ctx.font = "bold 18px 'Comic Sans MS', cursive";
      for (let i = 0; i < trackHeight; i += 200) {
        const screenY = canvas.height - (i - currentCameraY);
        if (screenY > 0 && screenY < canvas.height) {
          ctx.fillText(`${i}m`, canvas.width - 60, screenY);
        }
      }
      
      // Render power-ups
      powerUps.forEach((powerUp) => {
        if (!powerUp.active) return;
        const screenY = canvas.height - (powerUp.y - currentCameraY);
        if (screenY < -50 || screenY > canvas.height + 50) return;
        
        drawPowerUp(ctx, powerUp, powerUp.x, screenY);
      });
      
      // Render obstacles (including dropped condoms)
      const allObstacles = [...obstacles, ...droppedCondoms];
      allObstacles.forEach((obstacle) => {
        if (!obstacle.active) return;
        const screenY = canvas.height - (obstacle.y - currentCameraY);
        if (screenY < -50 || screenY > canvas.height + 50) return;
        
        drawObstacle(ctx, obstacle, obstacle.x, screenY);
      });
      
      // Render racers
      if (isMultiplayer) {
        // Render multiplayer players
        const multiplayerState = useMultiplayer.getState();
        Array.from(multiplayerState.players.values()).forEach((player) => {
          const screenY = canvas.height - (player.y - currentCameraY);
          drawMultiplayerSperm(ctx, player, player.x, screenY);
        });
      } else {
        // Render single-player racers
        racers.forEach((racer) => {
          const screenY = canvas.height - (racer.y - currentCameraY);
          drawSperm(ctx, racer, racer.x, screenY);
        });
      }
      
      // Finish line
      const finishScreenY = canvas.height - (trackHeight - 200 - currentCameraY);
      if (finishScreenY > -100 && finishScreenY < canvas.height + 100) {
        ctx.fillStyle = "#FF6B9D";
        ctx.font = "bold 40px 'Comic Sans MS', cursive";
        ctx.textAlign = "center";
        ctx.fillText("🥚 FINISH 🥚", canvas.width / 2, finishScreenY);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0" />;
}

function drawSperm(ctx: CanvasRenderingContext2D, racer: Racer, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Tail (wavy, flowing behind) - drawn first so head overlaps it
  const tailLength = 60;
  const tailSegments = 20;
  
  for (let i = 0; i < tailSegments; i++) {
    const progress = i / tailSegments;
    const yPos = progress * tailLength;
    const nextProgress = (i + 1) / tailSegments;
    const nextYPos = nextProgress * tailLength;
    
    // Wavy motion
    const waveX = Math.sin(racer.tailPhase + progress * Math.PI * 2) * 6 * (1 - progress);
    const nextWaveX = Math.sin(racer.tailPhase + nextProgress * Math.PI * 2) * 6 * (1 - nextProgress);
    
    // Tapering width
    const width = 3 * (1 - progress * 0.8);
    
    // Gradient for tail
    const gradient = ctx.createLinearGradient(0, yPos, 0, nextYPos);
    gradient.addColorStop(0, racer.color);
    gradient.addColorStop(1, racer.color + "AA");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(waveX, yPos);
    ctx.lineTo(nextWaveX, nextYPos);
    ctx.stroke();
  }
  
  // Head - teardrop/tadpole shape pointing upward
  ctx.fillStyle = racer.color;
  ctx.beginPath();
  
  // Create teardrop shape
  ctx.moveTo(0, -18); // Pointed tip at top
  ctx.quadraticCurveTo(8, -10, 10, 0); // Right curve
  ctx.quadraticCurveTo(8, 8, 0, 10); // Bottom right
  ctx.quadraticCurveTo(-8, 8, -10, 0); // Bottom left
  ctx.quadraticCurveTo(-8, -10, 0, -18); // Left curve back to top
  ctx.closePath();
  ctx.fill();
  
  // Add gradient overlay for depth
  const headGradient = ctx.createRadialGradient(-3, -8, 0, 0, 0, 15);
  headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  headGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = headGradient;
  ctx.fill();
  
  // Glow effect around head
  ctx.strokeStyle = racer.color + "66";
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Outer glow
  ctx.strokeStyle = racer.color + "33";
  ctx.lineWidth = 7;
  ctx.stroke();
  
  ctx.restore();
}

function drawMultiplayerSperm(ctx: CanvasRenderingContext2D, player: any, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Tail (wavy, flowing behind) - drawn first so head overlaps it
  const tailLength = 60;
  const tailSegments = 20;
  
  for (let i = 0; i < tailSegments; i++) {
    const progress = i / tailSegments;
    const yPos = progress * tailLength;
    const nextProgress = (i + 1) / tailSegments;
    const nextYPos = nextProgress * tailLength;
    
    // Wavy motion
    const waveX = Math.sin(player.tailPhase + progress * Math.PI * 2) * 6 * (1 - progress);
    const nextWaveX = Math.sin(player.tailPhase + nextProgress * Math.PI * 2) * 6 * (1 - nextProgress);
    
    // Tapering width
    const width = 3 * (1 - progress * 0.8);
    
    // Gradient for tail
    const gradient = ctx.createLinearGradient(0, yPos, 0, nextYPos);
    gradient.addColorStop(0, player.color);
    gradient.addColorStop(1, player.color + "AA");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(waveX, yPos);
    ctx.lineTo(nextWaveX, nextYPos);
    ctx.stroke();
  }
  
  // Head - teardrop/tadpole shape pointing upward
  ctx.fillStyle = player.color;
  ctx.beginPath();
  
  // Create teardrop shape
  ctx.moveTo(0, -18); // Pointed tip at top
  ctx.quadraticCurveTo(8, -10, 10, 0); // Right curve
  ctx.quadraticCurveTo(8, 8, 0, 10); // Bottom right
  ctx.quadraticCurveTo(-8, 8, -10, 0); // Bottom left
  ctx.quadraticCurveTo(-8, -10, 0, -18); // Left curve back to top
  ctx.closePath();
  ctx.fill();
  
  // Add gradient overlay for depth
  const headGradient = ctx.createRadialGradient(-3, -8, 0, 0, 0, 15);
  headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  headGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = headGradient;
  ctx.fill();
  
  // Glow effect around head
  ctx.strokeStyle = player.color + "66";
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Outer glow
  ctx.strokeStyle = player.color + "33";
  ctx.lineWidth = 7;
  ctx.stroke();
  
  // Player nickname label
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.strokeText(player.nickname, 0, -30);
  ctx.fillText(player.nickname, 0, -30);
  
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Glow
  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  glowGradient.addColorStop(0, "#FFE66D88");
  glowGradient.addColorStop(1, "#FFE66D00");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(-30, -30, 60, 60);
  
  // Icon
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const icons = {
    lube: "💧",
    mutation: "🧬",
    viagra: "💊",
  };
  
  ctx.fillText(icons[powerUp.type], 0, 0);
  
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Icon
  ctx.font = "35px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const icons = {
    condom: "🚫",
    pill: "💊",
    antibody: "🦠",
    std: "🦠",
  };
  
  ctx.fillText(icons[obstacle.type], 0, 0);
  
  // Label for condom
  if (obstacle.type === "condom") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(-40, -50, 80, 25);
    ctx.fillStyle = "#333";
    ctx.font = "12px 'Comic Sans MS', cursive";
    ctx.fillText("CONDOM", 0, -37);
  }
  
  ctx.restore();
}
