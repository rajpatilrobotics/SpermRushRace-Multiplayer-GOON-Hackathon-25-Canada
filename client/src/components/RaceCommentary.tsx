import { useEffect, useRef } from "react";
import { useRace } from "@/lib/stores/useRace";

const COMMENTARY_INTERVAL = 4000;

const SARCASTIC_PHRASES = [
  "Well, this is awkward! Someone's swimming backwards!",
  "Is this a race or a leisurely swim? I can't tell anymore!",
  "Ladies and gentlemen, we're witnessing history... very, very slow history!",
  "I've seen snails with better hustle than this!",
  "Breaking news: Local sperm discovers the meaning of 'taking it easy'!",
  "This is the most dramatic thing to happen in biology since... well, ever!",
  "Someone call an ambulance! But not for me... for these slow swimmers!",
  "Plot twist: They're ALL going to finish last!",
  "I'm not saying it's slow, but I've aged three years watching this!",
  "Achievement unlocked: Successfully swimming in circles!",
];

const POWER_UP_COMMENTARY = {
  lube: [
    "SLIPPERY WHEN WET! Someone just grabbed the lube!",
    "Oh baby! That's some smooth swimming right there!",
    "Lube boost activated! Things are about to get SLICK!",
    "Well well well, look who found the secret sauce!",
    "Friction? Never heard of her!",
  ],
  viagra: [
    "VIAGRA POWER! This is about to get... interesting!",
    "Someone's feeling very... motivated right now!",
    "Performance enhancement detected! Not that kind, folks!",
    "Talk about a hard worker! This one means business!",
    "That little blue pill is working OVERTIME!",
  ],
  mutation: [
    "MUTATION! Darwin would be so proud!",
    "Evolution in action, ladies and gentlemen!",
    "That's not normal! But who's judging in THIS race?",
    "Genetic modification activated! Science has gone too far!",
    "Someone just unlocked their super powers!",
  ],
};

const OBSTACLE_COMMENTARY = {
  condom: [
    "BLOCKED! That's what condoms do, folks!",
    "Talk about protection! Too much protection!",
    "Safety first! But maybe not in a RACE!",
    "Wrapped up like a birthday present... a very slow birthday present!",
    "Barrier activated! This is NOT the time for safe practices!",
  ],
  pill: [
    "BIRTH CONTROL SAYS NO! Not today, swimmer!",
    "The pill strikes again! That's some effective contraception!",
    "Denied by pharmaceuticals! What a way to go!",
    "Pills before thrills! Someone's having a bad day!",
    "Contraception: 1, Determination: 0!",
  ],
  std: [
    "OH NO! That's gonna leave a mark!",
    "Yikes! Someone should've been more careful!",
    "DANGER ZONE! That's what happens when you don't watch where you're going!",
    "Bad news bacteria! This race just got personal!",
    "Someone needs to schedule a doctor's appointment after this!",
  ],
  antibody: [
    "IMMUNE SYSTEM ACTIVATED! You shall not pass!",
    "Antibodies doing their job! Too well, actually!",
    "Defense mechanisms at work! Very effective defense!",
    "That's one aggressive immune response!",
    "The body's natural defenses are TOO natural!",
  ],
};

const MYSTERY_EGG_GOOD = [
  "MYSTERY EGG! It's like Christmas morning in here!",
  "What's in the egg? Let's find out together!",
  "Egg-cellent discovery! Was that pun egg-ceptional?",
  "Mystery solved! And it's a good one!",
  "Golden egg acquired! This isn't Willy Wonka, but close!",
];

const MYSTERY_EGG_BAD = [
  "SURPRISE! And not the good kind!",
  "That egg was a trap! Bamboozled!",
  "Mystery egg delivered... disappointment!",
  "Well that backfired spectacularly!",
  "Pro tip: Not all eggs are created equal!",
];

