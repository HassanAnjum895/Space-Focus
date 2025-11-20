import React, { useState, useEffect } from 'react';
import { TimerMode, DEFAULT_TIMES, TimerSettings } from '../types';

const Timer: React.FC = () => {
  // Load settings from local storage or use defaults
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('cosmos-timer-settings');
    return saved ? JSON.parse(saved) : DEFAULT_TIMES;
  });

  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState<number>(settings[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings);

  // Save settings to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cosmos-timer-settings', JSON.stringify(settings));
  }, [settings]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode]);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode]);
  };

  const openSettings = () => {
    setTempSettings(settings);
    setShowSettings(true);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
    // If the timer isn't running, update the display immediately to reflect changes.
    if (!isActive) {
      setTimeLeft(tempSettings[mode]);
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notification here if desired
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress circle calculation
  const totalTime = settings[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  // SVG viewBox is 0 0 256 256. Center is 128, 128.
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-md mx-auto">
      <div className="flex space-x-2 mb-8 bg-slate-800/50 p-1 rounded-xl">
        {Object.values(TimerMode).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              mode === m
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center mb-8 w-64 h-64">
        {/* SVG Progress Circle */}
        <svg 
            className="transform -rotate-90 w-full h-full" 
            viewBox="0 0 256 256"
        >
            <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-800"
            />
            <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
                mode === TimerMode.FOCUS ? 'text-indigo-400' : 'text-emerald-400'
            }`}
            />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-light font-display tracking-wider text-white">
            {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className="w-32 py-3 rounded-xl font-semibold tracking-wide bg-white text-slate-900 hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 duration-200"
        >
          {isActive ? 'PAUSE' : 'START'}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors active:scale-95 duration-200"
          aria-label="Reset Timer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={openSettings}
          className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors active:scale-95 duration-200"
          aria-label="Settings"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl transition-all animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-64 shadow-2xl">
                <h3 className="text-lg font-display font-medium text-white mb-4 text-center">Timer Settings</h3>
                
                <div className="space-y-3 mb-6">
                    {Object.values(TimerMode).map((m) => (
                        <div key={m}>
                            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{m}</label>
                            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-3 py-2 focus-within:border-indigo-500 transition-colors">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="120"
                                    value={Math.floor(tempSettings[m] / 60)}
                                    onChange={(e) => {
                                        const val = Math.max(1, parseInt(e.target.value) || 0);
                                        setTempSettings({...tempSettings, [m]: val * 60});
                                    }}
                                    className="bg-transparent w-full text-white outline-none text-sm font-mono"
                                />
                                <span className="text-slate-500 text-xs ml-2">min</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex space-x-2">
                    <button 
                        onClick={saveSettings}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Save
                    </button>
                    <button 
                        onClick={closeSettings}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Timer;