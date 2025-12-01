import { useRace } from "./lib/stores/useRace";
import { useMultiplayer } from "./lib/stores/useMultiplayer";
import { GameCanvas } from "./components/GameCanvas";
import { VoiceBoost } from "./components/VoiceBoost";
import { RaceCommentary } from "./components/RaceCommentary";
import { Leaderboard } from "./components/Leaderboard";
import { GameUI } from "./components/GameUI";
import CollisionNotifications from "./components/CollisionNotifications";
import { StartScreen } from "./components/StartScreen";
import { FinishScreen } from "./components/FinishScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { MobileControls } from "./components/MobileControls";
import { MysteryRewardPopup } from "./components/MysteryRewardPopup";
import { Toaster } from "sonner";

function App() {
  const { phase, updateRacer, racers } = useRace();
  const { isMultiplayer, isConnected, gameStarted } = useMultiplayer();
  
  const showLobby = isMultiplayer && !gameStarted;

  const mobileInputRef = { current: { x: 0, y: 0 } };
  
  const handleMobileMove = (direction: { x: number; y: number }) => {
    mobileInputRef.current = direction;
    
    if (typeof window !== 'undefined') {
      (window as any).__mobileInput = direction;
    }
  };

  const handleMobileBoost = () => {
    const player = racers.find(r => r.isPlayer);
    if (!player || phase !== "racing") return;
    
    if (player.speedMultiplier <= 1 && player.powerUpTimer <= 0) {
      updateRacer(player.id, {
        speedMultiplier: 1.3,
        powerUpTimer: 1500,
        activePowerUpType: 'mobile_boost',
      });
    }
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid #FF6B9D',
          },
        }}
      />
      
      {showLobby && <LobbyScreen />}
      
      {!showLobby && phase === "ready" && <StartScreen />}
      
      {phase === "racing" && (
        <>
          <GameCanvas />
          <Leaderboard />
          <VoiceBoost />
          <GameUI />
          <CollisionNotifications />
          <RaceCommentary />
          <MobileControls onMove={handleMobileMove} onBoost={handleMobileBoost} />
          <MysteryRewardPopup />
        </>
      )}
      
      {phase === "finished" && <FinishScreen />}
    </div>
  );
}

export default App;
