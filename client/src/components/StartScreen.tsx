import { useState } from "react";
import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { GlobalLeaderboard } from "./GlobalLeaderboard";

export function StartScreen() {
  const { startRace } = useRace();
  const { setMultiplayer } = useMultiplayer();
  const { initPlayer } = useLeaderboard();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  
  const handleSinglePlayer = () => {
    setShowNicknameModal(true);
  };
  
  const startSinglePlayerGame = () => {
    if (nickname.trim()) {
      initPlayer(nickname.trim());
      setMultiplayer(false);
      startRace();
    }
  };
  
  const handleMultiplayer = () => {
    setMultiplayer(true);
  };
  
  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFE4EC 0%, #E8D4F5 50%, #D4E8F5 100%)",
          fontFamily: "'Comic Sans MS', cursive",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${20 + Math.random() * 60}px`,
                height: `${20 + Math.random() * 60}px`,
                background: `radial-gradient(circle, ${
                  ['#FF6B9D', '#9B59B6', '#3498DB', '#E74C3C', '#F39C12'][i % 5]
                } 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #FF6B9D 0%, transparent 25%),
                               radial-gradient(circle at 80% 70%, #9B59B6 0%, transparent 25%),
                               radial-gradient(circle at 50% 50%, #FFB5D8 0%, transparent 40%)`,
            }}
          />
        </div>
        
        <div className="text-center px-4 relative z-10">
          <div className="relative inline-block mb-6">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold animate-pulse"
              style={{
                background: "linear-gradient(45deg, #FF6B9D, #9B59B6, #FF6B9D, #F39C12)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient 3s ease infinite, bounce 2s ease-in-out infinite",
                textShadow: "0 0 40px rgba(255,107,157,0.3)",
              }}
            >
              Gene Pool Royale
            </h1>
            <div className="absolute -top-4 -right-4 text-4xl animate-spin" style={{ animationDuration: '3s' }}>
              🏆
            </div>
          </div>
          
          <p 
            className="text-xl md:text-2xl mb-8 font-bold"
            style={{ 
              color: "#FF6B9D",
              textShadow: "0 2px 10px rgba(255,107,157,0.3)",
            }}
          >
            The Ultimate Race to Fertilization!
          </p>
          
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 max-w-md mx-auto mb-8 border-2 border-pink-200"
            style={{
              boxShadow: "0 20px 60px rgba(255,107,157,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset",
            }}
          >
            <h2 
              className="text-xl md:text-2xl font-bold mb-4 flex items-center justify-center gap-2"
              style={{ color: "#9B59B6" }}
            >
              <span className="animate-bounce">🏁</span>
              Choose Your Mode!
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏁</span>
            </h2>
            
            <div className="text-left space-y-2 mb-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
              <p className="flex items-center gap-2">
                <span className="text-lg">🎮</span>
                <strong>Controls:</strong> WASD or Arrow Keys
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <strong>Goal:</strong> Reach the egg at the top!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-left text-sm mb-4">
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <p className="font-bold text-green-700 mb-1">Power-Ups:</p>
                <p className="text-green-600">💧 Lube Boost</p>
                <p className="text-green-600">💊 Viagra</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="font-bold text-red-700 mb-1">Obstacles:</p>
                <p className="text-red-600">🚫 Condoms</p>
                <p className="text-red-600">🦠 STDs</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4 border border-purple-200">
              <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                <span>🎤</span> Voice Boost:
              </p>
              <p className="text-xs text-purple-600 italic">
                Say "east or west goon hack is the best"
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-200">
              <p className="text-sm font-bold text-orange-700 flex items-center gap-2">
                <span>🥚</span> Mystery Eggs:
              </p>
              <p className="text-xs text-orange-600">
                Collect for random surprises!
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={handleSinglePlayer}
              className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white px-8 py-5 rounded-full text-xl md:text-2xl font-bold shadow-xl hover:scale-105 transition-all duration-300 group"
              style={{
                boxShadow: "0 10px 40px rgba(255,107,157,0.4)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-2xl group-hover:animate-bounce">🎮</span>
                Single Player
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={handleMultiplayer}
              className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 text-white px-8 py-5 rounded-full text-xl md:text-2xl font-bold shadow-xl hover:scale-105 transition-all duration-300 group"
              style={{
                boxShadow: "0 10px 40px rgba(155,89,182,0.4)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-2xl group-hover:animate-bounce">👥</span>
                Multiplayer (Up to 6 Players)
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-all duration-300 group"
              style={{
                boxShadow: "0 8px 30px rgba(251,191,36,0.4)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl">🏆</span>
                Leaderboard
              </span>
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            📱 Mobile friendly! Touch controls available on phones
          </p>
        </div>
      </div>

      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-pink-600 mb-4 text-center">
              Enter Your Name
            </h3>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-lg mb-4"
              onKeyDown={(e) => e.key === 'Enter' && nickname.trim() && startSinglePlayerGame()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startSinglePlayerGame}
                disabled={!nickname.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold disabled:opacity-50 hover:opacity-90"
              >
                Start Race!
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <GlobalLeaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </>
  );
}
