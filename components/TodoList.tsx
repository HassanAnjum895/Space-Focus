
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { breakdownTask } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface Props {
  userId: string;
  onTasksUpdated?: (count: number) => void;
}

const TodoList: React.FC<Props> = ({ userId, onTasksUpdated }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [breakingId, setBreakingId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch from Supabase
  useEffect(() => {
    fetchTasks();
  }, [userId]);

  // Report active task count whenever tasks change
  useEffect(() => {
    if (onTasksUpdated) {
      onTasksUpdated(tasks.filter(t => !t.completed).length);
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // Map DB columns to our Task interface (camelCase)
        const mappedTasks: Task[] = data.map((d: any) => ({
          id: d.id,
          text: d.text,
          completed: d.completed,
          completedAt: d.completed_at,
          subtasks: d.subtasks || undefined
        }));
        setTasks(mappedTasks);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Connection failure: "todos" table inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('todos')
        .insert([{ user_id: userId, text: input.trim(), completed: false }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newTask: Task = {
          id: data[0].id,
          text: data[0].text,
          completed: data[0].completed,
          completedAt: data[0].completed_at
        };
        setTasks([...tasks, newTask]);
        setInput('');
      }
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError('Failed to transmit mission order.');
    }
  };

  const handleBreakdown = async (id: string, text: string) => {
    setBreakingId(id);
    // 1. Get breakdown from Gemini
    const subtasks = await breakdownTask(text);
    
    // 2. Optimistic Update (UI first)
    setTasks(tasks.map(t => t.id === id ? { ...t, subtasks } : t));
    setBreakingId(null);
    toggleExpand(id);

    // 3. Save to DB
    try {
      await supabase
        .from('todos')
        .update({ subtasks })
        .eq('id', id);
    } catch (err) {
      console.error('Error saving breakdown:', err);
      // Non-critical, just log
    }
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

  const toggleTask = async (id: string) => {
    // Find current task
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const newCompletedAt = newCompleted ? Date.now() : null; // DB expects bigint or null

    // Optimistic Update
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, 
      completed: newCompleted,
      completedAt: newCompletedAt ? newCompletedAt : undefined
    } : t));

    // DB Update
    try {
      await supabase
        .from('todos')
        .update({ completed: newCompleted, completed_at: newCompletedAt })
        .eq('id', id);
    } catch (err) {
      console.error('Error toggling task:', err);
      // Revert optimistic update if needed, but simplistic approach here
    }
  };

  const deleteTask = async (id: string) => {
    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== id));
    const newExpanded = new Set(expandedTasks);
    newExpanded.delete(id);
    setExpandedTasks(newExpanded);

    // DB Update
    try {
      await supabase.from('todos').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-display font-medium text-indigo-200 flex items-center">
          <span className="mr-2">✦</span> Mission Log
        </h2>
        {loading && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
      </div>
      
      <form onSubmit={addTask} className="relative mb-6 flex-shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a new task..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
        <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
      </form>

      {error && (
        <div className="mb-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 custom-scrollbar">
        {!loading && tasks.length === 0 && !error && <div className="text-center text-slate-500 py-8 text-sm italic">Orbit clear. No missions pending.</div>}
        {tasks.map((task) => (
          <div key={task.id} className={`group rounded-xl transition-all duration-300 border border-transparent ${task.completed ? 'bg-slate-800/20 opacity-70' : 'bg-slate-800/60 hover:border-white/10'}`}>
            <div className="p-3 flex items-center">
              <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-slate-500 text-transparent hover:border-indigo-400'}`}><svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg></button>
              
              <div className="flex-1 flex flex-col min-w-0">
                <span 
                  className={`text-sm truncate transition-all cursor-default ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                  title={task.text}
                >
                  {task.text}
                </span>
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
