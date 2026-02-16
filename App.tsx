
import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import QuoteGenerator from './components/QuoteGenerator';
import AmbientSound from './components/AmbientSound';
import ShootingStars from './components/ShootingStars';
import StarryBackground from './components/StarryBackground';
import Auth from './components/Auth';
import MissionLogs from './components/MissionLogs';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWarpSpeed, setIsWarpSpeed] = useState(false);
  const [lightYears, setLightYears] = useState(() => {
    const saved = localStorage.getItem('cosmos-ly');
    return saved ? parseInt(saved) : 0;
  });
  const [activeMissions, setActiveMissions] = useState(0);
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('cosmos-streak');
    return saved ? parseInt(saved) : 0;
  });
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Single source of truth for auth state to prevent race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Initial check (in case event doesn't fire immediately)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionComplete = (mins: number) => {
    const newLy = lightYears + mins;
    setLightYears(newLy);
    localStorage.setItem('cosmos-ly', newLy.toString());

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('cosmos-last-date');
    let currentStreak = parseInt(localStorage.getItem('cosmos-streak') || '0');

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      
      setStreak(currentStreak);
      localStorage.setItem('cosmos-streak', currentStreak.toString());
      localStorage.setItem('cosmos-last-date', today);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090A0F] text-slate-400">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
           <p className="text-xs uppercase tracking-[0.2em] animate-pulse">Loading Systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <StarryBackground isWarpSpeed={isWarpSpeed} />
      <ShootingStars frequencyMultiplier={isWarpSpeed ? 3 : 1} />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {!session ? (
           <Auth />
        ) : (
          <>
            <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight font-display text-white">SPACE FOCUS</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 relative">
                    <div className="flex items-center group cursor-help">
                      <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-medium">{lightYears} LY TRAVELED</span>
                      <button 
                        onMouseEnter={() => setShowInfo(true)} 
                        onMouseLeave={() => setShowInfo(false)}
                        className="ml-1.5 text-indigo-500/50 hover:text-indigo-400"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      </button>
                      {showInfo && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-900 border border-white/10 rounded-lg shadow-2xl z-50 w-48 text-[10px] leading-relaxed text-slate-300 animate-in fade-in zoom-in-95 duration-200">
                          <p className="font-bold text-indigo-300 uppercase mb-1">Logistics Legend</p>
                          1 Minute of Focus = 1 Light Year. This tracks your cumulative progress through the deep void of productivity.
                        </div>
                      )}
                    </div>
                    
                    <span className={`text-[10px] uppercase tracking-widest font-medium ${activeMissions === 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {activeMissions} MISSION{activeMissions !== 1 ? 'S' : ''} ACTIVE
                    </span>

                    {streak > 0 && (
                      <span className="text-[10px] text-orange-400 uppercase tracking-widest font-bold flex items-center">
                        <span className="mr-1">🔥</span> {streak} DAY STREAK
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-6">
                <AmbientSound />
                <div className="hidden sm:block h-8 w-px bg-white/10"></div>
                <button 
                  onClick={handleLogout}
                  className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Abort / Logout
                </button>
              </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 xl:col-span-8">
                 <div className="h-full flex flex-col gap-6">
                    <Timer onSessionComplete={handleSessionComplete} onStateChange={setIsWarpSpeed} />
                    <div className="flex-1 min-h-[200px]"><QuoteGenerator /></div>
                 </div>
              </div>
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                <div className="h-[500px]">
                  {/* Now passing userId to enable Supabase syncing */}
                  <TodoList userId={session.user.id} onTasksUpdated={setActiveMissions} />
                </div>
                <div>
                  <MissionLogs userId={session.user.id} />
                </div>
              </div>
            </main>
          </>
        )}
        
        <footer className="text-center text-slate-600 text-sm py-8">
          <p>© {new Date().getFullYear()} Cosmos Focus. Maintain course, Captain.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
