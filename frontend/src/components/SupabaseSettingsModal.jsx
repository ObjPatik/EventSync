import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, Key, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../lib/supabaseClient';

export default function SupabaseSettingsModal({ onClose, onConfigSaved, isConnected }) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [status, setStatus] = useState(isConnected ? 'connected' : 'idle');
  const [statusMsg, setStatusMsg] = useState(isConnected ? 'Connected to live Supabase PostgreSQL database.' : '');
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    setStatus('testing');
    setStatusMsg('Testing connection to Supabase...');

    try {
      saveSupabaseConfig(url, key);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Please enter both Supabase URL and Anon Key');
      }

      // Ping Supabase
      const { data, error } = await client.from('events').select('event_id').limit(1);

      if (error) {
        // Table might not exist yet if schema was not run
        if (error.code === '42P01') {
          setStatus('partial');
          setStatusMsg('Connected to Supabase, but the "events" table was not found. Please run "supabase/schema.sql" in your Supabase SQL Editor!');
        } else {
          throw error;
        }
      } else {
        setStatus('connected');
        setStatusMsg('Successfully connected to Supabase PostgreSQL database!');
      }

      onConfigSaved(true);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMsg(err.message || 'Failed to connect. Check URL and Anon Key.');
      onConfigSaved(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setKey('');
    setStatus('idle');
    setStatusMsg('Switched back to local in-memory demo mode.');
    onConfigSaved(false);
  };

  const copySampleConnection = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Supabase Database Integration</h2>
            <p className="text-xs text-slate-400">CIT-U IT342 Cloud Database Connection</p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleTestAndSave} className="p-6 sm:p-8 space-y-5">
          
          {/* Status Alert */}
          {statusMsg && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              status === 'connected'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : status === 'partial'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {status === 'connected' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
              )}
              <div className="leading-relaxed">{statusMsg}</div>
            </div>
          )}

          {/* Quick Steps Helper */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-white block">Where to get your keys in Supabase:</span>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Log in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">supabase.com</a> and open your project.</li>
              <li>Go to <strong>Project Settings</strong> (gear icon) &gt; <strong>API</strong>.</li>
              <li>Copy <strong>Project URL</strong> and <strong>anon / public key</strong> below.</li>
              <li>Execute <code>supabase/schema.sql</code> in the Supabase <strong>SQL Editor</strong>.</li>
            </ol>
          </div>

          {/* URL Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project-ref.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Anon Key Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Supabase Anon / Public Key
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Reset to Local Demo Mode
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isTesting || !url || !key}
                className="btn-primary w-full sm:w-auto text-xs py-2.5 px-6 justify-center disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Save & Connect Live DB</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
