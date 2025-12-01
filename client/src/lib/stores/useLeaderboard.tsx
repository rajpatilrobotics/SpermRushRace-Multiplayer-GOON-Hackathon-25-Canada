import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlayerStats {
  id: string;
  nickname: string;
  wins: number;
  races: number;
  fastestTime: number | null;
  powerUpsCollected: number;
  obstaclesHit: number;
  mysteryEggsOpened: number;
  lastPlayed: number;
}

export interface RaceResult {
  id: string;
  timestamp: number;
  nickname: string;
  position: number;
  time: number;
  powerUpsCollected: number;
  obstaclesHit: number;
  isMultiplayer: boolean;
}

interface LeaderboardState {
  playerStats: Record<string, PlayerStats>;
  recentRaces: RaceResult[];
  currentPlayerId: string | null;
  
  initPlayer: (nickname: string) => string;
  recordRaceResult: (result: Omit<RaceResult, 'id' | 'timestamp'>) => void;
  getTopPlayers: (limit?: number) => PlayerStats[];
  getFastestTimes: (limit?: number) => RaceResult[];
  getPlayerStats: (playerId: string) => PlayerStats | null;
  getCurrentPlayerStats: () => PlayerStats | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const useLeaderboard = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      playerStats: {},
      recentRaces: [],
      currentPlayerId: null,

      initPlayer: (nickname: string) => {
        const existingPlayer = Object.values(get().playerStats).find(
          p => p.nickname.toLowerCase() === nickname.toLowerCase()
        );
        
        if (existingPlayer) {
          set({ currentPlayerId: existingPlayer.id });
          return existingPlayer.id;
        }

        const playerId = generateId();
        const newPlayer: PlayerStats = {
          id: playerId,
          nickname,
          wins: 0,
          races: 0,
          fastestTime: null,
          powerUpsCollected: 0,
          obstaclesHit: 0,
          mysteryEggsOpened: 0,
          lastPlayed: Date.now(),
        };

        set(state => ({
          playerStats: { ...state.playerStats, [playerId]: newPlayer },
          currentPlayerId: playerId,
        }));

        return playerId;
      },

      recordRaceResult: (result) => {
        const { currentPlayerId, playerStats } = get();
        if (!currentPlayerId) return;

        const raceResult: RaceResult = {
          id: generateId(),
          timestamp: Date.now(),
          ...result,
        };

        const player = playerStats[currentPlayerId];
        if (!player) return;

        const updatedPlayer: PlayerStats = {
          ...player,
          races: player.races + 1,
          wins: result.position === 1 ? player.wins + 1 : player.wins,
          fastestTime: player.fastestTime 
            ? Math.min(player.fastestTime, result.time) 
            : result.time,
          powerUpsCollected: player.powerUpsCollected + result.powerUpsCollected,
          obstaclesHit: player.obstaclesHit + result.obstaclesHit,
          lastPlayed: Date.now(),
        };

        set(state => ({
          playerStats: { ...state.playerStats, [currentPlayerId]: updatedPlayer },
          recentRaces: [raceResult, ...state.recentRaces].slice(0, 100),
        }));
      },

      getTopPlayers: (limit = 10) => {
        return Object.values(get().playerStats)
          .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.races - a.races;
          })
          .slice(0, limit);
      },

      getFastestTimes: (limit = 10) => {
        return get().recentRaces
          .filter(r => r.position === 1)
          .sort((a, b) => a.time - b.time)
          .slice(0, limit);
      },

      getPlayerStats: (playerId: string) => {
        return get().playerStats[playerId] || null;
      },

      getCurrentPlayerStats: () => {
        const { currentPlayerId, playerStats } = get();
        if (!currentPlayerId) return null;
        return playerStats[currentPlayerId] || null;
      },
    }),
    {
      name: 'sperm-race-leaderboard',
    }
  )
);
