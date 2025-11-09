import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";

const funnyAnnouncements = [
  "Some serious DNA dedication there!",
  "This one's clearly been to the gym!",
  "Talk about strong genes!",
  "That's one determined little swimmer!",
  "Swimming like their life depended on it!",
  "That's what I call Olympic-level swimming!",
  "Pure genetic excellence!",
  "The fastest swimmer in the gene pool!",
  "Future generation champion!",
  "What a legendary performance!",
];

export function FinishScreen() {
  const { racers, resetRace } = useRace();
  const { isMultiplayer, players: multiplayerPlayers, rankings, leaveRoom } = useMultiplayer();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [announcement] = useState(() => 
    funnyAnnouncements[Math.floor(Math.random() * funnyAnnouncements.length)]
  );
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Get players based on mode
  let playersToShow: any[] = [];
  let winner: any;
  let playerPosition = 0;
  
  if (isMultiplayer && rankings.length > 0) {
    // Use rankings from server
    playersToShow = rankings;
    winner = rankings[0];
    const localPlayerId = useMultiplayer.getState().localPlayerId;
    playerPosition = rankings.findIndex((p: any) => p.id === localPlayerId) + 1;
  } else if (isMultiplayer) {
    // Fallback to player list
    playersToShow = Array.from(multiplayerPlayers.values()).sort((a, b) => b.y - a.y);
    winner = playersToShow[0];
    const localPlayerId = useMultiplayer.getState().localPlayerId;
    playerPosition = playersToShow.findIndex((p: any) => p.id === localPlayerId) + 1;
  } else {
    // Single-player mode
    playersToShow = [...racers].sort((a, b) => b.y - a.y);
    winner = playersToShow[0];
    playerPosition = playersToShow.findIndex((r: any) => r.isPlayer) + 1;
  }
  
  const handleRestart = () => {
    if (isMultiplayer) {
      leaveRoom();
    }
    resetRace();
  };
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #E8C4F5 0%, #C4E8F5 100%)",
        fontFamily: "'Comic Sans MS', cursive",
      }}
    >
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={true}
        numberOfPieces={300}
        colors={["#FF6B9D", "#9B59B6", "#F39C12", "#4ECDC4", "#FFE66D", "#32CD32"]}
      />
      
      <div className="text-center px-4 z-10">
        <h1
          className="text-7xl md:text-9xl font-bold mb-8 animate-pulse"
          style={{
            background: "linear-gradient(45deg, #FF6B9D, #9B59B6, #32CD32)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          FERTILIZED!
        </h1>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto mb-8">
          <div className="text-6xl mb-4">
            {isMultiplayer ? "🏁" : (winner.isPlayer ? "🎉" : "😢")}
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{ color: winner.color }}>
            {isMultiplayer ? winner.nickname : winner.name} WINS!
          </h2>
          
          <div className="text-lg mb-4 italic" style={{ color: "#9B59B6" }}>
            "{announcement}"
          </div>
          
          <div className="space-y-3 mb-6">
            {playersToShow.map((player: any, index: number) => {
              const medals = ["🥇", "🥈", "🥉"];
              const isLocalPlayer = isMultiplayer 
                ? player.id === useMultiplayer.getState().localPlayerId 
                : player.isPlayer;
              const displayName = isMultiplayer ? player.nickname : player.name;
              
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl ${isLocalPlayer ? "bg-pink-100" : "bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{medals[index] || `#${index + 1}`}</span>
                      <span className="text-xl font-bold" style={{ color: player.color }}>
                        {displayName}
                      </span>
                    </div>
                    {isLocalPlayer && (
                      <span className="text-sm font-bold" style={{ color: "#FF6B9D" }}>
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {playerPosition === 1 && (
            <div className="text-2xl font-bold mb-4" style={{ color: "#32CD32" }}>
              🏆 Achievement Unlocked: Fertilizer! 🏆
            </div>
          )}
          
          {playerPosition > 1 && (
            <div className="text-lg mb-4" style={{ color: "#9B59B6" }}>
              Better luck next time! You finished #{playerPosition}
            </div>
          )}
        </div>
        
        <button
          onClick={handleRestart}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
        >
          {isMultiplayer ? "🏠 BACK TO LOBBY 🏠" : "🔄 RACE AGAIN 🔄"}
        </button>
      </div>
    </div>
  );
}
