import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Trash2, 
  FolderOpen, 
  Save, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogIn, 
  Copy, 
  Check, 
  Code 
} from 'lucide-react';
import { SalesRecord, SavedDashboard, DashboardView, DashboardFilter } from '../types';
import { 
  fetchUserDashboards, 
  saveDashboard, 
  deleteDashboard, 
  isSupabaseConfigured 
} from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface SavedDashboardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: (reason?: string) => void;
  currentRecords: SalesRecord[];
  currentDatasetName: string;
  currentView: DashboardView;
  currentFilter: DashboardFilter;
  onLoadDashboard: (dashboard: SavedDashboard) => void;
}

export const SUPABASE_SQL_SCHEMA = `-- 1. Create the dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own dashboards
CREATE POLICY "Users can view own dashboards"
ON public.dashboards
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own dashboards
CREATE POLICY "Users can insert own dashboards"
ON public.dashboards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can update their own dashboards
CREATE POLICY "Users can update own dashboards"
ON public.dashboards
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
ON public.dashboards
FOR DELETE
USING (auth.uid() = user_id);`;

export const SavedDashboardsModal: React.FC<SavedDashboardsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  currentRecords,
  currentDatasetName,
  currentView,
  currentFilter,
  onLoadDashboard
}) => {
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState(`${currentDatasetName.replace('.csv', '')} - Snapshot`);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser && isSupabaseConfigured()) {
      loadDashboards();
    }
  }, [isOpen, currentUser]);

  const loadDashboards = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await fetchUserDashboards();
      if (error) throw error;
      setDashboards(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load dashboards.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onClose();
      onOpenAuth('Sign in to save dashboards to your cloud account');
      return;
    }
    if (!saveName.trim()) {
      setErrorMsg('Please provide a name for this dashboard snapshot.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await saveDashboard(saveName.trim(), currentRecords, {
        filter: currentFilter,
        view: currentView,
        datasetName: currentDatasetName
      });

      if (error) throw error;

      setSuccessMsg(`"${saveName}" saved to your cloud dashboards!`);
      if (data) {
        setDashboards(prev => [data, ...prev]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save dashboard. Check Supabase table schema and RLS policies.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeletingId(id);
    setErrorMsg(null);
    try {
      const { error } = await deleteDashboard(id);
      if (error) throw error;
      setDashboards(prev => prev.filter(d => d.id !== id));
      setSuccessMsg(`Deleted "${name}"`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete dashboard.');
    } finally {
      setDeletingId(null);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Saved Cloud Dashboards</h3>
              <p className="text-xs text-slate-400">Database persistence powered by Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSql(prev => !prev)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              title="View SQL Schema for Supabase"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>SQL Schema</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* SQL Schema Accordion Drawer */}
          {showSql && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                  <Code className="w-3.5 h-3.5" />
                  Supabase SQL Editor Snippet
                </span>
                <button
                  onClick={copySqlToClipboard}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Run this script in your <strong>Supabase Project → SQL Editor</strong> to create the table and RLS policies:
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800 max-h-44">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}

          {/* If user is not authenticated */}
          {!currentUser ? (
            <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-center space-y-3 my-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sign in to save & access cloud dashboards</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You can explore the interactive demo dashboard anytime. Create a free account or sign in to persist your custom uploaded datasets and view settings across sessions.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => { onClose(); onOpenAuth('Sign in to save and access cloud dashboards'); }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In or Create Account</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Save Current Dashboard Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Save Current Dataset Snapshot</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentRecords.length} records • {currentDatasetName}
                  </span>
                </div>
                <form onSubmit={handleSave} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    placeholder="Dashboard snapshot title..."
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Snapshot</span>
                  </button>
                </form>
              </div>

              {/* List of previously saved dashboards */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Your Cloud Dashboards ({dashboards.length})</span>
                  <button
                    onClick={loadDashboards}
                    disabled={loading}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                  >
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span className="text-xs">Fetching your saved dashboards...</span>
                  </div>
                ) : dashboards.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                    <FileSpreadsheet className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No saved dashboards yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Save your current dataset above to keep snapshots safe in Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {dashboards.map(d => {
                      const recordsCount = d.data?.records?.length || 0;
                      const dateStr = new Date(d.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      return (
                        <div
                          key={d.id}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate" title={d.name}>
                                {d.name}
                              </h4>
                              {d.data?.datasetName && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                  {d.data.datasetName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {dateStr}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">
                                {recordsCount} transactions
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                onLoadDashboard(d);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDelete(d.id, d.name)}
                              disabled={deletingId === d.id}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-40"
                              title="Delete snapshot"
                            >
                              {deletingId === d.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{currentUser ? `User: ${currentUser.email}` : 'Not signed in'}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
