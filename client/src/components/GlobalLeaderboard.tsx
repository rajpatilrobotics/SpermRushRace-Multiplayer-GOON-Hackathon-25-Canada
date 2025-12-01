import { useState } from "react";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface GlobalLeaderboardProps {
  onClose: () => void;
}

export function GlobalLeaderboard({ onClose }: GlobalLeaderboardProps) {
  const [tab, setTab] = useState<'wins' | 'times' | 'stats'>('wins');
  const { getTopPlayers, getFastestTimes, getCurrentPlayerStats } = useLeaderboard();
  
  const topPlayers = getTopPlayers(10);
  const fastestTimes = getFastestTimes(10);
  const myStats = getCurrentPlayerStats();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 p-6 bg-gradient-to-b from-pink-50 to-purple-50 border-2 border-pink-300 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            🏆 Leaderboard
          </h2>
          <Button variant="ghost" onClick={onClose} className="text-2xl p-2">
            ✕
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === 'wins' ? 'default' : 'outline'}
            onClick={() => setTab('wins')}
            className={tab === 'wins' ? 'bg-pink-500 hover:bg-pink-600' : ''}
            size="sm"
          >
            🥇 Top Winners
          </Button>
          <Button
            variant={tab === 'times' ? 'default' : 'outline'}
            onClick={() => setTab('times')}
            className={tab === 'times' ? 'bg-purple-500 hover:bg-purple-600' : ''}
            size="sm"
          >
            ⚡ Fastest Times
          </Button>
          <Button
            variant={tab === 'stats' ? 'default' : 'outline'}
            onClick={() => setTab('stats')}
            className={tab === 'stats' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            size="sm"
          >
            📊 My Stats
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'wins' && (
            <div className="space-y-2">
              {topPlayers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No races yet! Be the first to play!</p>
              ) : (
                topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/70 border border-pink-200"
                  >
                    <div className="text-2xl w-8 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{player.nickname}</p>
                      <p className="text-xs text-gray-500">{player.races} races played</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pink-600">{player.wins} wins</p>
                      <p className="text-xs text-gray-500">
                        {player.races > 0 ? Math.round((player.wins / player.races) * 100) : 0}% win rate
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'times' && (
            <div className="space-y-2">
              {fastestTimes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No winning times recorded yet!</p>
              ) : (
                fastestTimes.map((race, index) => (
                  <div
                    key={race.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/70 border border-purple-200"
                  >
                    <div className="text-2xl w-8 text-center">
                      {index === 0 ? '⚡' : index === 1 ? '💨' : index === 2 ? '🔥' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{race.nickname}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(race.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{formatTime(race.time)}</p>
                      <p className="text-xs text-gray-500">
                        {race.isMultiplayer ? '👥 Multiplayer' : '🎮 Solo'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-4">
              {!myStats ? (
                <p className="text-center text-gray-500 py-8">Play a race to see your stats!</p>
              ) : (
                <>
                  <div className="text-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{myStats.nickname}</h3>
                    <p className="text-sm text-gray-600">Your Racing Profile</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/70 rounded-lg border border-pink-200 text-center">
                      <p className="text-3xl font-bold text-pink-600">{myStats.wins}</p>
                      <p className="text-xs text-gray-600">Victories</p>
                    </div>
                    <div className="p-4 bg-white/70 rounded-lg border border-purple-200 text-center">
                      <p className="text-3xl font-bold text-purple-600">{myStats.races}</p>
                      <p className="text-xs text-gray-600">Total Races</p>
                    </div>
                    <div className="p-4 bg-white/70 rounded-lg border border-blue-200 text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {myStats.races > 0 ? Math.round((myStats.wins / myStats.races) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Win Rate</p>
                    </div>
                    <div className="p-4 bg-white/70 rounded-lg border border-green-200 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {myStats.fastestTime ? formatTime(myStats.fastestTime) : '--:--'}
                      </p>
                      <p className="text-xs text-gray-600">Best Time</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-gray-600">💧 Power-ups Collected</span>
                      <span className="font-bold">{myStats.powerUpsCollected}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-gray-600">💥 Obstacles Hit</span>
                      <span className="font-bold">{myStats.obstaclesHit}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-gray-600">🥚 Mystery Eggs Opened</span>
                      <span className="font-bold">{myStats.mysteryEggsOpened}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
