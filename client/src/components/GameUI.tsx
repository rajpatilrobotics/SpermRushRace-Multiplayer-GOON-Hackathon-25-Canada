import { useRace } from "@/lib/stores/useRace";

export function GameUI() {
  const { activeEffects, racers } = useRace();
  
  const player = racers.find((r) => r.isPlayer);
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Active Effect Notifications - Top Left, Stacked */}
      <div className="fixed top-4 left-4 pointer-events-none z-50 space-y-2">
        {activeEffects.map((effect, index) => (
          <div
            key={effect.id}
            className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-pink-300"
            style={{ 
              fontFamily: "'Comic Sans MS', cursive",
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className="text-sm font-bold" style={{ color: "#FF6B9D" }}>
              {effect.message}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {(effect.timer / 1000).toFixed(1)}s
            </div>
          </div>
        ))}
      </div>
      
      {/* Speed indicator */}
      {player && player.speedMultiplier !== 1 && (
        <div className="fixed bottom-4 left-4">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-70 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            <div className="text-sm font-bold">
              Speed: {(player.speedMultiplier * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
