import { useRace } from "@/lib/stores/useRace";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";

export function StartScreen() {
  const { startRace } = useRace();
  const { setMultiplayer } = useMultiplayer();
  
  const handleSinglePlayer = () => {
    setMultiplayer(false);
    startRace();
  };
  
  const handleMultiplayer = () => {
    setMultiplayer(true);
  };
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #E8C4F5 0%, #C4E8F5 100%)",
        fontFamily: "'Comic Sans MS', cursive",
      }}
    >
      <div className="text-center px-4">
        <h1
          className="text-6xl md:text-8xl font-bold mb-4 animate-bounce"
          style={{
            background: "linear-gradient(45deg, #FF6B9D, #9B59B6, #F39C12)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Gene Pool Royale
        </h1>
        
        <p className="text-2xl mb-8" style={{ color: "#FF6B9D" }}>
          The Ultimate Race to Fertilization!
        </p>
        
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#9B59B6" }}>
            🏁 Choose Your Mode! 🏁
          </h2>
          
          <div className="text-left space-y-2 mb-4">
            <p><strong>Controls:</strong> WASD or Arrow Keys</p>
            <p><strong>Goal:</strong> Reach the egg at the top!</p>
          </div>
          
          <div className="text-left space-y-1 text-sm mb-4">
            <p className="font-bold">Power-Ups:</p>
            <p>💧 Lube Boost | 💊 Viagra</p>
            <p className="font-bold mt-2">Obstacles:</p>
            <p>🚫 Condoms | 💊 Pills | 🦠 Antibodies | 🦠 STDs</p>
          </div>
          
          <div className="bg-purple-100 rounded-lg p-3 mb-4">
            <p className="text-sm font-bold">🎤 Voice Boost:</p>
            <p className="text-xs">Say "east or west goon hack is the best"</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <button
            onClick={handleSinglePlayer}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
          >
            🎮 Single Player
          </button>
          
          <button
            onClick={handleMultiplayer}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
          >
            👥 Multiplayer (Up to 3 Players)
          </button>
        </div>
      </div>
    </div>
  );
}
