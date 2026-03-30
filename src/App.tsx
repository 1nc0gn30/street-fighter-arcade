/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, Shield, Zap, Trophy, User, Info, Mail, Github, 
  Menu, X, MapPin, Play, LogIn, LogOut, UserPlus, 
  Keyboard, Code, Gamepad2, Volume2, VolumeX, Send
} from 'lucide-react';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';

// --- Constants & Types ---

const CHARACTERS = [
  { id: 'coding', name: 'CODE MASTER', origin: 'SILICON VALLEY', seed: 'coding', color: 'bg-blue-600', quote: 'Syntax is my sword, logic is my shield.', move: 'RECURSION!' },
  { id: 'typing', name: 'KEYBOARD WARRIOR', origin: 'MECHANICAL ISLE', seed: 'typing', color: 'bg-red-600', quote: 'My fingers move faster than your eyes can follow.', move: 'OVERCLOCK!' },
  { id: 'design', name: 'PIXEL PALADIN', origin: 'VECTOR CITY', seed: 'design', color: 'bg-purple-600', quote: 'Beauty is in the eye of the beholder... and my UI.', move: 'GRADIENT BLAST!' },
  { id: 'security', name: 'CYBER SENTINEL', origin: 'ENCRYPTED VOID', seed: 'security', color: 'bg-green-600', quote: 'Your firewall is just a suggestion.', move: 'ZERO DAY!' },
  { id: 'data', name: 'DATA DRAGON', origin: 'CLOUD PEAK', seed: 'data', color: 'bg-orange-600', quote: 'I see patterns where you see chaos.', move: 'QUERY CRUSH!' },
  { id: 'devops', name: 'PIPELINE PHOENIX', origin: 'DEPLOYMENT DUNGEON', seed: 'devops', color: 'bg-zinc-600', quote: 'From commit to production in seconds.', move: 'ROLLBACK!' },
];

