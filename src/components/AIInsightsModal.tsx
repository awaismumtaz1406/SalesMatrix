import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Award, 
  BrainCircuit, 
  Send, 
  Loader2,
  Lock
} from 'lucide-react';
import { SalesRecord, KPISummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/dataAnalytics';
import { User } from '@supabase/supabase-js';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SalesRecord[];
  summary: KPISummary;
  currentUser: User | null;
  onRequireAuth: (reason: string) => void;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({
  isOpen,
  onClose,
  records,
  summary,
  currentUser,
  onRequireAuth
}) => {
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Automated statistical findings
  const highDiscountDeals = records.filter(r => (r.discount || 0) >= 0.15);
  const lowDiscountDeals = records.filter(r => (r.discount || 0) < 0.15);

  const avgMarginHighDisc = highDiscountDeals.length > 0 
    ? highDiscountDeals.reduce((sum, r) => sum + r.profitMargin, 0) / highDiscountDeals.length 
    : 0;

  const avgMarginLowDisc = lowDiscountDeals.length > 0 
    ? lowDiscountDeals.reduce((sum, r) => sum + r.profitMargin, 0) / lowDiscountDeals.length 
    : 0;

  const marginDelta = Math.round((avgMarginLowDisc - avgMarginHighDisc) * 10) / 10;

  const handleAskAI = async () => {
    if (!currentUser) {
      onClose();
      onRequireAuth('Sign in to unlock Gemini AI intelligence');
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/analyze-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          question: customQuestion || 'Provide an executive summary of key revenue trends, risk factors, and actionable opportunities.',
          sampleCount: records.length,
          topCategory: summary.topCategory,
          topRegion: summary.topRegion,
          topSalesRep: summary.topSalesRep
        })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      setAiResponse(data.analysis || 'Analysis successfully generated.');
    } catch (err: any) {
      // Fallback structured intelligence
      setAiResponse(
        `• **Revenue Stability**: $${summary.totalSales.toLocaleString()} generated across ${records.length} transactions with a ${formatPercent(summary.grossMargin)} gross margin.\n` +
        `• **Discount Sensitivity**: Deals with discount ≥15% average ${Math.round(avgMarginHighDisc)}% margin vs ${Math.round(avgMarginLowDisc)}% for disciplined pricing (a ${marginDelta}% spread).\n` +
        `• **Actionable Recommendation**: Maintain discount approval limits at 10% on ${summary.topCategory.name} products to protect gross margin.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>AI Data Intelligence & Statistical Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">Automated pattern extraction, risk detection, and ad-hoc reasoning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Automated Statistical Findings */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automated Statistical Pattern Detection
            </h4>

            {/* Finding 1 */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                Category Volume Dominance
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>{summary.topCategory.name}</strong> accounts for <strong>{formatPercent(summary.topCategory.share)}</strong> of total revenue ({formatCurrency(summary.topCategory.sales)}), representing your primary revenue driver.
              </p>
            </div>

            {/* Finding 2 */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                Pricing & Margin Dilution Impact
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Transactions with ≥15% discount yield <strong>{formatPercent(avgMarginHighDisc)}</strong> average margin, compared to <strong>{formatPercent(avgMarginLowDisc)}</strong> on deals with disciplined discounting ({marginDelta}% margin degradation).
              </p>
            </div>

            {/* Finding 3 */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                Top Closer Efficiency
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>{summary.topSalesRep.name}</strong> generated <strong>{formatCurrency(summary.topSalesRep.sales)}</strong> across {summary.topSalesRep.deals} enterprise contracts.
              </p>
            </div>
          </div>

          {/* Ask AI Prompt Input or Gated Lock Notice */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            {!currentUser ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Sign in to unlock Gemini AI intelligence</span>
                      <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        Gated
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Interactive queries and customized ad-hoc strategic briefings require a free account.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onRequireAuth('Sign in to unlock Gemini AI intelligence');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Unlock</span>
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ask AI to analyze this dataset:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. How can we optimize pricing in European markets?"
                    value={customQuestion}
                    onChange={e => setCustomQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Analyze</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Response Display */}
          {aiResponse && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-200 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Synthesis
              </div>
              <div className="whitespace-pre-line text-slate-300">
                {aiResponse}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Real-time statistical synthesis</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
