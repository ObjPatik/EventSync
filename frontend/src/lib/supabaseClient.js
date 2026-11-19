import { createClient } from '@supabase/supabase-js';

// Read from env vars or localStorage overrides
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('eventsync_supabase_url');
  const localKey = localStorage.getItem('eventsync_supabase_key');

  const url = localUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
};

export const saveSupabaseConfig = (url, key) => {
  if (url && key) {
    localStorage.setItem('eventsync_supabase_url', url.trim());
    localStorage.setItem('eventsync_supabase_key', key.trim());
  } else {
    localStorage.removeItem('eventsync_supabase_url');
    localStorage.removeItem('eventsync_supabase_key');
  }
};

let cachedClient = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!cachedClient || cachedClient.supabaseUrl !== url) {
    try {
      cachedClient = createClient(url, key);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
};
