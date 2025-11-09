import { useState, useEffect } from "react";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useRace } from "@/lib/stores/useRace";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

export function LobbyScreen() {
  const [mode, setMode] = useState<"menu" | "create" | "join" | "lobby">("menu");
  const [nickname, setNickname] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  
  const {
    roomCode,
    players,
    isHost,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame: startMultiplayerGame,
    setupSocketListeners,
    clearError,
  } = useMultiplayer();

  const { powerUps, obstacles, startRace } = useRace();

  // Set up socket listeners on mount
  useEffect(() => {
    setupSocketListeners();
  }, []);

  // Switch to lobby view when connected
  useEffect(() => {
    if (isConnected && roomCode) {
      setMode("lobby");
    }
  }, [isConnected, roomCode]);

  const handleCreateRoom = () => {
    if (nickname.trim()) {
      createRoom(nickname.trim());
    }
  };

  const handleJoinRoom = () => {
    if (nickname.trim() && roomCodeInput.trim()) {
      joinRoom(roomCodeInput.trim(), nickname.trim());
    }
  };

  const handleStartGame = () => {
    // Start race first to generate power-ups and obstacles
    startRace();
    
    // Then get the generated power-ups and obstacles and sync to all players
    const raceState = useRace.getState();
    startMultiplayerGame(raceState.powerUps, raceState.obstacles);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setMode("menu");
    setNickname("");
    setRoomCodeInput("");
  };

  const playerList = Array.from(players.values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200">
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm shadow-2xl">
        {/* Main Menu */}
        {mode === "menu" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-pink-600 mb-2">🏊 Sperm Race</h1>
              <p className="text-gray-600">Multiplayer Racing Game</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setMode("create")}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
              >
                Create Room
              </Button>
              <Button
                onClick={() => setMode("join")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-lg py-6"
              >
                Join Room
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Race with up to 3 players!</p>
            </div>
          </div>
        )}

        {/* Create Room */}
        {mode === "create" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-pink-600 mb-2">Create Room</h2>
              <p className="text-gray-600">Choose your nickname</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname..."
                  maxLength={20}
                  className="text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setMode("menu")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!nickname.trim()}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room */}
        {mode === "join" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-purple-600 mb-2">Join Room</h2>
              <p className="text-gray-600">Enter room code and nickname</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <Input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  maxLength={6}
                  className="text-lg uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname..."
                  maxLength={20}
                  className="text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                  <Button
                    onClick={clearError}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    ✕
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setMode("menu")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!nickname.trim() || !roomCodeInput.trim()}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lobby */}
        {mode === "lobby" && roomCode && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-pink-600 mb-2">Room Lobby</h2>
              <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block">
                <span className="text-sm text-gray-600">Room Code:</span>
                <span className="text-2xl font-mono font-bold text-pink-600 ml-2">
                  {roomCode}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Players ({playerList.length}/3)
              </h3>
              <div className="space-y-2">
                {playerList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="font-medium text-gray-800">{player.nickname}</span>
                    {player.id === Array.from(players.keys())[0] && (
                      <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              {isHost ? (
                <p>You are the host. Click Start Game when ready!</p>
              ) : (
                <p>Waiting for host to start the game...</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleLeaveRoom}
                variant="outline"
                className="flex-1"
              >
                Leave Room
              </Button>
              {isHost && (
                <Button
                  onClick={handleStartGame}
                  disabled={playerList.length < 1}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Start Game
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
