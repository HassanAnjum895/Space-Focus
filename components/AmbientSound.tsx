
import React, { useState, useEffect, useRef } from 'react';

type SoundType = 'starship-deck' | 'lunar-winds' | 'cosmic-rain';

interface SoundOption {
  id: SoundType;
  label: string;
  description: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'starship-deck', label: 'Starship Deck', description: 'Deep engine rumble (Brown Noise)' },
  { id: 'lunar-winds', label: 'Lunar Winds', description: 'Hollow air flow (Pink Noise)' },
  { id: 'cosmic-rain', label: 'Cosmic Rain', description: 'Static interference (White Noise)' },
];

const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundType>('starship-deck');
  const [volume, setVolume] = useState(0.5); // Default higher as noise is quieter than oscillators
  const [showMenu, setShowMenu] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);
    }
  }, [volume]);

  const stopCurrentNodes = () => {
    sourceNodesRef.current.forEach(node => {
        try {
            if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
                node.stop();
            }
            node.disconnect();
        } catch (e) {}
    });
    sourceNodesRef.current = [];
  };

  // Shared helper to create a 2-second buffer of white noise
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playSound = (type: SoundType) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    stopCurrentNodes();

    if (!masterGainRef.current) {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
    }

    // Smooth fade in
    masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
    masterGainRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    const dest = masterGainRef.current;

    // Use noise shaping for all sounds now, as it's better for focus than pure oscillators
    if (type === 'starship-deck') playStarshipDeck(ctx, dest);
    else if (type === 'lunar-winds') playLunarWinds(ctx, dest);
    else playCosmicRain(ctx, dest);

    setIsPlaying(true);
  };

  const stopSound = () => {
    if (masterGainRef.current && audioContextRef.current) {
      // Smooth fade out
      masterGainRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
      setTimeout(() => { stopCurrentNodes(); setIsPlaying(false); }, 500);
    } else setIsPlaying(false);
  };

  // 1. STARSHIP DECK: Brown Noise (Deep Low Pass)
  const playStarshipDeck = (ctx: AudioContext, dest: AudioNode) => {
    const buffer = createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Multiple lowpass filters in series to approximate -6dB/octave slope of Brown Noise
    // This creates that "underwater" or "heavy machinery" sound
    const lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.frequency.value = 120; // Very low cutoff for rumble

    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.frequency.value = 120;

    const gain = ctx.createGain();
    gain.gain.value = 2.5; // Brown noise needs boost after filtering

    source.connect(lp1);
    lp1.connect(lp2);
    lp2.connect(gain);
    gain.connect(dest);
    
    source.start();
    sourceNodesRef.current.push(source, lp1, lp2, gain);
  };

  // 2. LUNAR WINDS: Band-passed Pink-ish Noise
  const playLunarWinds = (ctx: AudioContext, dest: AudioNode) => {
    const buffer = createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Highpass to remove mud, Lowpass to remove hiss
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 200;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;

    const gain = ctx.createGain();
    gain.gain.value = 1.2;

    source.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(dest);

    source.start();
    sourceNodesRef.current.push(source, hp, lp, gain);
  };

  // 3. COSMIC RAIN: Low-passed White Noise (Kept as per request)
  const playCosmicRain = (ctx: AudioContext, dest: AudioNode) => {
    const buffer = createNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Original setting
    
    const g = ctx.createGain();
    g.gain.value = 0.8;
    
    noise.connect(filter);
    filter.connect(g);
    g.connect(dest);
    
    noise.start();
    sourceNodesRef.current.push(noise, filter, g);
  };

  useEffect(() => {
    return () => { stopCurrentNodes(); if (audioContextRef.current) audioContextRef.current.close(); };
  }, []);

  return (
    <div className="relative ambient-sound-container z-50">
        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-full p-0.5">
            <button 
                onClick={() => isPlaying ? stopSound() : playSound(selectedSound)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${isPlaying ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-400 hover:text-white'}`}
            >
                {isPlaying ? <div className="flex items-end space-x-0.5 h-4 w-4 justify-center overflow-hidden"><div className="w-1 bg-current animate-pulse h-[60%]"></div><div className="w-1 bg-current animate-pulse h-[100%]"></div><div className="w-1 bg-current animate-pulse h-[40%]"></div></div> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                <span className="text-xs font-medium uppercase tracking-wider">{isPlaying ? 'On Air' : 'Muted'}</span>
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full text-slate-400 hover:text-white"><svg className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
        </div>

        {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-3 space-y-3">
                <div className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atmosphere</div>
                {SOUND_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => { setSelectedSound(opt.id); if (isPlaying) playSound(opt.id); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSound === opt.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                        <div className="font-medium">{opt.label}</div>
                        <div className={`text-xs ${selectedSound === opt.id ? 'text-indigo-200' : 'text-slate-500'}`}>{opt.description}</div>
                    </button>
                ))}
                <div className="pt-2 px-1 border-t border-white/5">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-2"><span>Volume</span><span>{Math.round(volume * 100)}%</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
            </div>
        )}
    </div>
  );
};

export default AmbientSound;
