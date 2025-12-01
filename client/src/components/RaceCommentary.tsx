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
  "My grandma could swim faster, and she's a cookie!",
  "This is giving... participation trophy energy!",
  "Breaking: Scientists discover new species of snail-sperm hybrid!",
  "The egg is going to expire before anyone reaches it!",
  "I've seen more action in a parking lot!",
  "Somewhere, Darwin is crying!",
  "This race is sponsored by: Extreme Patience!",
  "I could've fertilized the egg myself by now!",
  "Are we sure these aren't just floating backwards?",
  "This is more dramatic than my last relationship!",
];

const HYPE_PHRASES = [
  "AND THEY'RE OFF! May the best swimmer win!",
  "This is INTENSE! The crowd goes wild!",
  "OH MY! Look at that speed!",
  "We're in the final stretch, folks!",
  "This is what we came here for!",
  "Goosebumps! Actual goosebumps!",
  "The tension is PALPABLE!",
  "History in the making right here!",
  "Someone pinch me, this is ELECTRIC!",
  "What a time to be alive... or swimming!",
];

const COLLISION_COMMENTARY = [
  "BONK! That's gonna leave a mark!",
  "WHAM! Sperm on sperm violence!",
  "OH SNAP! They just collided!",
  "That's not swimming, that's WRESTLING!",
  "BODY CHECK! Someone call the referee!",
  "Did they just HIGH FIVE at 100 mph?!",
  "Intimate contact detected! Wait, wrong sport!",
  "That collision had MORE chemistry than most first dates!",
  "BUMPER SPERMS! Coming to an arcade near you!",
];

const POWER_UP_COMMENTARY = {
  lube: [
    "SLIPPERY WHEN WET! Someone just grabbed the lube!",
    "Oh baby! That's some smooth swimming right there!",
    "Lube boost activated! Things are about to get SLICK!",
    "Well well well, look who found the secret sauce!",
    "Friction? Never heard of her!",
    "LUBED UP and ready to GO!",
    "Sliding into first place like sliding into DMs!",
    "That's some premium lubricant right there!",
  ],
  viagra: [
    "VIAGRA POWER! This is about to get... interesting!",
    "Someone's feeling very... motivated right now!",
    "Performance enhancement detected! Not that kind, folks!",
    "Talk about a hard worker! This one means business!",
    "That little blue pill is working OVERTIME!",
    "UP UP AND AWAY! Literally!",
    "Maximum overdrive ENGAGED!",
    "Four hours of this? Someone call a doctor! Just kidding!",
  ],
  mutation: [
    "MUTATION! Darwin would be so proud!",
    "Evolution in action, ladies and gentlemen!",
    "That's not normal! But who's judging in THIS race?",
    "Genetic modification activated! Science has gone too far!",
    "Someone just unlocked their super powers!",
    "X-MEN recruitment incoming!",
  ],
};

const OBSTACLE_COMMENTARY = {
  condom: [
    "BLOCKED! That's what condoms do, folks!",
    "Talk about protection! Too much protection!",
    "Safety first! But maybe not in a RACE!",
    "Wrapped up like a birthday present... a very slow birthday present!",
    "Barrier activated! This is NOT the time for safe practices!",
    "DENIED by latex! The irony is not lost on me!",
    "That's one effective contraceptive!",
    "PROTECTION POWER... working against you!",
  ],
  pill: [
    "BIRTH CONTROL SAYS NO! Not today, swimmer!",
    "The pill strikes again! That's some effective contraception!",
    "Denied by pharmaceuticals! What a way to go!",
    "Pills before thrills! Someone's having a bad day!",
    "Contraception: 1, Determination: 0!",
    "Plan B just RUINED Plan A!",
    "Hormonal interference detected!",
  ],
  std: [
    "OH NO! That's gonna leave a mark!",
    "Yikes! Someone should've been more careful!",
    "DANGER ZONE! That's what happens when you don't watch where you're going!",
    "Bad news bacteria! This race just got personal!",
    "Someone needs to schedule a doctor's appointment after this!",
    "Yikes on BIKES! That's gotta hurt!",
    "Uninvited guest alert!",
  ],
  antibody: [
    "IMMUNE SYSTEM ACTIVATED! You shall not pass!",
    "Antibodies doing their job! Too well, actually!",
    "Defense mechanisms at work! Very effective defense!",
    "That's one aggressive immune response!",
    "The body's natural defenses are TOO natural!",
    "REJECTED by biology itself!",
    "Natural selection in ACTION!",
  ],
};

const MYSTERY_EGG_GOOD = [
  "MYSTERY EGG! It's like Christmas morning in here!",
  "What's in the egg? Let's find out together!",
  "Egg-cellent discovery! Was that pun egg-ceptional?",
  "Mystery solved! And it's a good one!",
  "Golden egg acquired! This isn't Willy Wonka, but close!",
  "JACKPOT! The egg gods smile upon you!",
  "Surprise mechanics at their FINEST!",
  "You won the egg lottery!",
];

