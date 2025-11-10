import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";

export function Leaderboard() {
  const { racers, trackHeight } = useRace();
  const { isMultiplayer, players: multiplayerPlayers } = useMultiplayer();
  
  // Get players based on mode
  let playersToShow: any[] = [];
  
  if (isMultiplayer) {
    // Convert multiplayer players Map to array and sort by progress
    playersToShow = Array.from(multiplayerPlayers.values())
      .sort((a, b) => b.y - a.y);
  } else {
    // Sort single-player racers by progress
    playersToShow = [...racers].sort((a, b) => b.y - a.y);
  }
  
  return (
    <div
      className="fixed top-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-3 w-56"
      style={{ fontFamily: "'Comic Sans MS', cursive" }}
    >
      <h2 className="text-sm font-bold text-center mb-2" style={{ color: "#FF6B9D" }}>
        {isMultiplayer ? "🏁 Live Leaderboard" : "🏁 Leaderboard"}
      </h2>
      
      <div className="space-y-2">
        {playersToShow.map((player, index) => {
          const progress = (player.y / trackHeight) * 100;
          const medals = ["🥇", "🥈", "🥉"];
          const displayName = isMultiplayer ? player.nickname : player.name;
          
          return (
            <div key={player.id} className="bg-gray-50 bg-opacity-80 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{medals[index] || `#${index + 1}`}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: player.color }}>
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {progress.toFixed(0)}% {player.finished && "✅"}
                    </div>
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, progress)}%`,
                    background: `linear-gradient(90deg, ${player.color}, ${player.color}dd)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
