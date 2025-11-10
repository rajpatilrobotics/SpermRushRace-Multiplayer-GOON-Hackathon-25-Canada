import { useEffect, useRef, useState } from "react";
import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import type { Racer, PowerUp, Obstacle, MysteryEgg, Particle } from "@/lib/stores/useRace";

const IMAGE_CACHE: Record<string, HTMLImageElement> = {};

function loadImage(src: string): Promise<HTMLImageElement> {
  if (IMAGE_CACHE[src]) {
    return Promise.resolve(IMAGE_CACHE[src]);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      IMAGE_CACHE[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const {
    phase,
    racers,
    powerUps,
    obstacles,
    mysteryEggs,
    particles,
    hazards,
    bossSperm,
    trackHeight,
    cameraY,
    droppedCondoms,
    screenShake,
    slowMotion,
    currentRandomEvent,
    updateRacer,
    updateCamera,
    updateTimers,
    checkCollisions,
    checkSlipstreams,
    dropCondom,
    finishRace,
    updateSmartObstacles,
    updateHazards,
    updateBossSperm,
    checkRandomEvent,
    spawnTrailParticles,
    updateParticles,
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
    const images = [
      '/images/lube.png',
      '/images/viagra.png',
      '/images/mutation.png',
      '/images/std.png',
      '/images/birth-control.png',
      '/images/condom.png',
      '/images/antibody.png',
      '/images/mystery-egg.png',
      '/images/mystery-egg-cracking.png',
      '/images/mystery-egg-opened.png',
    ];
    
    Promise.all(images.map(loadImage)).then(() => {
      setImagesLoaded(true);
    }).catch(err => {
      console.error('Failed to load images:', err);
      setImagesLoaded(true);
    });
  }, []);
  
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
          
          // Minimum auto-forward velocity scaled with speed multiplier
          const minForwardVelocity = speed * 0.4; // 40% of current speed, respects slowdowns
          
          let newVelX = 0;
          let newVelY = minForwardVelocity; // Always moving forward by default
          
          if (keys.w || keys.ArrowUp) newVelY = speed;
          if (keys.s || keys.ArrowDown) newVelY = -speed * 0.3; // Allow slight backward movement
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
        
        // Update smart obstacles
        state.updateSmartObstacles();
        
        // Update hazards (turbulence, acid pools, boost pads, etc.)
        state.updateHazards(delta);
        
        // Update boss sperm
        state.updateBossSperm();
        
        // Check for random events every 10 seconds
        state.checkRandomEvent();
        
        // Spawn trail particles for all racers
        racers.forEach((racer) => {
          if (racer.y > 0) {
            state.spawnTrailParticles(racer);
          }
        });
        
        // Update particles
        state.updateParticles(delta);
      }
      
      // Sync camera back to store (after all updates, for all phases)
      state.updateCamera(currentCameraY);
      
      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply screen shake
      ctx.save();
      const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
      ctx.translate(shakeX, shakeY);
      
      // Biological background - vaginal/reproductive tract environment
      // Main flesh-toned gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#FFB5D8"); // Light pink at top
      bgGradient.addColorStop(0.5, "#FFA0C0"); // Medium pink-flesh
      bgGradient.addColorStop(1, "#FF9CB8"); // Deeper pink at bottom
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add pulsing organic texture
      const pulse = Math.sin(Date.now() / 1000) * 0.05 + 0.95;
      
      // Draw organic tissue texture/patterns
      ctx.save();
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 5; i++) {
        const y = (currentCameraY % 400) + (i * 200) - 200;
        const screenY = canvas.height - (y - currentCameraY);
        
        // Organic flowing curves (like muscle tissue)
        ctx.strokeStyle = "#FF6B9D";
        ctx.lineWidth = 40 * pulse;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const wave = Math.sin(x * 0.01 + i) * 30;
          ctx.lineTo(x, screenY + wave);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
      
      // Add subtle blood vessel patterns
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#FF4080";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const startY = (currentCameraY % 600) + (i * 300) - 300;
        const screenY = canvas.height - (startY - currentCameraY);
        
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.1, screenY);
        ctx.quadraticCurveTo(
          canvas.width * 0.3, screenY + 80,
          canvas.width * 0.5, screenY + 40
        );
        ctx.quadraticCurveTo(
          canvas.width * 0.7, screenY,
          canvas.width * 0.9, screenY + 60
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
      
      // Scrolling lane markers (like muscle tissue ridges)
      ctx.save();
      ctx.strokeStyle = "#FF85B0";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < trackHeight; i += 100) {
        const screenY = canvas.height - (i - currentCameraY);
        if (screenY > -50 && screenY < canvas.height + 50) {
          // Horizontal tissue ridges
          ctx.beginPath();
          ctx.setLineDash([15, 10]);
          ctx.moveTo(0, screenY);
          ctx.lineTo(canvas.width, screenY);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1.0;
      ctx.restore();
      
      // Distance markers with biological feel
      ctx.save();
      ctx.fillStyle = "#FFF";
      ctx.strokeStyle = "#C2185B";
      ctx.lineWidth = 3;
      ctx.font = "bold 18px 'Comic Sans MS', cursive";
      for (let i = 0; i < trackHeight; i += 200) {
        const screenY = canvas.height - (i - currentCameraY);
        if (screenY > 0 && screenY < canvas.height) {
          const distText = `${i}m`;
          ctx.strokeText(distText, canvas.width - 60, screenY);
          ctx.fillText(distText, canvas.width - 60, screenY);
        }
      }
      ctx.restore();
      
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
      
      // Render mystery eggs
      mysteryEggs.forEach((egg) => {
        if (!egg.active) return;
        const screenY = canvas.height - (egg.y - currentCameraY);
        if (screenY < -50 || screenY > canvas.height + 50) return;
        
        drawMysteryEgg(ctx, egg, egg.x, screenY);
      });
      
      // Render particles
      particles.forEach((particle) => {
        const screenY = canvas.height - (particle.y - currentCameraY);
        drawParticle(ctx, particle, particle.x, screenY);
      });
      
      // Render hazards
      state.hazards.forEach((hazard) => {
        const screenY = canvas.height - (hazard.y - currentCameraY);
        if (screenY > -200 && screenY < canvas.height + 200) {
          drawHazard(ctx, hazard, hazard.x, screenY);
        }
      });
      
      // Render boss sperm
      if (state.bossSperm && state.bossSperm.active) {
        const screenY = canvas.height - (state.bossSperm.y - currentCameraY);
        if (screenY > -200 && screenY < canvas.height + 200) {
          drawBossSperm(ctx, state.bossSperm, state.bossSperm.x, screenY);
        }
      }
      
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
      
      // Restore context after screen shake
      ctx.restore();
      
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
  
  const scale = 1.3;
  
  // Tail (wavy, flowing behind) - drawn first so head overlaps it
  const tailLength = 78 * scale;
  const tailSegments = 24;
  
  for (let i = 0; i < tailSegments; i++) {
    const progress = i / tailSegments;
    const yPos = progress * tailLength;
    const nextProgress = (i + 1) / tailSegments;
    const nextYPos = nextProgress * tailLength;
    
    // Enhanced wavy motion
    const waveX = Math.sin(racer.tailPhase + progress * Math.PI * 2) * 8 * scale * (1 - progress);
    const nextWaveX = Math.sin(racer.tailPhase + nextProgress * Math.PI * 2) * 8 * scale * (1 - nextProgress);
    
    // Tapering width
    const width = 4 * scale * (1 - progress * 0.75);
    
    // Enhanced gradient for tail
    const gradient = ctx.createLinearGradient(0, yPos, 0, nextYPos);
    gradient.addColorStop(0, racer.color);
    gradient.addColorStop(0.5, racer.color + "CC");
    gradient.addColorStop(1, racer.color + "99");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(waveX, yPos);
    ctx.lineTo(nextWaveX, nextYPos);
    ctx.stroke();
  }
  
  // Head - larger teardrop/tadpole shape pointing upward
  ctx.fillStyle = racer.color;
  ctx.beginPath();
  
  // Create larger teardrop shape (30% bigger)
  ctx.moveTo(0, -23 * scale); // Pointed tip at top
  ctx.quadraticCurveTo(10 * scale, -13 * scale, 13 * scale, 0); // Right curve
  ctx.quadraticCurveTo(10 * scale, 10 * scale, 0, 13 * scale); // Bottom right
  ctx.quadraticCurveTo(-10 * scale, 10 * scale, -13 * scale, 0); // Bottom left
  ctx.quadraticCurveTo(-10 * scale, -13 * scale, 0, -23 * scale); // Left curve back to top
  ctx.closePath();
  ctx.fill();
  
  // Add enhanced gradient overlay for depth
  const headGradient = ctx.createRadialGradient(-4 * scale, -10 * scale, 0, 0, 0, 20 * scale);
  headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  headGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
  headGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = headGradient;
  ctx.fill();
  
  // Add eyes for personality
  const eyeY = -8 * scale;
  const eyeSpacing = 5 * scale;
  const eyeSize = 3.5 * scale;
  
  // Left eye
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye
  ctx.beginPath();
  ctx.arc(eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils (slightly offset to give determined look)
  const pupilSize = 1.8 * scale;
  const pupilOffsetX = 0.5 * scale;
  const pupilOffsetY = -0.3 * scale;
  
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(-eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine/sparkle for extra life
  ctx.fillStyle = "#FFFFFF";
  const shineSize = 0.8 * scale;
  ctx.beginPath();
  ctx.arc(-eyeSpacing - 0.8 * scale, eyeY - 0.8 * scale, shineSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(eyeSpacing - 0.8 * scale, eyeY - 0.8 * scale, shineSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Determined mouth/smile
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 4 * scale, 0.2, Math.PI - 0.2);
  ctx.stroke();
  
  // Inner glow effect
  ctx.strokeStyle = racer.color + "AA";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, -23 * scale);
  ctx.quadraticCurveTo(10 * scale, -13 * scale, 13 * scale, 0);
  ctx.quadraticCurveTo(10 * scale, 10 * scale, 0, 13 * scale);
  ctx.quadraticCurveTo(-10 * scale, 10 * scale, -13 * scale, 0);
  ctx.quadraticCurveTo(-10 * scale, -13 * scale, 0, -23 * scale);
  ctx.closePath();
  ctx.stroke();
  
  // Mid glow effect around head
  ctx.strokeStyle = racer.color + "66";
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Outer glow
  ctx.strokeStyle = racer.color + "33";
  ctx.lineWidth = 9 * scale;
  ctx.stroke();
  
  ctx.restore();
}

function drawMultiplayerSperm(ctx: CanvasRenderingContext2D, player: any, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  const scale = 1.3;
  
  // Tail (wavy, flowing behind) - drawn first so head overlaps it
  const tailLength = 78 * scale;
  const tailSegments = 24;
  
  for (let i = 0; i < tailSegments; i++) {
    const progress = i / tailSegments;
    const yPos = progress * tailLength;
    const nextProgress = (i + 1) / tailSegments;
    const nextYPos = nextProgress * tailLength;
    
    // Enhanced wavy motion
    const waveX = Math.sin(player.tailPhase + progress * Math.PI * 2) * 8 * scale * (1 - progress);
    const nextWaveX = Math.sin(player.tailPhase + nextProgress * Math.PI * 2) * 8 * scale * (1 - nextProgress);
    
    // Tapering width
    const width = 4 * scale * (1 - progress * 0.75);
    
    // Enhanced gradient for tail
    const gradient = ctx.createLinearGradient(0, yPos, 0, nextYPos);
    gradient.addColorStop(0, player.color);
    gradient.addColorStop(0.5, player.color + "CC");
    gradient.addColorStop(1, player.color + "99");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(waveX, yPos);
    ctx.lineTo(nextWaveX, nextYPos);
    ctx.stroke();
  }
  
  // Head - larger teardrop/tadpole shape pointing upward
  ctx.fillStyle = player.color;
  ctx.beginPath();
  
  // Create larger teardrop shape (30% bigger)
  ctx.moveTo(0, -23 * scale); // Pointed tip at top
  ctx.quadraticCurveTo(10 * scale, -13 * scale, 13 * scale, 0); // Right curve
  ctx.quadraticCurveTo(10 * scale, 10 * scale, 0, 13 * scale); // Bottom right
  ctx.quadraticCurveTo(-10 * scale, 10 * scale, -13 * scale, 0); // Bottom left
  ctx.quadraticCurveTo(-10 * scale, -13 * scale, 0, -23 * scale); // Left curve back to top
  ctx.closePath();
  ctx.fill();
  
  // Add enhanced gradient overlay for depth
  const headGradient = ctx.createRadialGradient(-4 * scale, -10 * scale, 0, 0, 0, 20 * scale);
  headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  headGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
  headGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = headGradient;
  ctx.fill();
  
  // Add eyes for personality
  const eyeY = -8 * scale;
  const eyeSpacing = 5 * scale;
  const eyeSize = 3.5 * scale;
  
  // Left eye
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye
  ctx.beginPath();
  ctx.arc(eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils (slightly offset to give determined look)
  const pupilSize = 1.8 * scale;
  const pupilOffsetX = 0.5 * scale;
  const pupilOffsetY = -0.3 * scale;
  
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(-eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine/sparkle for extra life
  ctx.fillStyle = "#FFFFFF";
  const shineSize = 0.8 * scale;
  ctx.beginPath();
  ctx.arc(-eyeSpacing - 0.8 * scale, eyeY - 0.8 * scale, shineSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(eyeSpacing - 0.8 * scale, eyeY - 0.8 * scale, shineSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Determined mouth/smile
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 4 * scale, 0.2, Math.PI - 0.2);
  ctx.stroke();
  
  // Inner glow effect
  ctx.strokeStyle = player.color + "AA";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, -23 * scale);
  ctx.quadraticCurveTo(10 * scale, -13 * scale, 13 * scale, 0);
  ctx.quadraticCurveTo(10 * scale, 10 * scale, 0, 13 * scale);
  ctx.quadraticCurveTo(-10 * scale, 10 * scale, -13 * scale, 0);
  ctx.quadraticCurveTo(-10 * scale, -13 * scale, 0, -23 * scale);
  ctx.closePath();
  ctx.stroke();
  
  // Mid glow effect around head
  ctx.strokeStyle = player.color + "66";
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Outer glow
  ctx.strokeStyle = player.color + "33";
  ctx.lineWidth = 9 * scale;
  ctx.stroke();
  
  // Player nickname label
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.strokeText(player.nickname, 0, -40 * scale);
  ctx.fillText(player.nickname, 0, -40 * scale);
  
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Enhanced glow with pulsing effect
  const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 * pulse);
  glowGradient.addColorStop(0, "#FFE66DAA");
  glowGradient.addColorStop(0.5, "#FFE66D44");
  glowGradient.addColorStop(1, "#FFE66D00");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(-50, -50, 100, 100);
  
  const imageMap = {
    lube: '/images/lube.png',
    mutation: '/images/mutation.png',
    viagra: '/images/viagra.png',
  };
  
  const labelMap = {
    lube: 'LUBE BOOST',
    mutation: 'MUTATION',
    viagra: 'VIAGRA',
  };
  
  const imageSrc = imageMap[powerUp.type];
  const img = IMAGE_CACHE[imageSrc];
  
  if (img) {
    const size = 100;
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  }
  
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 11px 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.strokeText(labelMap[powerUp.type], 0, 58);
  ctx.fillText(labelMap[powerUp.type], 0, 58);
  
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  const imageMap = {
    condom: '/images/condom.png',
    pill: '/images/birth-control.png',
    antibody: '/images/antibody.png',
    std: '/images/std.png',
  };
  
  const labelMap = {
    condom: 'CONDOM',
    pill: 'BIRTH CONTROL',
    antibody: 'ANTIBODY',
    std: 'STD',
  };
  
  const imageSrc = imageMap[obstacle.type];
  const img = IMAGE_CACHE[imageSrc];
  
  let scale = 1.0;
  let rotation = 0;
  let shake = { x: 0, y: 0 };
  
  if (obstacle.isChasing) {
    if (obstacle.type === 'condom') {
      // Pulsing inflation effect - grows from 100% to 150%
      const inflationPulse = Math.sin(Date.now() / 400) * 0.25 + 1.25;
      scale = inflationPulse;
      
      // Add particle puff effects around inflating condom
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
        const radius = 60 * scale;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        const puffSize = 8 + Math.sin(Date.now() / 300 + i) * 4;
        ctx.beginPath();
        ctx.arc(px, py, puffSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    } else if (obstacle.type === 'pill') {
      // Pill shake/rattle effect
      shake.x = Math.sin(Date.now() / 50) * 8;
      shake.y = Math.cos(Date.now() / 70) * 6;
      scale = 1.0 + Math.sin(Date.now() / 200) * 0.2;
      
      // Add shaking particle trail
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#FF69B4";
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Date.now() / 300;
        const radius = 50;
        const px = Math.cos(angle) * radius + shake.x;
        const py = Math.sin(angle) * radius + shake.y;
        const size = 6 + Math.sin(Date.now() / 200 + i) * 3;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    } else if (obstacle.type === 'std') {
      // STD menacing glow and pulse
      scale = 1.0 + Math.sin(Date.now() / 300) * 0.35;
      
      // Menacing red glow
      ctx.save();
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80 * scale);
      glowGradient.addColorStop(0, "#FF0000AA");
      glowGradient.addColorStop(0.5, "#FF000066");
      glowGradient.addColorStop(1, "#FF000000");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 80 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Add pulsing danger rings
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const ringPulse = (Date.now() / 400 + i * 0.33) % 1;
        const radius = 40 + ringPulse * 40;
        ctx.globalAlpha = 0.5 - ringPulse * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    } else if (obstacle.type === 'antibody') {
      // Antibody spin and expand effect
      rotation = (Date.now() / 500) % (Math.PI * 2);
      scale = 1.0 + Math.sin(Date.now() / 250) * 0.3;
      
      // Add spinning particles
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#00FF00";
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + rotation * 2;
        const radius = 55 * scale;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        const particleSize = 5 + Math.sin(Date.now() / 200 + i) * 2;
        ctx.beginPath();
        ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }
  
  // Apply shake and rotation
  ctx.translate(shake.x, shake.y);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  
  if (img) {
    const baseSize = 100;
    const size = baseSize * scale;
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  }
  
  if (obstacle.isChasing) {
    // Enhanced warning for chasing obstacles
    ctx.save();
    const warningPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.globalAlpha = warningPulse;
    
    // Warning icon
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⚠️", 0, -60 * scale);
    
    // Unique danger text for each type
    const dangerTextMap = {
      condom: 'INFLATING!',
      pill: 'RATTLING!',
      std: 'INFECTIOUS!',
      antibody: 'SPINNING!',
    };
    
    if (dangerTextMap[obstacle.type]) {
      ctx.fillStyle = "#FFFF00";
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 2;
      ctx.font = "bold 12px Arial";
      ctx.strokeText(dangerTextMap[obstacle.type], 0, -80 * scale);
      ctx.fillText(dangerTextMap[obstacle.type], 0, -80 * scale);
    }
    
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }
  
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.font = "bold 10px 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.strokeText(labelMap[obstacle.type], 0, 58 * scale);
  ctx.fillText(labelMap[obstacle.type], 0, 58 * scale);
  
  ctx.restore();
}

function drawMysteryEgg(ctx: CanvasRenderingContext2D, egg: MysteryEgg, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.85;
  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 * pulse);
  glowGradient.addColorStop(0, "#FFD700AA");
  glowGradient.addColorStop(0.5, "#FFD70044");
  glowGradient.addColorStop(1, "#FFD70000");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(-50, -50, 100, 100);
  
  // Determine which image to show based on opening state
  let imageSrc = '/images/mystery-egg.png';
  if (egg.isOpening && egg.openingStartTime) {
    const elapsed = Date.now() - egg.openingStartTime;
    const progress = Math.min(elapsed / 800, 1);
    
    if (progress < 0.5) {
      imageSrc = '/images/mystery-egg-cracking.png';
    } else {
      imageSrc = '/images/mystery-egg-opened.png';
    }
  }
  
  const img = IMAGE_CACHE[imageSrc];
  if (img) {
    const size = 75;
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  }
  
  // Only show MYSTERY! label if not opening
  if (!egg.isOpening) {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 11px 'Comic Sans MS', cursive";
    ctx.textAlign = "center";
    ctx.strokeText("MYSTERY!", 0, 40);
    ctx.fillText("MYSTERY!", 0, 40);
  }
  
  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, x: number, y: number) {
  ctx.save();
  
  const alpha = particle.life / particle.maxLife;
  ctx.globalAlpha = alpha;
  
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(x, y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawHazard(ctx: CanvasRenderingContext2D, hazard: any, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  if (hazard.kind === 'turbulence') {
    // Swirling turbulence zone
    const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hazard.radius * pulse);
    gradient.addColorStop(0, "#00FFFF44");
    gradient.addColorStop(0.5, "#00FFFF22");
    gradient.addColorStop(1, "#00FFFF00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Swirling lines
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const rotation = (Date.now() / 500 + i * Math.PI / 3) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(0, 0, hazard.radius * 0.7, rotation, rotation + Math.PI / 2);
      ctx.stroke();
    }
  } else if (hazard.kind === 'acid') {
    // Bubbling acid pool
    const pulse = Math.sin(Date.now() / 400) * 0.15 + 0.85;
    ctx.fillStyle = "#00FF0044";
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Bubbles
    ctx.fillStyle = "#00FF0066";
    for (let i = 0; i < 5; i++) {
      const bubbleTime = (Date.now() / 600 + i) % 1;
      const bubbleSize = bubbleTime * 15;
      const angle = (i / 5) * Math.PI * 2;
      const bubbleX = Math.cos(angle) * hazard.radius * 0.5;
      const bubbleY = Math.sin(angle) * hazard.radius * 0.5;
      ctx.globalAlpha = 1 - bubbleTime;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (hazard.kind === 'boost') {
    // Speed boost pad
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hazard.radius);
    gradient.addColorStop(0, "#FFD700FF");
    gradient.addColorStop(0.6, "#FFD70066");
    gradient.addColorStop(1, "#FFD70000");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Arrows
    ctx.fillStyle = "#FFD700";
    ctx.globalAlpha = pulse;
    for (let i = 0; i < 3; i++) {
      const yOffset = i * 20 - 20 + (Date.now() / 100 % 40);
      ctx.beginPath();
      ctx.moveTo(0, yOffset - 10);
      ctx.lineTo(-15, yOffset);
      ctx.lineTo(0, yOffset + 10);
      ctx.lineTo(15, yOffset);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (hazard.kind === 'spinner') {
    // Rotating obstacle
    ctx.save();
    ctx.rotate(hazard.rotation || 0);
    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-hazard.radius, 0);
    ctx.lineTo(hazard.radius, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -hazard.radius);
    ctx.lineTo(0, hazard.radius);
    ctx.stroke();
    ctx.restore();
    
    // Center
    ctx.fillStyle = "#FF00FF";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  } else if (hazard.kind === 'whitebloodcell') {
    // White blood cell patrol
    const pulse = Math.sin(Date.now() / 400) * 0.2 + 1.0;
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Nucleus
    ctx.fillStyle = "#CCCCFF";
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Warning
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⚠️", 0, -hazard.radius - 10);
  }
  
  ctx.restore();
}

function drawBossSperm(ctx: CanvasRenderingContext2D, boss: any, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Giant menacing sperm
  const pulse = Math.sin(Date.now() / 300) * 0.2 + 1.2;
  
  // Menacing glow
  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100 * pulse);
  glowGradient.addColorStop(0, "#FF000088");
  glowGradient.addColorStop(0.5, "#FF000044");
  glowGradient.addColorStop(1, "#FF000000");
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 100 * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Head (larger than normal)
  ctx.fillStyle = "#8B0000";
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35 * pulse, 50 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Angry eyes
  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.arc(-12, -10, 8, 0, Math.PI * 2);
  ctx.arc(12, -10, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(-12, -10, 4, 0, Math.PI * 2);
  ctx.arc(12, -10, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Menacing tail
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  for (let i = 0; i < 5; i++) {
    const waveX = Math.sin(i * 0.5 + Date.now() / 150) * 20;
    ctx.lineTo(waveX, 50 + i * 30);
  }
  ctx.stroke();
  
  // Label
  ctx.fillStyle = "#FF0000";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.strokeText("BOSS!", 0, -70);
  ctx.fillText("BOSS!", 0, -70);
  
  ctx.restore();
}