const MYSTERY_EGG_BAD = [
  "SURPRISE! And not the good kind!",
  "That egg was a trap! Bamboozled!",
  "Mystery egg delivered... disappointment!",
  "Well that backfired spectacularly!",
  "Pro tip: Not all eggs are created equal!",
  "PRANKED! By an EGG!",
  "Rotten luck from a rotten egg!",
  "Should've left that egg alone!",
];

const POSITION_COMMENTARY = {
  leading: [
    "Look at you, Mr./Ms. Fancy Pants in first place!",
    "Someone woke up and chose DOMINANCE today!",
    "Is anyone else even trying? This is embarrassing for them!",
    "First place! Your mother would be so proud. Or horrified. Hard to say.",
    "Leading the pack like a boss! A very determined boss!",
    "FRONT RUNNER! The view from up there must be INCREDIBLE!",
    "Showing everyone else how it's DONE!",
    "That's CHAMPIONSHIP material right there!",
    "Born to WIN, baby!",
  ],
  second: [
    "Second place! So close, yet so far!",
    "Silver medal energy! Almost there, champ!",
    "Number two! Fitting, given the biology theme!",
    "You're chasing greatness! Or just chasing the leader!",
    "Runner up! The eternal bridesmaid!",
    "First LOSER... I mean, second place winner!",
    "One spot away from GLORY!",
    "Close enough to TASTE victory!",
  ],
  losing: [
    "Umm, hate to break it to you, but you're losing! Like, badly!",
    "Last place is still a place! Technically!",
    "Remember: It's not about winning, it's about... actually, it IS about winning!",
    "The view from the back must be spectacular!",
    "Fun fact: You're making everyone else look good!",
    "Character development happens in LAST place!",
    "Someone has to be the underdog story!",
    "Plot armor activate? Anyone? Hello?",
    "This is your VILLAIN origin story!",
  ],
};

const CLOSE_RACE = [
  "It's tighter than a drum out there!",
  "This is closer than a family reunion!",
  "Photo finish incoming! Get the cameras ready!",
  "I can't tell who's winning! This is madness!",
  "They're so close, they could share a phone number!",
  "This is ANYBODY'S race now!",
  "Neck and neck! Tail and tail?",
  "The tension is UNBEARABLE!",
  "ONE wrong move and it's OVER!",
];

const START_RACE = [
  "And they're OFF like a prom dress!",
  "SWIMMERS, TAKE YOUR MARKS... GO GO GO!",
  "The race begins! May the FASTEST cell win!",
  "It's ON like Donkey Kong!",
  "Time to see what you're made of! Literally!",
  "The journey of a lifetime begins NOW!",
  "Get ready for the ULTIMATE swim meet!",
];

const ALMOST_FINISH = [
  "The finish line is in SIGHT!",
  "Almost there! Don't choke NOW!",
  "The egg awaits! Who will claim VICTORY?!",
  "Final stretch! GIVE IT EVERYTHING!",
  "History is about to be MADE!",
  "The moment of TRUTH approaches!",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function RaceCommentary() {
  const { phase, racers, lastEventMessage, trackHeight } = useRace();
  const lastTimeRef = useRef(0);
  const lastEventRef = useRef("");
  const raceStartAnnouncedRef = useRef(false);
  const almostFinishAnnouncedRef = useRef(false);
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
    utterance.rate = 1.2;
    utterance.pitch = 1.15;
    utterance.volume = 0.95;
    
    const voices = synthRef.current.getVoices();
    const funVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Samantha'));
    if (funVoice) {
      utterance.voice = funVoice;
    }
    
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (phase === "racing" && !raceStartAnnouncedRef.current) {
      raceStartAnnouncedRef.current = true;
      speak(getRandomItem(START_RACE));
    } else if (phase !== "racing") {
      raceStartAnnouncedRef.current = false;
      almostFinishAnnouncedRef.current = false;
    }
  }, [phase]);
  
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
      } else if (lastEventMessage.includes("collided") || lastEventMessage.includes("bumped")) {
        commentary = getRandomItem(COLLISION_COMMENTARY);
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
      
      if (player.y > trackHeight * 0.8 && !almostFinishAnnouncedRef.current) {
        almostFinishAnnouncedRef.current = true;
        speak(getRandomItem(ALMOST_FINISH));
        return;
      }
      
      let commentary = "";
      const rand = Math.random();
      
      if (maxGap < 150 && rand < 0.35) {
        commentary = getRandomItem(CLOSE_RACE);
      } else if (rand < 0.15) {
        commentary = getRandomItem(HYPE_PHRASES);
      } else if (rand < 0.45) {
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
  }, [phase, racers, trackHeight]);
  
  return null;
}
