import React from 'react';
import { Layers, ShieldCheck, Sparkles, Wand2, Download, RefreshCw, Info } from 'lucide-react';

interface HeaderProps {
  hasMasterImage: boolean;
  onReset: () => void;
  onExport: () => void;
  completedCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasMasterImage,
  onReset,
  onExport,
  completedCount,
  totalCount,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Brand Builder</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                Nano-Banana
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Multi-Medium Campaign Visualizer with Visual Consistency
            </p>
          </div>
        </div>

        {/* Feature Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Zero Human Presence Assurance Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Humans: Active</span>
          </div>

          {/* Consistency Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {hasMasterImage ? 'Product Consistency: Anchored' : 'Consistency: Pending Anchor'}
            </span>
          </div>

          {/* Completed Counter */}
          {completedCount > 0 && (
            <div className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
              {completedCount} / {totalCount} Mediums
            </div>
          )}

          {/* Export Campaign Button */}
          {completedCount > 0 && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm"
              title="Export Campaign Deck"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          {/* New / Reset */}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-colors"
            title="Start New Product"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
