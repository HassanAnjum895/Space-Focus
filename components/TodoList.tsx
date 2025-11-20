import React, { useState, useEffect } from 'react';
import { Task } from '../types';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cosmos-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('cosmos-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 h-full flex flex-col">
      <h2 className="text-xl font-display font-medium mb-4 text-indigo-200 flex items-center">
        <span className="mr-2">✦</span> Mission Log
      </h2>
      
      <form onSubmit={addTask} className="relative mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tasks.length === 0 && (
          <div className="text-center text-slate-500 py-8 text-sm italic">
            Orbit clear. No tasks assigned.
          </div>
        )}
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`group flex items-center p-3 rounded-xl transition-all duration-200 ${
              task.completed ? 'bg-slate-800/30' : 'bg-slate-800/60 hover:bg-slate-800/80'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex-shrink-0 h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                task.completed 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                  : 'border-slate-500 text-transparent hover:border-indigo-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span 
              className={`flex-1 text-sm truncate transition-all ${
                task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;