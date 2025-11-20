import React from 'react';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import QuoteGenerator from './components/QuoteGenerator';
import AmbientSound from './components/AmbientSound';
import ShootingStars from './components/ShootingStars';
import StarryBackground from './components/StarryBackground';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Layers */}
      <StarryBackground />
      <ShootingStars />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-display text-white">
              SPACE FOCUS
            </h1>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <AmbientSound />
            
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">System Status</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-300">Operational</span>
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timer (Dominant Feature) */}
          <div className="lg:col-span-7 xl:col-span-8">
             <div className="h-full flex flex-col gap-6">
                <Timer />
                {/* Quote sits below Timer on Desktop */}
                <div className="flex-1">
                  <QuoteGenerator />
                </div>
             </div>
          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-5 xl:col-span-4 min-h-[500px]">
            <TodoList />
          </div>
        </main>
        
        <footer className="text-center text-slate-600 text-sm py-8">
          <p>© {new Date().getFullYear()} Cosmos Focus. Keep your orbit steady.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;