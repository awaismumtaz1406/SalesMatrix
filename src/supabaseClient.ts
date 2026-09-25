import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SalesRecord, SavedDashboard } from './types';

// Read from import.meta.env with fallback to localStorage (for easy testing without rebuild)
const getStoredUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('custom_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  }
  return import.meta.env.VITE_SUPABASE_URL || '';
};

const getStoredKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('custom_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
};

export const SUPABASE_URL = getStoredUrl() || 'https://placeholder.supabase.co';
export const SUPABASE_ANON_KEY = getStoredKey() || 'placeholder-anon-key';

export const isSupabaseConfigured = (): boolean => {
  const url = getStoredUrl();
  const key = getStoredKey();
  return (
    Boolean(url) && 
    Boolean(key) && 
    !url.includes('placeholder.supabase.co') && 
    !key.includes('placeholder-anon-key') &&
    url.startsWith('https://')
  );
};

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const updateSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('custom_supabase_url', url.trim());
    localStorage.setItem('custom_supabase_anon_key', anonKey.trim());
    window.location.reload();
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_anon_key');
    window.location.reload();
  }
};

/**
 * Database Persistence Helpers for the `dashboards` Supabase Table
 * Schema:
 *   id (uuid, primary key)
 *   user_id (uuid, references auth.users)
 *   name (text)
 *   data (jsonb)
 *   created_at (timestamptz)
 */

export const saveDashboard = async (
  name: string,
  records: SalesRecord[],
  settings?: { filter?: any; view?: string; datasetName?: string }
): Promise<{ data: SavedDashboard | null; error: any }> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: new Error('Supabase is not configured yet. Please provide your Supabase URL & Anon Key.')
    };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      data: null,
      error: new Error('You must be signed in to save dashboards.')
    };
  }

  const payload = {
    user_id: user.id,
    name: name.trim() || 'Untitled Dashboard',
    data: {
      records,
      filter: settings?.filter,
      view: settings?.view,
      datasetName: settings?.datasetName || 'Custom Dataset'
    }
  };

  const { data, error } = await supabase
    .from('dashboards')
    .insert([payload])
    .select()
    .single();

  return { data, error };
};

export const fetchUserDashboards = async (): Promise<{ data: SavedDashboard[]; error: any }> => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { data: (data as SavedDashboard[]) || [], error };
};

export const deleteDashboard = async (id: string): Promise<{ error: any }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase
    .from('dashboards')
    .delete()
    .eq('id', id);

  return { error };
};
