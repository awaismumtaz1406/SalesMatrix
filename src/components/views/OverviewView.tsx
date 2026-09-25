import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Globe, 
  Users, 
  Award, 
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';
import { SalesRecord, KPISummary } from '../../types';
import { 
  getMonthlyTimeline, 
  getCategoryBreakdown, 
  getRegionalBreakdown, 
  getSalesRepLeaderboard, 
  formatCurrency, 
  formatPercent 
} from '../../utils/dataAnalytics';
import { User } from '@supabase/supabase-js';

interface OverviewViewProps {
  records: SalesRecord[];
  summary: KPISummary;
  currentUser?: User | null;
  onOpenAiInsights?: () => void;
  onRequireAuth?: (reason: string) => void;
}

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899'];

export const OverviewView: React.FC<OverviewViewProps> = ({ 
  records, 
  summary, 
  currentUser,
  onOpenAiInsights,
  onRequireAuth 
}) => {
  const timelineData = getMonthlyTimeline(records);
  const categoryData = getCategoryBreakdown(records);
  const regionalData = getRegionalBreakdown(records);
  const repData = getSalesRepLeaderboard(records).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }} 
              />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-semibold text-white ml-auto">
                {entry.name.toLowerCase().includes('margin') 
                  ? formatPercent(entry.value)
                  : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Live AI Executive Insights Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-indigo-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Live Data Insight & Intelligence
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              <strong>Total Sales:</strong> <span className="text-white font-semibold font-mono">{formatCurrency(summary.totalSales)}</span> • 
              <strong> COGS:</strong> <span className="text-amber-300 font-semibold font-mono">{formatCurrency(summary.cogs)}</span> • 
              <strong> Gross Profit:</strong> <span className="text-emerald-400 font-semibold font-mono">{formatCurrency(summary.grossProfit)}</span> ({formatPercent(summary.grossMargin)}) • 
              <strong> OPEX:</strong> <span className="text-purple-300 font-semibold font-mono">{formatCurrency(summary.operatingExpenses)}</span> • 
              <strong> Net Profit:</strong> <span className="text-teal-300 font-bold font-mono">{formatCurrency(summary.netProfit)}</span> ({formatPercent(summary.netMargin)} Net Margin).
            </p>
          </div>
        </div>

        {onOpenAiInsights && (
          <button
            onClick={() => {
              if (!currentUser && onRequireAuth) {
                onRequireAuth('Sign in to unlock Gemini AI intelligence');
              } else {
                onOpenAiInsights();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 shrink-0 self-start md:self-center transition-all"
            title={!currentUser ? 'Sign in to unlock Gemini AI intelligence' : 'Ask AI Analyst'}
          >
            {!currentUser ? (
              <Lock className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Ask AI Analyst</span>
            {!currentUser ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                Sign In
              </span>
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Row 1: Revenue vs Profit Over Time (Area Chart) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Revenue & Profit Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly financial performance showing revenue trajectory against net gross margin
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
              <span className="text-slate-300 font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300 font-medium">Net Profit</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickFormatter={(val) => formatCurrency(val)} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="sales" 
                name="Revenue" 
                stroke="#6366f1" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                name="Net Profit" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#profitGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Category Share & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share Donut */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Revenue by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across primary product lines</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {categoryData.length} Categories
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="sales"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Clean Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {categoryData.map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                />
                <span className="text-slate-300 truncate" title={cat.category}>{cat.category}</span>
                <span className="font-semibold text-slate-400 ml-auto">{cat.share}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Territory & Regional Revenue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Global performance by operating theatre</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {regionalData.length} Regions
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  tickFormatter={val => formatCurrency(val)} 
                  tickLine={false} 
                />
                <YAxis 
                  type="category" 
                  dataKey="region" 
                  stroke="#64748b" 
                  tick={{ fill: '#e2e8f0', fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="sales" 
                  name="Revenue" 
                  fill="#06b6d4" 
                  radius={[0, 6, 6, 0]} 
                  barSize={18} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Top Market: <strong className="text-white">{summary.topRegion.name}</strong></span>
            <span className="text-cyan-400 font-semibold">{formatCurrency(summary.topRegion.sales)} ({formatPercent(summary.topRegion.share)})</span>
          </div>
        </div>

      </div>

      {/* Row 3: Sales Rep Leaderboard Mini-Preview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Top Account Executives
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">High-impact sales leaders ranked by closed revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {repData.map((rep, idx) => (
            <div 
              key={rep.name} 
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">#{idx + 1}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rep.margin}% Margin
                </span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm mt-1.5 truncate" title={rep.name}>
                {rep.name}
              </h4>
              <p className="text-base font-bold text-indigo-400 mt-0.5">
                {formatCurrency(rep.sales)}
              </p>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>{rep.deals} deals</span>
                <span className="text-slate-300">AOV {formatCurrency(rep.aov)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
