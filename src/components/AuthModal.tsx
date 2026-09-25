import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Database,
  ExternalLink,
  Code
} from 'lucide-react';
import { 
  supabase, 
  isSupabaseConfigured, 
  updateSupabaseCredentials,
  clearSupabaseCredentials 
} from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User | null) => void;
  initialTab?: 'signin' | 'signup' | 'config';
  promptReason?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  initialTab = 'signin',
  promptReason = null
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'config'>(
    !isSupabaseConfigured() ? 'config' : initialTab
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Config tab state
  const [customUrl, setCustomUrl] = useState(
    localStorage.getItem('custom_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [customKey, setCustomKey] = useState(
    localStorage.getItem('custom_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Please configure your Supabase URL & Anon Key in the "Setup / Keys" tab first.');
      setTab('config');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;
      setSuccessMsg('Successfully signed in!');
      onAuthSuccess(data.user);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Please configure your Supabase URL & Anon Key in the "Setup / Keys" tab first.');
      setTab('config');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.session) {
        setSuccessMsg('Account created and signed in!');
        onAuthSuccess(data.user);
        setTimeout(() => onClose(), 800);
      } else {
        setSuccessMsg('Verification email sent! Please check your inbox or confirm in Supabase dashboard.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onAuthSuccess(null);
      setSuccessMsg('Successfully signed out.');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing out.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      setErrorMsg('Both Supabase URL and Anon Key are required.');
      return;
    }
    updateSupabaseCredentials(customUrl, customKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase Authentication</h3>
              <p className="text-xs text-slate-400">Save & load multi-dimensional dashboards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Gating Reason Banner */}
        {promptReason && !currentUser && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2.5 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">{promptReason}</p>
              <p className="text-[11px] text-slate-300">Sign in to your account or create a free one to proceed.</p>
            </div>
          </div>
        )}

        {/* Tab Headers */}
        {!currentUser && (
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
            <button
              onClick={() => { setTab('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                tab === 'signin'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                tab === 'signup'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
            <button
              onClick={() => { setTab('config'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                tab === 'config'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Setup / Keys
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* If already signed in */}
          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Signed in as</h4>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">{currentUser.email}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">User ID: {currentUser.id}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sign In Form */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    <span>Sign In</span>
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Create Account</span>
                  </button>
                </form>
              )}

              {/* Supabase Config & SQL Schema tab */}
              {tab === 'config' && (
                <form onSubmit={handleSaveCredentials} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-200">Supabase Connection Status:</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      <span className={isSupabaseConfigured() ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                        {isSupabaseConfigured() ? 'Configured & Ready' : 'Awaiting Project Credentials'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project URL (e.g. https://xyz.supabase.co)
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://your-project-id.supabase.co"
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Anon Public Key
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="eyJh..."
                      value={customKey}
                      onChange={e => setCustomKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Save & Apply
                    </button>
                    {isSupabaseConfigured() && (
                      <button
                        type="button"
                        onClick={clearSupabaseCredentials}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Row Level Security (RLS) Protected</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
