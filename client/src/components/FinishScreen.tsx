import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { toast } from "sonner";

type RaceStats = {
  powerUpsCollected: number;
  obstaclesHit: number;
  mysteryEggsOpened: number;
};

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
  "GOATED swimming right there!",
  "Main character energy!",
  "Built different, no cap!",
  "Absolutely unhinged performance!",
];

const loserAnnouncements = [
  "Maybe next time, champ!",
  "You tried your best... kind of!",
  "Character development incoming!",
  "This wasn't your moment, but your time will come!",
  "The participation trophy is on its way!",
  "Not everyone can be a winner... apparently!",
  "Plot armor failed you today!",
  "The egg chose someone else!",
];

export function FinishScreen() {
  const { racers, resetRace, raceStartTime, playerStats: racePlayerStats } = useRace();
  const { isMultiplayer, players: multiplayerPlayers, rankings, leaveRoom } = useMultiplayer();
  const { recordRaceResult, getCurrentPlayerStats } = useLeaderboard();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [announcement] = useState(() => 
    funnyAnnouncements[Math.floor(Math.random() * funnyAnnouncements.length)]
  );
  const [loserAnnouncement] = useState(() =>
    loserAnnouncements[Math.floor(Math.random() * loserAnnouncements.length)]
  );
  const hasRecordedRef = useRef(false);
  const playerStats = getCurrentPlayerStats();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let playersToShow: any[] = [];
  let winner: any;
  let playerPosition = 0;
  
  if (isMultiplayer && rankings.length > 0) {
    playersToShow = rankings;
    winner = rankings[0];
    const localPlayerId = useMultiplayer.getState().localPlayerId;
    playerPosition = rankings.findIndex((p: any) => p.id === localPlayerId) + 1;
  } else if (isMultiplayer) {
    playersToShow = Array.from(multiplayerPlayers.values()).sort((a, b) => b.y - a.y);
    winner = playersToShow[0];
    const localPlayerId = useMultiplayer.getState().localPlayerId;
    playerPosition = playersToShow.findIndex((p: any) => p.id === localPlayerId) + 1;
  } else {
    playersToShow = [...racers].sort((a, b) => b.y - a.y);
    winner = playersToShow[0];
    playerPosition = playersToShow.findIndex((r: any) => r.isPlayer) + 1;
  }

  useEffect(() => {
    if (hasRecordedRef.current || !playerStats) return;
    hasRecordedRef.current = true;

    const raceTime = raceStartTime ? Date.now() - raceStartTime : 60000;
    
    recordRaceResult({
      nickname: playerStats.nickname,
      position: playerPosition,
      time: raceTime,
      powerUpsCollected: racePlayerStats.powerUpsCollected,
      obstaclesHit: racePlayerStats.obstaclesHit,
      isMultiplayer,
    });
  }, [playerPosition, isMultiplayer, playerStats, recordRaceResult, raceStartTime, racePlayerStats]);
  
  const handleRestart = () => {
    if (isMultiplayer) {
      leaveRoom();
    }
    hasRecordedRef.current = false;
    resetRace();
  };

  const shareResult = async () => {
    const shareText = playerPosition === 1
      ? `🏆 I WON the Sperm Race! 🏊 I fertilized the egg first in Gene Pool Royale! Can you beat me? 🥚💨`
      : `🏊 I finished #${playerPosition} in the Sperm Race! 🧬 Gene Pool Royale is WILD! Can you beat my score? 🥚`;
    
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gene Pool Royale - Sperm Race',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard(shareText + ' ' + shareUrl);
      }
    } else {
      copyToClipboard(shareText + ' ' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard! Share with friends!");
    } catch {
      toast.error("Couldn't copy, but tell your friends about this game!");
    }
  };

  const isWinner = playerPosition === 1;
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: isWinner 
          ? "linear-gradient(135deg, #FFE4EC 0%, #E8D4F5 50%, #D4F5E4 100%)"
          : "linear-gradient(135deg, #E8D4F5 0%, #D4E8F5 100%)",
        fontFamily: "'Comic Sans MS', cursive",
      }}
    >
      {isWinner && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={400}
          colors={["#FF6B9D", "#9B59B6", "#F39C12", "#4ECDC4", "#FFE66D", "#32CD32", "#FF69B4"]}
        />
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {['🏆', '🥚', '🎉', '⭐', '💫', '🌟'][i % 6]}
          </div>
        ))}
      </div>
      
      <div className="text-center px-4 z-10 max-w-2xl mx-auto">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          style={{
            background: isWinner
              ? "linear-gradient(45deg, #32CD32, #FFD700, #FF6B9D)"
              : "linear-gradient(45deg, #FF6B9D, #9B59B6, #3498DB)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          {isWinner ? "FERTILIZED!" : "RACE OVER!"}
        </h1>
        
        <div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border-2"
          style={{
            borderColor: isWinner ? "#32CD32" : "#FF6B9D",
            boxShadow: isWinner 
              ? "0 20px 60px rgba(50,205,50,0.3)"
              : "0 20px 60px rgba(255,107,157,0.2)",
          }}
        >
          <div className="text-6xl mb-4">
            {isWinner ? "🎉🥚🎉" : "🥚"}
          </div>
          
          <h2 
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: winner?.color || "#FF6B9D" }}
          >
            {isMultiplayer ? winner?.nickname : winner?.name} WINS!
          </h2>
          
          <div 
            className="text-base md:text-lg mb-4 italic px-4 py-2 bg-purple-50 rounded-xl"
            style={{ color: "#9B59B6" }}
          >
            "{isWinner ? announcement : loserAnnouncement}"
          </div>

          {playerStats && (
            <div className="flex justify-center gap-4 mb-4 text-sm">
              <div className="bg-pink-50 px-3 py-2 rounded-lg">
                <span className="font-bold text-pink-600">{playerStats.wins}</span>
                <span className="text-gray-500 ml-1">wins</span>
              </div>
              <div className="bg-purple-50 px-3 py-2 rounded-lg">
                <span className="font-bold text-purple-600">{playerStats.races}</span>
                <span className="text-gray-500 ml-1">races</span>
              </div>
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="font-bold text-blue-600">
                  {playerStats.races > 0 ? Math.round((playerStats.wins / playerStats.races) * 100) : 0}%
                </span>
                <span className="text-gray-500 ml-1">win rate</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {playersToShow.slice(0, 6).map((player: any, index: number) => {
              const medals = ["🥇", "🥈", "🥉"];
              const isLocalPlayer = isMultiplayer 
                ? player.id === useMultiplayer.getState().localPlayerId 
                : player.isPlayer;
              const displayName = isMultiplayer ? player.nickname : player.name;
              
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl transition-all ${
                    isLocalPlayer 
                      ? "bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 scale-105" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medals[index] || `#${index + 1}`}</span>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span 
                        className="font-bold text-gray-800"
                      >
                        {displayName}
                      </span>
                    </div>
                    {isLocalPlayer && (
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-full bg-pink-500 text-white"
                      >
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {isWinner && (
            <div 
              className="text-xl font-bold mb-4 p-3 bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl border-2 border-yellow-300"
              style={{ color: "#32CD32" }}
            >
              🏆 Achievement Unlocked: Fertilizer! 🏆
            </div>
          )}
          
          {!isWinner && (
            <div 
              className="text-lg mb-4 p-2 bg-purple-50 rounded-lg"
              style={{ color: "#9B59B6" }}
            >
              You finished #{playerPosition} - Try again!
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl hover:scale-105 transition-all"
            style={{
              boxShadow: "0 10px 30px rgba(255,107,157,0.4)",
            }}
          >
            {isMultiplayer ? "🏠 Back to Lobby" : "🔄 Race Again"}
          </button>
          
          <button
            onClick={shareResult}
            className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl hover:scale-105 transition-all"
            style={{
              boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
            }}
          >
            📤 Share Result
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