const POSITION_COMMENTARY = {
  leading: [
    "Look at you, Mr./Ms. Fancy Pants in first place!",
    "Someone woke up and chose DOMINANCE today!",
    "Is anyone else even trying? This is embarrassing for them!",
    "First place! Your mother would be so proud. Or horrified. Hard to say.",
    "Leading the pack like a boss! A very determined boss!",
  ],
  second: [
    "Second place! So close, yet so far!",
    "Silver medal energy! Almost there, champ!",
    "Number two! Fitting, given the biology theme!",
    "You're chasing greatness! Or just chasing the leader!",
    "Runner up! The eternal bridesmaid!",
  ],
  losing: [
    "Umm, hate to break it to you, but you're losing! Like, badly!",
    "Last place is still a place! Technically!",
    "Remember: It's not about winning, it's about... actually, it IS about winning!",
    "The view from the back must be spectacular!",
    "Fun fact: You're making everyone else look good!",
  ],
};

const CLOSE_RACE = [
  "It's tighter than a drum out there!",
  "This is closer than a family reunion!",
  "Photo finish incoming! Get the cameras ready!",
  "I can't tell who's winning! This is madness!",
  "They're so close, they could share a phone number!",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function RaceCommentary() {
  const { phase, racers, lastEventMessage } = useRace();
  const lastTimeRef = useRef(0);
  const lastEventRef = useRef("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);
  
  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.15;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    
    synthRef.current.speak(utterance);
  };
  
  useEffect(() => {
    if (phase !== "racing" || lastEventMessage === lastEventRef.current) return;
    
    if (lastEventMessage) {
      lastEventRef.current = lastEventMessage;
      
      let commentary = "";
      
      if (lastEventMessage.includes("Lube")) {
        commentary = getRandomItem(POWER_UP_COMMENTARY.lube);
      } else if (lastEventMessage.includes("Viagra")) {
        commentary = getRandomItem(POWER_UP_COMMENTARY.viagra);
      } else if (lastEventMessage.includes("Condom")) {
        commentary = getRandomItem(OBSTACLE_COMMENTARY.condom);
      } else if (lastEventMessage.includes("Birth Control") || lastEventMessage.includes("pill")) {
        commentary = getRandomItem(OBSTACLE_COMMENTARY.pill);
      } else if (lastEventMessage.includes("STD")) {
        commentary = getRandomItem(OBSTACLE_COMMENTARY.std);
      } else if (lastEventMessage.includes("Antibody")) {
        commentary = getRandomItem(OBSTACLE_COMMENTARY.antibody);
      } else if (lastEventMessage.includes("mystery") || lastEventMessage.includes("egg")) {
        if (lastEventMessage.includes("powerup") || lastEventMessage.includes("boost") || lastEventMessage.includes("Viagra") || lastEventMessage.includes("Lube")) {
          commentary = getRandomItem(MYSTERY_EGG_GOOD);
        } else {
          commentary = getRandomItem(MYSTERY_EGG_BAD);
        }
      }
      
      if (commentary) {
        speak(commentary);
        lastTimeRef.current = Date.now();
      }
    }
  }, [lastEventMessage, phase]);
  
  useEffect(() => {
    if (phase !== "racing" || !synthRef.current) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastTimeRef.current < COMMENTARY_INTERVAL) return;
      
      lastTimeRef.current = now;
      
      const sortedRacers = [...racers].sort((a, b) => b.y - a.y);
      const leader = sortedRacers[0];
      const playerPosition = sortedRacers.findIndex((r) => r.isPlayer) + 1;
      const player = racers.find(r => r.isPlayer);
      
      if (!player) return;
      
      const positions = sortedRacers.map(r => r.y);
      const maxGap = Math.max(...positions) - Math.min(...positions);
      
      let commentary = "";
      
      const rand = Math.random();
      
      if (maxGap < 150 && rand < 0.3) {
        commentary = getRandomItem(CLOSE_RACE);
      } else if (rand < 0.35) {
        if (playerPosition === 1) {
          commentary = getRandomItem(POSITION_COMMENTARY.leading);
        } else if (playerPosition === 2) {
          commentary = getRandomItem(POSITION_COMMENTARY.second);
        } else {
          commentary = getRandomItem(POSITION_COMMENTARY.losing);
        }
      } else {
        commentary = getRandomItem(SARCASTIC_PHRASES);
      }
      
      speak(commentary);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, racers]);
  
  return null;
}
