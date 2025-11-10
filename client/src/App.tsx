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

function App() {
  const { phase } = useRace();
  const { isMultiplayer, isConnected, gameStarted } = useMultiplayer();
  
  // Show lobby if multiplayer mode and game hasn't started yet
  const showLobby = isMultiplayer && !gameStarted;
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
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
        </>
      )}
      
      {phase === "finished" && <FinishScreen />}
    </div>
  );
}

export default App;
