import React, { useState, useEffect, useRef } from 'react';

type SoundType = 'deep-space' | 'alpha-waves' | 'cosmic-rain';

interface SoundOption {
  id: SoundType;
  label: string;
  description: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'deep-space', label: 'Deep Space', description: 'Low frequency drone' },
  { id: 'alpha-waves', label: 'Alpha Focus', description: 'Binaural beats (10Hz)' },
  { id: 'cosmic-rain', label: 'Cosmic Rain', description: 'Filtered static noise' },
];

const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundType>('deep-space');
  const [showMenu, setShowMenu] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]); // Keep track of oscillators/buffers

  // Initialize Audio Context lazily
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const stopCurrentNodes = () => {
    sourceNodesRef.current.forEach(node => {
        try {
            if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
                node.stop();
            }
            node.disconnect();
        } catch (e) {
            // Ignore errors if already stopped
        }
    });
    sourceNodesRef.current = [];
  };

  const playSound = (type: SoundType) => {
    const ctx = initAudioContext();
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop any existing sounds first
    stopCurrentNodes();

    // Create Master Gain if needed
    if (!masterGainRef.current) {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
    }

    // Fade in
    masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
    masterGainRef.current.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);

    const destination = masterGainRef.current;

    switch (type) {
      case 'deep-space':
        playDeepSpace(ctx, destination);
        break;
      case 'alpha-waves':
        playAlphaWaves(ctx, destination);
        break;
      case 'cosmic-rain':
        playCosmicRain(ctx, destination);
        break;
    }

    setIsPlaying(true);
  };

  const stopSound = () => {
    if (masterGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      // Fade out
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      
      setTimeout(() => {
        stopCurrentNodes();
        setIsPlaying(false);
      }, 500);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(selectedSound);
    }
  };

  const handleSelectSound = (soundId: SoundType) => {
    setSelectedSound(soundId);
    setShowMenu(false);
    if (isPlaying) {
      // Seamless switch: playSound handles stopping previous nodes
      playSound(soundId); 
    }
  };

  // --- Generators ---

  const playDeepSpace = (ctx: AudioContext, dest: AudioNode) => {
    const freqs = [55, 110, 112, 165]; 
    const types: OscillatorType[] = ['sine', 'sine', 'triangle', 'sine'];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = types[i];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Detune effect
      if (i === 2) { 
         osc.detune.setValueAtTime(0, ctx.currentTime);
         osc.detune.linearRampToValueAtTime(15, ctx.currentTime + 10);
      }

      // Individual gain for balance
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      sourceNodesRef.current.push(osc);
      sourceNodesRef.current.push(gain);
    });
  };

  const playAlphaWaves = (ctx: AudioContext, dest: AudioNode) => {
    // Binaural Beat: 200Hz (Left) vs 210Hz (Right) = 10Hz Alpha Wave
    // Since we output to a single destination mostly, we rely on interference beats.
    
    const baseFreq = 200;
    const beatFreq = 10; // Alpha range (8-12Hz)

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = baseFreq;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq + beatFreq;

    // Soften them
    const gain = ctx.createGain();
    gain.gain.value = 0.3;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start();
    osc2.start();

    sourceNodesRef.current.push(osc1, osc2, gain);
  };

  const playCosmicRain = (ctx: AudioContext, dest: AudioNode) => {
    // Create buffer for white noise
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it "Brown/Pink" noise (Rain-like)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low cutoff for deep rumble

    const gain = ctx.createGain();
    gain.gain.value = 0.8;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    
    noise.start();

    sourceNodesRef.current.push(noise, filter, gain);
  };


  // Cleanup
  useEffect(() => {
    return () => {
      stopCurrentNodes();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.ambient-sound-container')) {
            setShowMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="relative ambient-sound-container z-50">
        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-full p-0.5 transition-all hover:bg-slate-700/50">
            
            {/* Toggle Button */}
            <button 
                onClick={togglePlayback}
                className={`
                    flex items-center justify-center space-x-2 px-4 py-2 rounded-full 
                    transition-all duration-300
                    ${isPlaying 
                    ? 'bg-indigo-500/20 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                    : 'text-slate-400 hover:text-white'
                    }
                `}
                title={isPlaying ? "Stop Audio" : "Play Audio"}
            >
                {isPlaying ? (
                    <div className="flex items-end space-x-0.5 h-4 w-4 justify-center overflow-hidden">
                        <div className="w-1 bg-current animate-[pulse_1s_ease-in-out_infinite] h-[60%]"></div>
                        <div className="w-1 bg-current animate-[pulse_1.5s_ease-in-out_infinite_0.2s] h-[100%]"></div>
                        <div className="w-1 bg-current animate-[pulse_1.2s_ease-in-out_infinite_0.4s] h-[40%]"></div>
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                )}
                <span className="text-xs font-medium tracking-wider uppercase whitespace-nowrap w-20 text-left">
                    {isPlaying ? 'On Air' : 'Audio Off'}
                </span>
            </button>

            {/* Separator */}
            <div className="w-px h-4 bg-slate-600 mx-1"></div>

            {/* Menu Trigger */}
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-3 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Atmosphere</div>
                    {SOUND_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelectSound(option.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                selectedSound === option.id 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <div>
                                <div className="font-medium">{option.label}</div>
                                <div className={`text-xs ${selectedSound === option.id ? 'text-indigo-200' : 'text-slate-500'}`}>{option.description}</div>
                            </div>
                            {selectedSound === option.id && (
                                <span className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default AmbientSound;