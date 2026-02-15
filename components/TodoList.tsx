
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { breakdownTask } from '../services/geminiService';

interface Props {
  onTasksUpdated?: (count: number) => void;
}

const TodoList: React.FC<Props> = ({ onTasksUpdated }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cosmos-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [breakingId, setBreakingId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('cosmos-tasks', JSON.stringify(tasks));
    // Updated to count Incomplete tasks (Active Missions)
    if (onTasksUpdated) onTasksUpdated(tasks.filter(t => !t.completed).length);
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTask: Task = { id: crypto.randomUUID(), text: input.trim(), completed: false };
    setTasks([...tasks, newTask]);
    setInput('');
  };

  const handleBreakdown = async (id: string, text: string) => {
    setBreakingId(id);
    const subtasks = await breakdownTask(text);
    setTasks(tasks.map(t => t.id === id ? { ...t, subtasks } : t));
    setBreakingId(null);
    toggleExpand(id);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTasks(newExpanded);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, 
      completed: !t.completed,
      completedAt: !t.completed ? Date.now() : undefined
    } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    const newExpanded = new Set(expandedTasks);
    newExpanded.delete(id);
    setExpandedTasks(newExpanded);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 h-full flex flex-col overflow-hidden">
      <h2 className="text-xl font-display font-medium mb-4 text-indigo-200 flex items-center flex-shrink-0">
        <span className="mr-2">✦</span> Mission Log
      </h2>
      
      <form onSubmit={addTask} className="relative mb-6 flex-shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a new task..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
        <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {tasks.length === 0 && <div className="text-center text-slate-500 py-8 text-sm italic">Orbit clear. No missions pending.</div>}
        {tasks.map((task) => (
          <div key={task.id} className={`group rounded-xl transition-all duration-300 border border-transparent ${task.completed ? 'bg-slate-800/20 opacity-70' : 'bg-slate-800/60 hover:border-white/10'}`}>
            <div className="p-3 flex items-center">
              <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-slate-500 text-transparent hover:border-indigo-400'}`}><svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg></button>
              
              <div className="flex-1 flex flex-col min-w-0">
                <span className={`text-sm truncate transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.text}</span>
                {task.subtasks && !task.completed && (
                  <button 
                    onClick={() => toggleExpand(task.id)}
                    className="mt-1 flex items-center text-[10px] text-indigo-400 font-semibold uppercase tracking-widest hover:text-indigo-300 transition-colors w-fit"
                  >
                    {expandedTasks.has(task.id) ? 'Hide Breakdown' : `${task.subtasks.length} Steps Detected`}
                    <svg className={`ml-1 h-3 w-3 transition-transform ${expandedTasks.has(task.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2">
                {!task.completed && !task.subtasks && (
                  <button onClick={() => handleBreakdown(task.id, task.text)} disabled={breakingId === task.id} className="p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50" title="AI Breakdown">
                    {breakingId === task.id ? (
                      <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                  </button>
                )}
                <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg></button>
              </div>
            </div>

            {task.subtasks && expandedTasks.has(task.id) && !task.completed && (
              <div className="mx-3 mb-3 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  {task.subtasks.map((s, idx) => (
                    <div key={idx} className="flex items-start text-[11px] text-slate-300 leading-relaxed">
                      <span className="mr-2 text-indigo-500 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