const STAGES = [
  { id: 'suzaku', name: 'SUZAKU CASTLE', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800' },
  { id: 'airbase', name: 'AIR FORCE BASE', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800' },
  { id: 'market', name: 'CHINA MARKET', image: 'https://images.unsplash.com/photo-1505164294036-5fad98506d20?auto=format&fit=crop&q=80&w=800' },
];

// Centralized Audio Mapping for easy future updates
const AUDIO_CONFIG = {
  // UI Sounds
  UI_SELECT: 'https://www.myinstants.com/media/sounds/coin_1.mp3',
  UI_MENU_OPEN: 'https://www.myinstants.com/media/sounds/street-fighter-iii-3rd-confirm.mp3',
  UI_MENU_CLOSE: 'https://www.myinstants.com/media/sounds/street-fighter-iii-3rd-confirm.mp3',
  
  // Game State Sounds
  GAME_START: 'https://www.myinstants.com/media/sounds/brazil_h3MkjOz.mp3',
  GAME_VICTORY: 'https://www.myinstants.com/media/sounds/street-fighter-iii-3rd-confirm.mp3',
  GAME_DEFEAT: 'https://www.myinstants.com/media/sounds/mlg-resource-street-fighter-ko-greenscreen.mp3',
  GAME_COUNTDOWN: 'https://www.myinstants.com/media/sounds/china_GN3TDUt.mp3',
  
  // Action Sounds
  ACTION_PUNCH: 'https://www.myinstants.com/media/sounds/hadouken-sound-effect-256-kbps.mp3',
  ACTION_KICK: 'https://www.myinstants.com/media/sounds/street-fighter-iii-3rd-confirm.mp3',
  ACTION_SPECIAL: 'https://www.myinstants.com/media/sounds/hadouken-sound-effect-256-kbps.mp3',
  ACTION_TYPING: 'https://www.myinstants.com/media/sounds/coin_1.mp3',
  ACTION_KO: 'https://www.myinstants.com/media/sounds/mlg-resource-street-fighter-ko-greenscreen.mp3',
  
  // Background Music
  MUSIC_THEME: 'https://www.myinstants.com/media/sounds/street-fighter-theme.mp3',
  MUSIC_BATTLE: 'https://www.myinstants.com/media/sounds/guile-theme-2.mp3'
};

const SOUNDS = {
  select: AUDIO_CONFIG.UI_SELECT,
  fight: AUDIO_CONFIG.GAME_START,
  hit: AUDIO_CONFIG.ACTION_PUNCH,
  win: AUDIO_CONFIG.GAME_VICTORY,
  theme: AUDIO_CONFIG.MUSIC_THEME,
  ko: AUDIO_CONFIG.ACTION_KO
};

const TYPING_ROUNDS = [
  'HADOUKEN SHORYUKEN TATSUMAKI SENPUUKYAKU',
  'SONIC BOOM FLASH KICK BLADE KICK SOMERSAULT',
  'SPINNING BIRD KICK HUNDRED HAND SLAP KIKOKEN',
];

const CODING_ROUNDS = [
  'function hadouken(power: number) { return `HADOUKEN x${power}`; }',
  'const combo = ["punch", "kick", "special"].join(" -> ");',
  'const perfectKO = (hp: number) => hp <= 0 ? "PERFECT" : "FIGHT";',
];

const ARCADE_ROUNDS_TO_WIN = 2;
const ARCADE_ROUND_TIME = 45;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
type PlaySfxFn = (key: string, url: string, volume?: number) => void;

type BattleMode = 'typing' | 'coding' | 'arcade' | 'none';

// --- Components ---

export default function App() {
  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  // Game State
  const [activeTab, setActiveTab] = useState<'characters' | 'stages' | 'moves' | 'history'>('characters');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [showVs, setShowVs] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [health, setHealth] = useState({ p1: 100, p2: 100 });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [battleMode, setBattleMode] = useState<BattleMode>('none');
  const [isMuted, setIsMuted] = useState(true);

  // Multiplayer State
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [isPlayer1, setIsPlayer1] = useState(true);

  // Audio Refs
  const themeAudio = useRef<HTMLAudioElement | null>(null);
  const activeSfxRef = useRef<{ key: string; audio: HTMLAudioElement } | null>(null);

  // --- Effects ---

  useEffect(() => {
    try {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      }).catch(err => {
        console.error("Supabase Session Error:", err);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      console.error("Supabase Config Error:", err);
      setConfigError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!isMuted && themeAudio.current) {
      themeAudio.current.play().catch(() => {});
    } else if (themeAudio.current) {
      themeAudio.current.pause();
    }
  }, [isMuted]);

  // Real-time Presence
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('lobby', {
      config: { presence: { key: user.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('broadcast', { event: 'challenge' }, ({ payload }) => {
        if (payload.targetId === user.id) {
          if (window.confirm(`${payload.fromUsername} wants to play ${payload.mode.toUpperCase()}! Accept?`)) {
            const sessionId = `${payload.fromId}-${user.id}-${Date.now()}`;
            channel.send({
              type: 'broadcast',
              event: 'accept',
              payload: { sessionId, targetId: payload.fromId, fromId: user.id, mode: payload.mode, fromUsername: profile?.username || user.email, fromAvatar: profile?.avatar_url }
            });
            setOpponent({ id: payload.fromId, username: payload.fromUsername, avatar: payload.fromAvatar });
            setIsPlayer1(false);
            setBattleMode(payload.mode);
            setActiveSession(sessionId);
            setShowVs(true);
          }
        }
      })
      .on('broadcast', { event: 'accept' }, ({ payload }) => {
        if (payload.targetId === user.id) {
          setOpponent({ id: payload.fromId, username: payload.fromUsername, avatar: payload.fromAvatar });
          setIsPlayer1(true);
          setBattleMode(payload.mode);
          setActiveSession(payload.sessionId);
          setShowVs(true);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            username: profile?.username || user.email,
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`,
            status: battleMode === 'none' ? 'LOBBY' : 'PLAYING'
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile, battleMode]);

  // --- Helpers ---

  const getThemeTrack = () => {
    return AUDIO_CONFIG.MUSIC_THEME;
  };

  const playSound = (type: keyof typeof SOUNDS, volume = 0.55) => {
    playSfx(type, SOUNDS[type], volume);
  };

  const playSfx = useCallback<PlaySfxFn>((key, url, volume = 0.55) => {
    if (isMuted) return;
    const current = activeSfxRef.current;
    if (current && !current.audio.paused) {
      if (current.key === key) return;
      const previousAudio = current.audio;
      const fadeMs = 180;
      const steps = 6;
      const startVolume = previousAudio.volume;
      const stepVolume = startVolume / steps;
      const stepTime = Math.max(16, Math.floor(fadeMs / steps));
      let count = 0;
      const fade = window.setInterval(() => {
        count += 1;
        previousAudio.volume = Math.max(0, previousAudio.volume - stepVolume);
        if (count >= steps || previousAudio.volume <= 0.02) {
          window.clearInterval(fade);
          previousAudio.pause();
          previousAudio.currentTime = 0;
        }
      }, stepTime);
    }

    const nextAudio = new Audio(url);
    nextAudio.loop = false;
    nextAudio.volume = volume;
    activeSfxRef.current = { key, audio: nextAudio };
    nextAudio.onended = () => {
      if (activeSfxRef.current?.audio === nextAudio) {
        activeSfxRef.current = null;
      }
    };
    nextAudio.play().catch(() => {
      if (activeSfxRef.current?.audio === nextAudio) {
        activeSfxRef.current = null;
      }
    });
  }, [isMuted]);

  useEffect(() => {
    if (!isMuted) return;
    const current = activeSfxRef.current?.audio;
    if (!current) return;
    current.pause();
    current.currentTime = 0;
    activeSfxRef.current = null;
  }, [isMuted]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('sf_arcade_profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        // Create profile
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username || email}`;
        await supabase.from('sf_arcade_profiles').insert([{ id: data.user!.id, username, avatar_url: avatarUrl }]);
        alert('Check your email for confirmation!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const sendChallenge = (targetId: string, mode: BattleMode) => {
    if (!user) return;
    const channel = supabase.channel('lobby');
    channel.send({
      type: 'broadcast',
      event: 'challenge',
      payload: { 
        fromId: user.id, 
        fromUsername: profile?.username || user.email, 
        fromAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`,
        targetId, 
        mode 
      }
    });
    alert(`Challenge sent! Wait for acceptance...`);
  };

  const startBattle = (mode: BattleMode) => {
    playSound('fight', 0.7);
    // If no opponent, we can still play solo or wait
    setBattleMode(mode);
    setShowVs(true);
  };

  // --- Render Sections ---

  const renderAuth = () => (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900 pixel-border-red p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-sf-yellow arcade-text-shadow">
            {authMode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </h2>
          <button onClick={() => setUser({})} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          {authMode === 'signup' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-sf-red">USERNAME</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black border-2 border-zinc-700 p-3 text-white focus:border-sf-yellow outline-none"
                  required
                />
              </div>
              <div className="bg-sf-blue/10 border border-sf-blue p-3">
                <p className="text-[10px] text-sf-blue leading-tight">
                  <Info size={12} className="inline mr-1 mb-0.5" />
                  IMPORTANT: After signing up, you MUST check your email and click the verification link before you can log in.
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-sf-red">EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-2 border-zinc-700 p-3 text-white focus:border-sf-yellow outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-sf-red">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border-2 border-zinc-700 p-3 text-white focus:border-sf-yellow outline-none"
              required
            />
          </div>

          <button type="submit" className="bg-sf-red text-white py-4 pixel-border hover:bg-white hover:text-sf-red transition-all">
            {authMode === 'login' ? 'ENTER ARENA' : 'REGISTER FIGHTER'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-gray-500">
          {authMode === 'login' ? "NEW CHALLENGER?" : "ALREADY REGISTERED?"}
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-sf-yellow hover:underline"
          >
            {authMode === 'login' ? 'SIGN UP' : 'LOGIN'}
          </button>
        </p>
      </motion.div>
    </div>
  );

  const renderBattle = () => {
    if (battleMode === 'typing') return <TypingBattle session={activeSession} isP1={isPlayer1} opponent={opponent} isMuted={isMuted} playSfx={playSfx} onComplete={() => { setBattleMode('none'); setShowVs(false); setActiveSession(null); setOpponent(null); }} />;
    if (battleMode === 'coding') return <CodingBattle session={activeSession} isP1={isPlayer1} opponent={opponent} isMuted={isMuted} playSfx={playSfx} onComplete={() => { setBattleMode('none'); setShowVs(false); setActiveSession(null); setOpponent(null); }} />;
    if (battleMode === 'arcade') return <ArcadeBattle session={activeSession} isP1={isPlayer1} opponent={opponent} char={selectedChar} stage={selectedStage} isMuted={isMuted} playSfx={playSfx} onComplete={() => { setBattleMode('none'); setShowVs(false); setActiveSession(null); setOpponent(null); }} />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 overflow-x-hidden relative">
      <audio ref={themeAudio} src={getThemeTrack()} loop />
      
      {configError ? (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-zinc-900 pixel-border-red p-8 text-center"
          >
            <h2 className="text-2xl text-sf-yellow mb-4 arcade-text-shadow">CONFIG ERROR</h2>
            <p className="text-sm text-white mb-8 leading-relaxed">
              {configError}
            </p>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-black/50 border border-gray-800 text-left">
                <p className="text-[10px] text-sf-red mb-2 uppercase">Required Secrets:</p>
                <ul className="text-[10px] text-gray-400 list-disc list-inside">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
              <p className="text-[8px] text-gray-500 italic">
                Set these in the Settings &gt; Secrets menu to enable multiplayer and profiles.
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Auth Overlay */}
          {!user && renderAuth()}
        </>
      )}

      {/* Navbar */}
      <nav className="w-full max-w-6xl flex justify-between items-center mb-8 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sf-red pixel-border flex items-center justify-center">
            <span className="text-white text-xs">SF</span>
          </div>
          <span className="hidden sm:inline font-display text-3xl text-sf-yellow italic">ARCADE</span>
        </div>

        <div className="hidden md:flex gap-8 text-[10px] text-sf-red uppercase tracking-widest font-arcade">
          {['characters', 'stages', 'moves', 'history'].map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab as any); playSound('select'); }}
              className={`hover:text-white transition-colors ${activeTab === tab ? 'text-white border-b-2 border-sf-yellow' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-sf-yellow pixel-border border-gray-700">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`} 
                className="w-10 h-10 pixel-border border-sf-blue bg-zinc-800"
                alt="Avatar"
              />
              <button onClick={() => supabase.auth.signOut()} className="hidden sm:block text-[8px] text-sf-red hover:text-white">
                LOGOUT
              </button>
            </div>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-sf-yellow pixel-border border-sf-red bg-black">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <section className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {activeTab === 'characters' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-end border-b-4 border-sf-red pb-2">
                  <h2 className="text-lg md:text-xl text-sf-yellow">PLAYER SELECT</h2>
                  <span className="text-[10px] text-gray-500">6 FIGHTERS READY</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-4">
                  {CHARACTERS.map((char) => (
                    <motion.div
                      key={char.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedChar(char); playSound('select'); }}
                      className={`relative aspect-square pixel-border cursor-pointer overflow-hidden group ${
                        selectedChar.id === char.id ? 'border-sf-yellow ring-4 ring-sf-yellow ring-offset-4 ring-offset-black' : 'border-gray-700'
                      }`}
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${char.seed}`} 
                        alt={char.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 bg-zinc-800" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[8px] text-center">{char.name}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'stages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <h2 className="text-xl text-sf-orange border-b-4 border-sf-orange pb-2">STAGE SELECT</h2>
                <div className="grid grid-cols-1 gap-4">
                  {STAGES.map(stage => (
                    <div 
                      key={stage.id}
                      onClick={() => { setSelectedStage(stage); playSound('select'); }}
                      className={`relative h-32 pixel-border cursor-pointer overflow-hidden group ${selectedStage.id === stage.id ? 'border-sf-yellow' : 'border-gray-800'}`}
                    >
                      <img src={stage.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" alt={stage.name} referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-display italic arcade-text-shadow">{stage.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'moves' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 bg-zinc-900 pixel-border border-sf-blue">
                <h2 className="text-xl text-sf-blue mb-6">MOVE LIST: {selectedChar.name}</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-xs text-sf-yellow">SPECIAL: {selectedChar.move}</span>
                    <span className="text-[10px] text-gray-500">↓ ↘ → + PUNCH</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-xs">QUICK PUNCH</span>
                    <span className="text-[10px] text-gray-500">LP</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-xs">HEAVY KICK</span>
                    <span className="text-[10px] text-gray-500">HK</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 bg-zinc-900 pixel-border border-sf-red">
                <h2 className="text-xl text-sf-red mb-4">ARCADE HISTORY</h2>
                <p className="text-xs leading-relaxed text-gray-300">
                  Street Fighter II: The World Warrior is a competitive fighting game developed by Capcom and released for arcades in 1991. 
                  It is the sequel to the 1987 game Street Fighter and the second installment in the Street Fighter series.
                </p>
                <div className="mt-6 flex gap-4">
                  <div className="flex-1 p-4 bg-black border border-gray-800">
                    <span className="text-sf-yellow text-[10px]">RELEASED</span>
                    <p className="text-sm">FEB 1991</p>
                  </div>
                  <div className="flex-1 p-4 bg-black border border-gray-800">
                    <span className="text-sf-yellow text-[10px]">PLATFORM</span>
                    <p className="text-sm">CPS-1</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button onClick={() => startBattle('typing')} className="p-6 bg-zinc-900 pixel-border border-sf-blue hover:bg-sf-blue group transition-all">
              <Keyboard className="text-sf-blue group-hover:text-white mb-2 mx-auto" size={32} />
              <span className="block text-[10px] text-center">TYPING BATTLE</span>
            </button>
            <button onClick={() => startBattle('coding')} className="p-6 bg-zinc-900 pixel-border border-sf-yellow hover:bg-sf-yellow group transition-all">
              <Code className="text-sf-yellow group-hover:text-black mb-2 mx-auto" size={32} />
              <span className="block text-[10px] text-center">CODE CLASH</span>
            </button>
            <button onClick={() => startBattle('arcade')} className="p-6 bg-zinc-900 pixel-border border-sf-red hover:bg-sf-red group transition-all">
              <Gamepad2 className="text-sf-red group-hover:text-white mb-2 mx-auto" size={32} />
              <span className="block text-[10px] text-center">ARCADE FIGHT</span>
            </button>
          </div>
        </section>

        {/* Right Column: Battle Area */}
        <section className="lg:col-span-5 relative min-h-[500px] flex flex-col items-center justify-center bg-zinc-900 pixel-border border-sf-red overflow-hidden order-1 lg:order-2">
          {battleMode === 'none' ? (
            <>
              <div className="absolute inset-0 opacity-30">
                <img src={selectedStage.image} className="w-full h-full object-cover" alt="Stage" referrerPolicy="no-referrer" />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="w-48 h-48 rounded-full border-8 border-sf-yellow flex items-center justify-center animate-pulse bg-black/50">
                  <User size={80} className="text-sf-yellow" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="insert-coin text-sf-red text-xl">INSERT COIN</p>
                  <p className="text-[8px] text-gray-500">CHOOSE A BATTLE MODE TO START</p>
                </div>
                
                {/* Lobby Presence */}
                <div className="mt-8 w-full max-w-xs bg-black/80 p-4 pixel-border border-gray-800">
                  <h4 className="text-[10px] text-sf-yellow mb-4 flex justify-between">
                    <span>ONLINE FIGHTERS ({onlineUsers.length})</span>
                    <span className="animate-pulse">● LIVE</span>
                  </h4>
                  <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {onlineUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between text-[8px] bg-zinc-900/50 p-2 border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <img src={u.avatar} className="w-8 h-8 pixel-border border-gray-700 bg-black" alt="Avatar" />
                            <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black ${u.status === 'PLAYING' ? 'bg-sf-red' : 'bg-green-500'}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className={u.id === user?.id ? 'text-sf-yellow' : 'text-white'}>
                              {u.username} {u.id === user?.id && '(YOU)'}
                            </span>
                            <span className="text-[6px] text-gray-500 uppercase">{u.status || 'LOBBY'}</span>
                          </div>
                        </div>
                        {u.id !== user?.id && u.status !== 'PLAYING' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => sendChallenge(u.id, 'arcade')}
                              className="px-2 py-1 bg-sf-red text-white hover:bg-white hover:text-sf-red transition-all"
                            >
                              FIGHT
                            </button>
                            <button 
                              onClick={() => sendChallenge(u.id, 'typing')}
                              className="px-2 py-1 bg-sf-blue text-white hover:bg-white hover:text-sf-blue transition-all"
                            >
                              TYPE
                            </button>
                          </div>
                        )}
                        {u.status === 'PLAYING' && (
                          <span className="text-sf-red animate-pulse">BATTLE!</span>
                        )}
                      </div>
                    ))}
                    {onlineUsers.length <= 1 && (
                      <p className="text-[8px] text-gray-500 italic text-center py-4">WAITING FOR CHALLENGERS...</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : renderBattle()}
        </section>
      </main>

      <div className="scanline-overlay" />
    </div>
  );
}

// --- Battle Mode Components ---

function TypingBattle({ session, isP1, opponent, isMuted, playSfx, onComplete }: { session?: string, isP1: boolean, opponent?: any, isMuted: boolean, playSfx: PlaySfxFn, onComplete: () => void }) {
  const [text, setText] = useState('');
  const [opponentText, setOpponentText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [youRounds, setYouRounds] = useState(0);
  const [opponentRounds, setOpponentRounds] = useState(0);
  const [roundTimer, setRoundTimer] = useState(25);
  const [roundBanner, setRoundBanner] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const target = TYPING_ROUNDS[round];

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`game-${session}`);
    channelRef.current = channel;
    
    channel
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        if (payload.userId !== (isP1 ? 'p1' : 'p2') && payload.round === round) {
          setOpponentText(payload.text);
        }
      })
      .on('broadcast', { event: 'round-win' }, ({ payload }) => {
        if (payload.userId !== (isP1 ? 'p1' : 'p2') && payload.round === round) {
          applyRoundResult(false, payload.username);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [session, isP1, round]);

  useEffect(() => {
    if (winner || roundBanner) return;
    const timer = window.setInterval(() => {
      setRoundTimer(prev => {
        if (prev <= 1) {
          if (!winner) applyRoundResult(false, opponent?.username || 'CPU');
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [winner, opponent?.username, round, roundBanner]);

  const applyRoundResult = useCallback((didWin: boolean, displayName: string) => {
    const youScore = didWin ? youRounds + 1 : youRounds;
    const oppScore = didWin ? opponentRounds : opponentRounds + 1;
    setYouRounds(youScore);
    setOpponentRounds(oppScore);
    setRoundBanner(`${displayName} TAKES ROUND ${round + 1}`);

    window.setTimeout(() => {
      setRoundBanner(null);
      if (youScore >= ARCADE_ROUNDS_TO_WIN || oppScore >= ARCADE_ROUNDS_TO_WIN || round >= TYPING_ROUNDS.length - 1) {
        const finalWinner = youScore >= oppScore ? 'YOU' : (opponent?.username || 'CPU');
        setWinner(finalWinner);
        if (finalWinner === 'YOU') confetti();
        window.setTimeout(onComplete, 3600);
        return;
      }
      setRound(prev => prev + 1);
      setText('');
      setOpponentText('');
      setStartTime(null);
      setWpm(0);
      setRoundTimer(25);
    }, 1600);
  }, [youRounds, opponentRounds, round, opponent?.username, onComplete]);

  useEffect(() => {
    if (winner || roundBanner) return;
    if (text === target && target.length > 0) {
      const time = (Date.now() - (startTime || 0)) / 1000 / 60;
      const calculatedWpm = Math.round(target.split(' ').length / time);
      setWpm(calculatedWpm);
      applyRoundResult(true, 'YOU');

      if (session && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'round-win',
          payload: { username: 'YOU', userId: isP1 ? 'p1' : 'p2', round }
        });
      }
    }

    if (session && text.length > 0 && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'progress',
        payload: { userId: isP1 ? 'p1' : 'p2', text, round }
      });
    }
  }, [text, winner, roundBanner, target, startTime, applyRoundResult, session, isP1, round]);

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 bg-black/80">
      <h2 className="text-sf-yellow text-xl mb-4 arcade-text-shadow italic">TYPING BATTLE</h2>
      <p className="text-[10px] text-sf-blue mb-3">ROUND {round + 1}/{TYPING_ROUNDS.length} • FIRST TO {ARCADE_ROUNDS_TO_WIN}</p>
      <div className="w-full max-w-xl h-3 bg-zinc-900 border border-sf-red mb-6">
        <div className="h-full bg-sf-red transition-all" style={{ width: `${(roundTimer / 25) * 100}%` }} />
      </div>
      
      {opponent && (
        <div className="w-full mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-sf-blue">
              <span>YOU</span>
              <span>{Math.round((text.length / target.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-800 border border-sf-blue">
              <div className="h-full bg-sf-blue transition-all" style={{ width: `${(text.length / target.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-sf-red">
              <span>{opponent.username}</span>
              <span>{Math.round((opponentText.length / target.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-800 border border-sf-red">
              <div className="h-full bg-sf-red transition-all" style={{ width: `${(opponentText.length / target.length) * 100}%` }} />
            </div>
            <p className="text-[6px] text-gray-500 truncate font-mono">{opponentText || 'Waiting...'}</p>
          </div>
        </div>
      )}

      <div className="w-full p-6 bg-zinc-900 pixel-border border-sf-blue mb-8">
        <p className="text-sm text-gray-400 mb-4">TYPE THE COMBO:</p>
        <p className="text-lg font-arcade text-white break-all">
          {target.split('').map((char, i) => (
            <span key={i} className={i < text.length ? 'text-sf-yellow' : 'text-zinc-700'}>
              {char}
            </span>
          ))}
        </p>
      </div>
      <input 
        autoFocus
        disabled={!!winner || !!roundBanner}
        value={text}
        onChange={(e) => {
          if (!startTime) setStartTime(Date.now());
          if (target.startsWith(e.target.value)) {
            setText(e.target.value);
            if (!isMuted) playSfx('typing-input', AUDIO_CONFIG.ACTION_TYPING, 0.08);
          }
        }}
        className="w-full bg-black border-4 border-sf-yellow p-4 text-white font-arcade outline-none"
        placeholder="START TYPING..."
      />
      <div className="mt-4 flex items-center gap-5 text-[10px]">
        <span className="text-sf-yellow">YOU: {youRounds}</span>
        <span className="text-sf-red">{opponent?.username || 'CPU'}: {opponentRounds}</span>
        {wpm > 0 && <span className="text-white">WPM: {wpm}</span>}
      </div>
      {roundBanner && <p className="mt-4 text-sf-blue text-lg animate-pulse">{roundBanner}</p>}
      {winner && <p className="mt-4 text-sf-red text-xl animate-bounce">{winner} WINS THE MATCH!</p>}
    </div>
  );
}

function CodingBattle({ session, isP1, opponent, isMuted, playSfx, onComplete }: { session?: string, isP1: boolean, opponent?: any, isMuted: boolean, playSfx: PlaySfxFn, onComplete: () => void }) {
  const [code, setCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [youRounds, setYouRounds] = useState(0);
  const [opponentRounds, setOpponentRounds] = useState(0);
  const [roundTimer, setRoundTimer] = useState(40);
  const [roundBanner, setRoundBanner] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const target = CODING_ROUNDS[round];

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`game-${session}`);
    channelRef.current = channel;
    
    channel
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        if (payload.userId !== (isP1 ? 'p1' : 'p2') && payload.round === round) {
          setOpponentCode(payload.code);
        }
      })
      .on('broadcast', { event: 'round-win' }, ({ payload }) => {
        if (payload.userId !== (isP1 ? 'p1' : 'p2') && payload.round === round) {
          applyRoundResult(false, payload.username);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [session, isP1, round]);

  useEffect(() => {
    if (winner || roundBanner) return;
    const timer = window.setInterval(() => {
      setRoundTimer(prev => {
        if (prev <= 1) {
          applyRoundResult(false, opponent?.username || 'CPU');
          return 40;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [winner, opponent?.username, round, roundBanner]);

  const applyRoundResult = useCallback((didWin: boolean, displayName: string) => {
    const youScore = didWin ? youRounds + 1 : youRounds;
    const oppScore = didWin ? opponentRounds : opponentRounds + 1;
    setYouRounds(youScore);
    setOpponentRounds(oppScore);
    setRoundBanner(`${displayName} TAKES ROUND ${round + 1}`);

    window.setTimeout(() => {
      setRoundBanner(null);
      if (youScore >= ARCADE_ROUNDS_TO_WIN || oppScore >= ARCADE_ROUNDS_TO_WIN || round >= CODING_ROUNDS.length - 1) {
        const finalWinner = youScore >= oppScore ? 'YOU' : (opponent?.username || 'CPU');
        setWinner(finalWinner);
        if (finalWinner === 'YOU') confetti();
        window.setTimeout(onComplete, 3600);
        return;
      }
      setRound(prev => prev + 1);
      setCode('');
      setOpponentCode('');
      setRoundTimer(40);
    }, 1700);
  }, [youRounds, opponentRounds, round, opponent?.username, onComplete]);

  useEffect(() => {
    if (winner || roundBanner) return;
    const cleanCode = code.trim().replace(/\s+/g, ' ');
    const cleanTarget = target.trim().replace(/\s+/g, ' ');
    
    if (cleanCode === cleanTarget) {
      applyRoundResult(true, 'YOU');
      if (!isMuted) playSfx('coding-win', AUDIO_CONFIG.ACTION_TYPING, 0.15);
      if (session && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'round-win',
          payload: { username: 'YOU', userId: isP1 ? 'p1' : 'p2', round }
        });
      }
    }

    if (session && code.length > 0 && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'progress',
        payload: { userId: isP1 ? 'p1' : 'p2', code, round }
      });
    }
  }, [code, winner, roundBanner, target, applyRoundResult, session, isP1, round, isMuted, playSfx]);

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 bg-black/80">
      <h2 className="text-sf-yellow text-xl mb-4 arcade-text-shadow italic">CODE CLASH</h2>
      <p className="text-[10px] text-sf-blue mb-3">ROUND {round + 1}/{CODING_ROUNDS.length} • FIRST TO {ARCADE_ROUNDS_TO_WIN}</p>
      <div className="w-full max-w-xl h-3 bg-zinc-900 border border-sf-red mb-6">
        <div className="h-full bg-sf-blue transition-all" style={{ width: `${(roundTimer / 40) * 100}%` }} />
      </div>
      
      {opponent && (
        <div className="w-full mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-sf-yellow">
              <span>YOU</span>
              <span>{Math.round((code.length / target.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-800 border border-sf-yellow">
              <div className="h-full bg-sf-yellow transition-all" style={{ width: `${(code.length / target.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-sf-red">
              <span>{opponent.username}</span>
              <span>{Math.round((opponentCode.length / target.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-800 border border-sf-red">
              <div className="h-full bg-sf-red transition-all" style={{ width: `${(opponentCode.length / target.length) * 100}%` }} />
            </div>
            <p className="text-[6px] text-gray-500 truncate font-mono">{opponentCode || 'Waiting...'}</p>
          </div>
        </div>
      )}

      <div className="w-full p-6 bg-zinc-900 pixel-border border-sf-yellow mb-8">
        <p className="text-xs text-gray-400 mb-4">IMPLEMENT THE SPECIAL MOVE:</p>
        <code className="text-xs text-sf-yellow">{target}</code>
      </div>
      <textarea 
        autoFocus
        disabled={!!winner || !!roundBanner}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-32 bg-black border-4 border-sf-blue p-4 text-white font-mono text-xs outline-none"
        placeholder="// Write code here..."
      />
      <div className="mt-4 flex items-center gap-5 text-[10px]">
        <span className="text-sf-yellow">YOU: {youRounds}</span>
        <span className="text-sf-red">{opponent?.username || 'CPU'}: {opponentRounds}</span>
      </div>
      {roundBanner && <p className="mt-4 text-sf-blue text-lg animate-pulse">{roundBanner}</p>}
      {winner && <p className="mt-4 text-sf-red text-xl animate-bounce">{winner} WINS THE MATCH!</p>}
    </div>
  );
}

function ArcadeBattle({ session, isP1, opponent, char, stage, isMuted, playSfx, onComplete }: { session?: string, isP1: boolean, opponent?: any, char: any, stage: any, isMuted: boolean, playSfx: PlaySfxFn, onComplete: () => void }) {
  type Action = 'idle' | 'left' | 'right' | 'punch' | 'kick' | 'special' | 'block' | 'jump';
  type Fighter = { x: number; hp: number; action: Action; blocking: boolean };
  const [p1, setP1] = useState<Fighter>({ x: 18, hp: 100, action: 'idle', blocking: false });
  const [p2, setP2] = useState<Fighter>({ x: 72, hp: 100, action: 'idle', blocking: false });
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(ARCADE_ROUND_TIME);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [roundBanner, setRoundBanner] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const resolvingRoundRef = useRef(false);
  const p1Cooldown = useRef(0);
  const p2Cooldown = useRef(0);
  const isCpuMode = !session && !opponent;
  const localSide = isP1 ? 'p1' : 'p2';

  const resetRound = useCallback(() => {
    setP1({ x: 18, hp: 100, action: 'idle', blocking: false });
    setP2({ x: 72, hp: 100, action: 'idle', blocking: false });
    setTimer(ARCADE_ROUND_TIME);
  }, []);

  const concludeRound = useCallback((winningSide: 'p1' | 'p2') => {
    if (resolvingRoundRef.current) return;
    resolvingRoundRef.current = true;

    const nextScore = {
      p1: score.p1 + (winningSide === 'p1' ? 1 : 0),
      p2: score.p2 + (winningSide === 'p2' ? 1 : 0),
    };
    setScore(nextScore);

    if (!isMuted) playSfx('round-ko', AUDIO_CONFIG.ACTION_KO, 0.45);

    const displayName = winningSide === 'p1' ? (localSide === 'p1' ? 'YOU' : (opponent?.username || 'CPU')) : (localSide === 'p2' ? 'YOU' : (opponent?.username || 'CPU'));
    setRoundBanner(`${displayName} TAKES ROUND ${round}`);

    if (session && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'round-win',
        payload: { winningSide, round }
      });
    }

    window.setTimeout(() => {
      setRoundBanner(null);
      if (nextScore.p1 >= ARCADE_ROUNDS_TO_WIN || nextScore.p2 >= ARCADE_ROUNDS_TO_WIN) {
        const matchWinnerSide = nextScore.p1 > nextScore.p2 ? 'p1' : 'p2';
        const name = matchWinnerSide === localSide ? 'YOU' : (opponent?.username || 'CPU');
        setWinner(name);
        if (name === 'YOU') confetti();
        window.setTimeout(onComplete, 3800);
        return;
      }
      setRound(prev => prev + 1);
      resetRound();
      resolvingRoundRef.current = false;
    }, 1900);
  }, [score, localSide, opponent?.username, round, session, isMuted, onComplete, resetRound]);

  const applyDamage = useCallback((targetSide: 'p1' | 'p2', rawDamage: number) => {
    if (targetSide === 'p1') {
      setP1(prev => {
        const damage = prev.blocking ? Math.ceil(rawDamage * 0.3) : rawDamage;
        const hp = clamp(prev.hp - damage, 0, 100);
        if (hp === 0 && !roundBanner) concludeRound('p2');
        return { ...prev, hp };
      });
      return;
    }
    setP2(prev => {
      const damage = prev.blocking ? Math.ceil(rawDamage * 0.3) : rawDamage;
      const hp = clamp(prev.hp - damage, 0, 100);
      if (hp === 0 && !roundBanner) concludeRound('p1');
      return { ...prev, hp };
    });
  }, [concludeRound, roundBanner]);

  const performAction = useCallback((side: 'p1' | 'p2', action: Action, shouldBroadcast = true) => {
    if (winner || roundBanner) return;

    const now = Date.now();
    const actor = side === 'p1' ? p1 : p2;
    const target = side === 'p1' ? p2 : p1;
    const cooldownRef = side === 'p1' ? p1Cooldown : p2Cooldown;

    if (action === 'left' || action === 'right') {
      const delta = action === 'left' ? -4 : 4;
      const updated = { ...actor, action, x: clamp(actor.x + delta, 2, 86), blocking: false };
      side === 'p1' ? setP1(updated) : setP2(updated);
    }

    if (action === 'block') {
      const updated = { ...actor, action, blocking: true };
      side === 'p1' ? setP1(updated) : setP2(updated);
    }

    if (action === 'jump') {
      const updated = { ...actor, action, blocking: false };
      side === 'p1' ? setP1(updated) : setP2(updated);
      window.setTimeout(() => {
        side === 'p1'
          ? setP1(prev => ({ ...prev, action: prev.blocking ? 'block' : 'idle' }))
          : setP2(prev => ({ ...prev, action: prev.blocking ? 'block' : 'idle' }));
      }, 300);
    }

    if (action === 'punch' || action === 'kick' || action === 'special') {
      if (now - cooldownRef.current < 360) return;
      cooldownRef.current = now;

      const damage = action === 'punch' ? 9 : action === 'kick' ? 14 : 20;
      const range = action === 'punch' ? 14 : action === 'kick' ? 18 : 26;
      const distance = Math.abs(actor.x - target.x);
      const updated = { ...actor, action, blocking: false };
      side === 'p1' ? setP1(updated) : setP2(updated);

      if (!isMuted) {
        const soundUrl = action === 'special' ? AUDIO_CONFIG.ACTION_SPECIAL : action === 'kick' ? AUDIO_CONFIG.ACTION_KICK : AUDIO_CONFIG.ACTION_PUNCH;
        playSfx(`arcade-${action}`, soundUrl, action === 'special' ? 0.5 : 0.35);
      }

      if (distance <= range) {
        applyDamage(side === 'p1' ? 'p2' : 'p1', damage);
      }

      window.setTimeout(() => {
        side === 'p1'
          ? setP1(prev => ({ ...prev, action: prev.blocking ? 'block' : 'idle' }))
          : setP2(prev => ({ ...prev, action: prev.blocking ? 'block' : 'idle' }));
      }, 260);
    }

    if (shouldBroadcast && session && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'action',
        payload: { side, action }
      });
    }
  }, [p1, p2, winner, roundBanner, isMuted, applyDamage, session, playSfx]);

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`game-${session}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'action' }, ({ payload }) => {
        if (payload.side !== localSide) performAction(payload.side, payload.action, false);
      })
      .on('broadcast', { event: 'round-win' }, ({ payload }) => {
        if (!roundBanner && payload.round === round) concludeRound(payload.winningSide);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [session, localSide, performAction, concludeRound, roundBanner, round]);

  useEffect(() => {
    if (winner || roundBanner) return;
    const countdown = window.setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (p1.hp === p2.hp) concludeRound(localSide === 'p1' ? 'p1' : 'p2');
          else concludeRound(p1.hp > p2.hp ? 'p1' : 'p2');
          return ARCADE_ROUND_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [winner, roundBanner, p1.hp, p2.hp, concludeRound, localSide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (winner || roundBanner) return;
      if (e.key === 'ArrowLeft') performAction(localSide, 'left');
      if (e.key === 'ArrowRight') performAction(localSide, 'right');
      if (e.key === 'a' || e.key === 'A') performAction(localSide, 'punch');
      if (e.key === 's' || e.key === 'S') performAction(localSide, 'kick');
      if (e.key === 'f' || e.key === 'F') performAction(localSide, 'special');
      if (e.key === ' ' || e.code === 'Space') performAction(localSide, 'jump');
      if (e.key === 'd' || e.key === 'D') performAction(localSide, 'block');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && !winner) {
        if (localSide === 'p1') setP1(prev => ({ ...prev, blocking: false, action: 'idle' }));
        else setP2(prev => ({ ...prev, blocking: false, action: 'idle' }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [performAction, localSide, winner, roundBanner]);

  useEffect(() => {
    if (!isCpuMode || winner || roundBanner) return;
    const aiLoop = window.setInterval(() => {
      const distance = Math.abs(p2.x - p1.x);
      if (distance > 20) {
        performAction('p2', p2.x > p1.x ? 'left' : 'right', false);
        return;
      }
      const roll = Math.random();
      if (roll < 0.2) performAction('p2', 'block', false);
      else if (roll < 0.45) performAction('p2', 'punch', false);
      else if (roll < 0.75) performAction('p2', 'kick', false);
      else performAction('p2', 'special', false);
    }, 520);
    return () => window.clearInterval(aiLoop);
  }, [isCpuMode, winner, roundBanner, p1.x, p2.x, performAction]);

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-4 bg-black/80 overflow-hidden">
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <img src={stage?.image} className="w-full h-full object-cover" alt="Stage" referrerPolicy="no-referrer" />
      </div>
      <div className="relative z-10 w-full flex justify-between items-center px-4 pt-4">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[8px] text-sf-yellow">
            <span>YOU</span>
            <span>{localSide === 'p1' ? p1.hp : p2.hp}%</span>
          </div>
          <div className="h-4 bg-gray-800 pixel-border border-sf-yellow overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-sf-yellow to-sf-orange" animate={{ width: `${localSide === 'p1' ? p1.hp : p2.hp}%` }} />
          </div>
        </div>
        <div className="mx-4 text-center">
          <div className="text-sf-red font-display italic text-2xl arcade-text-shadow">VS</div>
          <div className="text-[10px] text-white">{timer}</div>
          <div className="text-[9px] text-sf-blue">R{round}</div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[8px] text-sf-red">
            <span>{opponent?.username || 'CPU'}</span>
            <span>{localSide === 'p1' ? p2.hp : p1.hp}%</span>
          </div>
          <div className="h-4 bg-gray-800 pixel-border border-sf-red overflow-hidden">
            <motion.div className="h-full bg-gradient-to-l from-sf-red to-sf-orange" animate={{ width: `${localSide === 'p1' ? p2.hp : p1.hp}%` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-2 text-[9px] text-sf-yellow">
        SCORE {localSide === 'p1' ? score.p1 : score.p2} - {localSide === 'p1' ? score.p2 : score.p1}
      </div>

      <div className="relative z-10 w-full flex-1 mt-4 border-b-8 border-zinc-800">
        <motion.div
          className="absolute bottom-0 w-24 h-32 flex flex-col items-center"
          animate={{ left: `${p1.x}%`, scale: p1.action === 'special' ? 1.15 : p1.action === 'jump' ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <img
            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${char.seed}`}
            className={`w-full h-full bg-zinc-900 pixel-border border-sf-blue ${p1.blocking ? 'brightness-75' : ''} ${p1.action === 'punch' || p1.action === 'kick' ? 'translate-x-4' : ''}`}
            alt="P1"
          />
          <div className="absolute -top-6 text-[8px] text-sf-blue bg-black px-1">{p1.action.toUpperCase()}</div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 w-24 h-32 flex flex-col items-center"
          animate={{ left: `${p2.x}%`, scale: p2.action === 'special' ? 1.15 : p2.action === 'jump' ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <img
            src={opponent?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=cpu`}
            className={`w-full h-full bg-zinc-900 pixel-border border-sf-red scale-x-[-1] ${p2.blocking ? 'brightness-75' : ''} ${p2.action === 'punch' || p2.action === 'kick' ? '-translate-x-4' : ''}`}
            alt="P2"
          />
          <div className="absolute -top-6 text-[8px] text-sf-red bg-black px-1">{p2.action.toUpperCase()}</div>
        </motion.div>
      </div>

      <div className="relative z-10 w-full flex justify-between items-center p-4 text-[8px] text-gray-400">
        <div className="flex gap-3">
          <span>ARROWS: MOVE</span>
          <span>A: PUNCH</span>
          <span>S: KICK</span>
          <span>F: SPECIAL</span>
          <span>D: BLOCK</span>
          <span>SPACE: JUMP</span>
        </div>
        {roundBanner && <div className="text-sf-blue text-sm animate-pulse">{roundBanner}</div>}
        {winner && <div className="text-sf-yellow text-lg animate-bounce">{winner} WINS MATCH!</div>}
      </div>
    </div>
  );
}
