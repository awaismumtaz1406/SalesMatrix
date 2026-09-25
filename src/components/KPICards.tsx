import React, { useState } from 'react';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ShoppingBag,
  Award,
  Users
} from 'lucide-react';
import { KPISummary } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/dataAnalytics';

interface KPICardsProps {
  summary: KPISummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const cogsShare = summary.totalSales > 0 ? (summary.cogs / summary.totalSales) * 100 : 0;
  const opexShare = summary.totalSales > 0 ? (summary.operatingExpenses / summary.totalSales) * 100 : 0;
  const grossMargin = summary.grossMargin || (summary.totalSales > 0 ? ((summary.totalSales - summary.cogs) / summary.totalSales) * 100 : 0);
  const netMargin = summary.netMargin || (summary.totalSales > 0 ? (summary.netProfit / summary.totalSales) * 100 : 0);

  return (
    <div className="space-y-4 mb-6">
      
      {/* Header with Title and Quick Explanation Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <span>Executive Financial Performance (P&L Breakdown)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              5 Core Metrics
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simple and easy top-to-bottom financial metrics from gross revenue to bottom-line net earnings.
          </p>
        </div>

        <button
          onClick={() => setShowDetails(prev => !prev)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <span>{showDetails ? 'Hide P&L Flow' : 'Show P&L Flow'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 5 Core Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Total Sales */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 shadow-md relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Total Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
              {formatCurrency(summary.totalSales)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Topline Revenue
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{summary.totalOrders} Transactions</span>
            <span className="text-slate-300 font-medium">AOV: {formatCurrency(summary.avgOrderValue)}</span>
          </div>
        </div>

        {/* 2. Cost of Goods Sold (COGS) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/80 border border-amber-500/30 shadow-md relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Cost of Goods Sold
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
              {formatCurrency(summary.cogs)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {formatPercent(cogsShare)} of Sales
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Direct Product Costs</span>
            <span className="text-amber-400/90 font-medium">COGS</span>
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900/80 border border-emerald-500/30 shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-[26px] font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(summary.grossProfit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {formatPercent(grossMargin)} Margin
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sales − COGS</span>
            <span className="text-emerald-400 font-medium">Profitable</span>
          </div>
        </div>

        {/* 4. Operating Expenses (OPEX) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/30 to-slate-900/80 border border-purple-500/30 shadow-md relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
              {formatCurrency(summary.operatingExpenses)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {formatPercent(opexShare)} of Sales
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>SG&A, Logistics, Ops</span>
            <span className="text-purple-400/90 font-medium">OPEX</span>
          </div>
        </div>

        {/* 5. Net Profit */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-950/40 via-emerald-950/20 to-slate-900/80 border border-teal-500/40 shadow-lg relative overflow-hidden group hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-[26px] font-extrabold text-teal-300 tracking-tight">
              {formatCurrency(summary.netProfit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {formatPercent(netMargin)} Net Margin
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Gross Profit − OPEX</span>
            <span className="text-teal-400 font-bold">Bottom Line</span>
          </div>
        </div>

      </div>

      {/* P&L Waterfall Step-by-Step Flow Bar */}
      {showDetails && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                1
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Total Sales: </span>
                <strong className="text-white font-mono">{formatCurrency(summary.totalSales)}</strong>
              </div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold text-amber-400">
                2
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">− COGS: </span>
                <strong className="text-amber-400 font-mono">−{formatCurrency(summary.cogs)}</strong>
              </div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                3
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">= Gross Profit: </span>
                <strong className="text-emerald-400 font-mono">{formatCurrency(summary.grossProfit)}</strong>
                <span className="text-[10px] text-slate-400 ml-1">({formatPercent(grossMargin)})</span>
              </div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />

            {/* Step 4 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-400">
                4
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">− OPEX: </span>
                <strong className="text-purple-400 font-mono">−{formatCurrency(summary.operatingExpenses)}</strong>
              </div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />

            {/* Step 5 */}
            <div className="flex items-center gap-2 bg-teal-950/40 px-2.5 py-1 rounded-xl border border-teal-500/30">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[10px] font-bold text-teal-300">
                5
              </div>
              <div>
                <span className="text-slate-300 text-[11px]">= Net Profit: </span>
                <strong className="text-teal-300 font-mono">{formatCurrency(summary.netProfit)}</strong>
                <span className="text-[10px] text-teal-400 ml-1">({formatPercent(netMargin)})</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Auxiliary Operational Context Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Total Units:</span>
          <strong className="text-white font-mono">{formatNumber(summary.totalUnits)}</strong>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Avg Deal Size:</span>
          <strong className="text-white font-mono">{formatCurrency(summary.avgOrderValue)}</strong>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Avg Discount:</span>
          <strong className="text-emerald-400 font-mono">{formatPercent(summary.avgDiscount)}</strong>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400 truncate">Top Category:</span>
          <strong className="text-indigo-400 font-medium truncate ml-1">{summary.topCategory.name}</strong>
        </div>
      </div>

    </div>
  );
};
