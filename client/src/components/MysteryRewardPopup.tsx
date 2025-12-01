import { useEffect, useState } from "react";
import { useMysteryRewards } from "@/lib/stores/useMysteryRewards";

export function MysteryRewardPopup() {
  const { currentReward, showRewardPopup, clearCurrentReward } = useMysteryRewards();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showRewardPopup && currentReward) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        clearCurrentReward();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showRewardPopup, currentReward, clearCurrentReward]);

  if (!currentReward || !showRewardPopup) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityGlow = {
    common: 'shadow-gray-400/50',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-yellow-400/50',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`relative transform transition-all duration-500 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-50 translate-y-10'
        }`}
      >
        <div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${rarityColors[currentReward.rarity]} blur-xl opacity-50 animate-pulse`}
        />
        
        <div 
          className={`relative bg-gradient-to-b from-white to-gray-100 rounded-2xl p-6 shadow-2xl ${rarityGlow[currentReward.rarity]} border-4 ${
            currentReward.isGood ? 'border-green-400' : 'border-red-400'
          }`}
          style={{
            animation: currentReward.rarity === 'legendary' ? 'pulse 0.5s ease-in-out infinite' : undefined,
          }}
        >
          <div className="text-6xl text-center mb-3 animate-bounce">
            {currentReward.emoji}
          </div>
          
          <div className="text-center">
            <div 
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase mb-2 bg-gradient-to-r ${rarityColors[currentReward.rarity]} text-white`}
            >
              {currentReward.rarity}
            </div>
            
            <h3 className={`text-xl font-bold mb-1 ${
              currentReward.isGood ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentReward.name}
            </h3>
            
            <p className="text-sm text-gray-600">
              {currentReward.description}
            </p>
          </div>

          {currentReward.rarity === 'legendary' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
