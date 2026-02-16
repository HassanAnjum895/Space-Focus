
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface LogEntry {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  userId: string;
}

const MissionLogs: React.FC<Props> = ({ userId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newLog, setNewLog] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      // If table doesn't exist (404/PGRST204) or permission denied
      setError('Connection failed: Ensure "user_data" table exists in database.');
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;

    try {
      setSaving(true);
      setError(null);
      const { data, error } = await supabase
        .from('user_data')
        .insert([{ user_id: userId, content: newLog.trim() }])
        .select();

      if (error) throw error;

      if (data) {
        setLogs([data[0], ...logs]);
        setNewLog('');
      }
    } catch (err: any) {
      console.error('Error saving log:', err);
      setError('Failed to record log entry.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLogs(logs.filter(log => log.id !== id));
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-display font-medium text-purple-200 flex items-center">
          <span className="mr-2">❖</span> Personal Logs
        </h2>
        <button 
            onClick={fetchLogs} 
            className="p-1.5 text-slate-500 hover:text-white transition-colors"
            title="Sync Logs"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
      </div>

      <form onSubmit={addLog} className="mb-4 flex gap-2 flex-shrink-0">
        <input 
          type="text" 
          value={newLog} 
          onChange={(e) => setNewLog(e.target.value)}
          placeholder="Record a thought, Captain..." 
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-4 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
        />
        <button 
          type="submit" 
          disabled={saving || !newLog.trim()} 
          className="p-2.5 bg-purple-600 rounded-xl text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
        >
          {saving ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
             </svg>
          )}
        </button>
      </form>
      
      {error && (
        <div className="mb-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
        {loading && logs.length === 0 ? (
           <div className="text-center text-slate-500 py-8 text-xs animate-pulse">Establishing downlink...</div>
        ) : logs.length === 0 && !error ? (
           <div className="text-center text-slate-500 py-8 text-sm italic">Data banks empty.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group p-3 bg-slate-800/40 rounded-xl border border-transparent hover:border-purple-500/30 transition-all flex items-start gap-3">
               <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 break-words leading-relaxed">{log.content}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                    {new Date(log.created_at).toLocaleDateString()} • {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
               </div>
               <button 
                 onClick={() => deleteLog(log.id)}
                 className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all"
               >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                  </svg>
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MissionLogs;
