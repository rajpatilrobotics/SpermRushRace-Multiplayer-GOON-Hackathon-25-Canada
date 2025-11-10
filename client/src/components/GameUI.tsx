import { useRace } from "@/lib/stores/useRace";

export function GameUI() {
  const { activeEffect, racers } = useRace();
  
  const player = racers.find((r) => r.isPlayer);
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Active Effect Notification - Top Left */}
      {activeEffect && activeEffect.timer > 0 && (
        <div className="fixed top-4 left-4 pointer-events-none z-50">
          <div
            className="bg-white bg-opacity-95 rounded-xl shadow-xl p-4 border-2 border-pink-400"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            <div className="text-lg font-bold" style={{ color: "#FF6B9D" }}>
              {activeEffect.message}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {(activeEffect.timer / 1000).toFixed(1)}s remaining
            </div>
          </div>
        </div>
      )}
      
      {/* Speed indicator */}
      {player && player.speedMultiplier !== 1 && (
        <div className="fixed top-20 left-4">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg bg-opacity-90"
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
