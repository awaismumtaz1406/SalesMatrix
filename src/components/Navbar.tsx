import React, { useState } from 'react';
import { 
  BarChart3, 
  Upload, 
  Download, 
  Sparkles, 
  FileSpreadsheet, 
  RotateCcw,
  Database,
  FolderOpen,
  User as UserIcon,
  LogOut,
  LogIn,
  Save,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../utils/dataAnalytics';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../supabaseClient';

interface NavbarProps {
  currentDatasetName: string;
  rowCount: number;
  totalSales: number;
  isCustomData: boolean;
  currentUser: User | null;
  savedCount: number;
  onOpenUploadModal: () => void;
  onResetData: () => void;
  onExportCsv: () => void;
  onOpenAiInsights: () => void;
  onOpenAuthModal: () => void;
  onOpenSavedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDatasetName,
  rowCount,
  totalSales,
  isCustomData,
  currentUser,
  savedCount,
  onOpenUploadModal,
  onResetData,
  onExportCsv,
  onOpenAiInsights,
  onOpenAuthModal,
  onOpenSavedModal
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Logo & Dataset Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  SalesMatrix Studio
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Interactive BI
                </span>
                {isSupabaseConfigured() && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" />
                    Supabase
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  {currentDatasetName}
                </span>
                <span>•</span>
                <span>{rowCount} records</span>
                <span>•</span>
                <span className="font-semibold text-slate-200">{formatCurrency(totalSales)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 flex-wrap">
            {isCustomData && (
              <button
                onClick={onResetData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
                title="Reset to default Sales data - Sheet1.csv"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Data
              </button>
            )}

            {/* Saved Dashboards Drawer Trigger */}
            <button
              onClick={onOpenSavedModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="View, load, or delete saved dashboards in Supabase"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Dashboards</span>
              {currentUser && savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import / Paste CSV</span>
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Export currently filtered dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAiInsights}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 transition-all border border-indigo-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Insights</span>
            </button>

            {/* User Auth Section */}
            <div className="relative ml-1">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setShowProfileMenu(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/90 hover:border-slate-600 text-xs text-white transition-all shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[110px] truncate text-slate-200 font-medium">
                      {currentUser.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                      <div className="p-2 border-b border-slate-800">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-semibold text-emerald-400 truncate mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenSavedModal();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>My Cloud Dashboards</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                        >
                          <Database className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Supabase Settings & Account</span>
                        </button>
                      </div>
                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all border border-emerald-400/30"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
