import { create } from "zustand";

export type RewardType = 
  | 'speed_boost'
  | 'mega_boost'
  | 'shield'
  | 'magnet'
  | 'shrink'
  | 'giant'
  | 'rainbow'
  | 'coins'
  | 'nothing'
  | 'slowdown'
  | 'reverse'
  | 'dizzy';

export interface MysteryReward {
  type: RewardType;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isGood: boolean;
  duration?: number;
  value?: number;
}

const MYSTERY_REWARDS: MysteryReward[] = [
  { type: 'speed_boost', name: 'Speed Boost', description: '1.5x speed for 5 seconds!', emoji: '⚡', rarity: 'common', isGood: true, duration: 5000 },
  { type: 'mega_boost', name: 'MEGA BOOST', description: '3x speed for 3 seconds!', emoji: '🚀', rarity: 'epic', isGood: true, duration: 3000 },
  { type: 'shield', name: 'Shield', description: 'Block the next obstacle!', emoji: '🛡️', rarity: 'rare', isGood: true, duration: 10000 },
  { type: 'magnet', name: 'Power Magnet', description: 'Attract nearby power-ups!', emoji: '🧲', rarity: 'rare', isGood: true, duration: 8000 },
  { type: 'shrink', name: 'Tiny Mode', description: 'Become tiny and dodge easier!', emoji: '🔬', rarity: 'rare', isGood: true, duration: 6000 },
  { type: 'giant', name: 'Giant Mode', description: 'Become HUGE!', emoji: '🦖', rarity: 'epic', isGood: true, duration: 5000 },
  { type: 'rainbow', name: 'Rainbow Trail', description: 'Leave a fabulous trail!', emoji: '🌈', rarity: 'legendary', isGood: true, duration: 15000 },
  { type: 'coins', name: 'Bonus Points', description: '+500 style points!', emoji: '💰', rarity: 'common', isGood: true, value: 500 },
  { type: 'nothing', name: 'Empty Egg', description: 'Better luck next time!', emoji: '💨', rarity: 'common', isGood: false },
  { type: 'slowdown', name: 'Slow Motion', description: 'Everything slows down...', emoji: '🐌', rarity: 'common', isGood: false, duration: 3000 },
  { type: 'reverse', name: 'Confusion', description: 'Controls are reversed!', emoji: '🔄', rarity: 'rare', isGood: false, duration: 4000 },
  { type: 'dizzy', name: 'Dizzy Spell', description: 'Screen goes wobbly!', emoji: '😵', rarity: 'rare', isGood: false, duration: 3000 },
];

const RARITY_WEIGHTS = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
};

interface MysteryRewardsState {
  currentReward: MysteryReward | null;
  rewardHistory: MysteryReward[];
  activeEffects: { reward: MysteryReward; expiresAt: number }[];
  showRewardPopup: boolean;
  
  openMysteryEgg: () => MysteryReward;
  clearCurrentReward: () => void;
  addActiveEffect: (reward: MysteryReward) => void;
  updateActiveEffects: () => void;
  hasActiveEffect: (type: RewardType) => boolean;
  getActiveEffectTimeRemaining: (type: RewardType) => number;
}

function getRandomReward(): MysteryReward {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  let selectedRarity: keyof typeof RARITY_WEIGHTS = 'common';
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      selectedRarity = rarity as keyof typeof RARITY_WEIGHTS;
      break;
    }
  }
  
  const rewardsOfRarity = MYSTERY_REWARDS.filter(r => r.rarity === selectedRarity);
  return rewardsOfRarity[Math.floor(Math.random() * rewardsOfRarity.length)];
}

export const useMysteryRewards = create<MysteryRewardsState>((set, get) => ({
  currentReward: null,
  rewardHistory: [],
  activeEffects: [],
  showRewardPopup: false,

  openMysteryEgg: () => {
    const reward = getRandomReward();
    
    set(state => ({
      currentReward: reward,
      rewardHistory: [reward, ...state.rewardHistory].slice(0, 50),
      showRewardPopup: true,
    }));

    if (reward.duration) {
      get().addActiveEffect(reward);
    }

    setTimeout(() => {
      set({ showRewardPopup: false });
    }, 2000);

    return reward;
  },

  clearCurrentReward: () => {
    set({ currentReward: null, showRewardPopup: false });
  },

  addActiveEffect: (reward) => {
    if (!reward.duration) return;
    
    set(state => ({
      activeEffects: [
        ...state.activeEffects,
        { reward, expiresAt: Date.now() + reward.duration! }
      ]
    }));
  },

  updateActiveEffects: () => {
    const now = Date.now();
    set(state => ({
      activeEffects: state.activeEffects.filter(e => e.expiresAt > now)
    }));
  },

  hasActiveEffect: (type) => {
    const now = Date.now();
    return get().activeEffects.some(e => e.reward.type === type && e.expiresAt > now);
  },

  getActiveEffectTimeRemaining: (type) => {
    const now = Date.now();
    const effect = get().activeEffects.find(e => e.reward.type === type && e.expiresAt > now);
    return effect ? effect.expiresAt - now : 0;
  },
}));
