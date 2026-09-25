import React from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  DollarSign,
  Package,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { 
  getScatterCorrelationData, 
  formatCurrency, 
  formatPercent, 
  formatNumber,
  calculateKPISummary
} from '../../utils/dataAnalytics';

interface FinancialViewProps {
  records: SalesRecord[];
}

export const FinancialView: React.FC<FinancialViewProps> = ({ records }) => {
  const summary = calculateKPISummary(records);
  const scatterData = getScatterCorrelationData(records);

  // Group into deal size tiers
  const tierMap: Record<string, { tier: string; count: number; sales: number; profit: number }> = {
    'Under $10k': { tier: 'Under $10k', count: 0, sales: 0, profit: 0 },
    '$10k - $25k': { tier: '$10k - $25k', count: 0, sales: 0, profit: 0 },
    '$25k - $50k': { tier: '$25k - $50k', count: 0, sales: 0, profit: 0 },
    '$50k - $75k': { tier: '$50k - $75k', count: 0, sales: 0, profit: 0 },
    'Over $75k': { tier: 'Over $75k', count: 0, sales: 0, profit: 0 }
  };

  records.forEach(r => {
    if (r.sales < 10000) {
      tierMap['Under $10k'].count += 1;
      tierMap['Under $10k'].sales += r.sales;
      tierMap['Under $10k'].profit += r.profit;
    } else if (r.sales < 25000) {
      tierMap['$10k - $25k'].count += 1;
      tierMap['$10k - $25k'].sales += r.sales;
      tierMap['$10k - $25k'].profit += r.profit;
    } else if (r.sales < 50000) {
      tierMap['$25k - $50k'].count += 1;
      tierMap['$25k - $50k'].sales += r.sales;
      tierMap['$25k - $50k'].profit += r.profit;
    } else if (r.sales < 75000) {
      tierMap['$50k - $75k'].count += 1;
      tierMap['$50k - $75k'].sales += r.sales;
      tierMap['$50k - $75k'].profit += r.profit;
    } else {
      tierMap['Over $75k'].count += 1;
      tierMap['Over $75k'].sales += r.sales;
      tierMap['Over $75k'].profit += r.profit;
    }
  });

  const dealTiers = Object.values(tierMap);

  // Group into margin tiers
  const marginTiers = [
    { label: 'Prime Margin (>40%)', count: records.filter(r => r.profitMargin > 40).length, color: '#10b981' },
    { label: 'Healthy (25% - 40%)', count: records.filter(r => r.profitMargin >= 25 && r.profitMargin <= 40).length, color: '#6366f1' },
    { label: 'Moderate (15% - 25%)', count: records.filter(r => r.profitMargin >= 15 && r.profitMargin < 25).length, color: '#f59e0b' },
    { label: 'Compressed (<15%)', count: records.filter(r => r.profitMargin < 15).length, color: '#ef4444' },
  ];

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs max-w-xs">
          <p className="font-bold text-slate-100">{data.productName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.category} • {data.region}</p>
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Discount Given:</span>
              <span className="font-semibold text-amber-400">{data.discount}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Profit Margin:</span>
              <span className="font-semibold text-emerald-400">{data.profitMargin}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction Value:</span>
              <span className="font-semibold text-white">{formatCurrency(data.sales)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dedicated Income Statement / P&L Financial Ledger Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              Corporate Profit & Loss (P&L) Statement
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of Total Sales, Cost of Goods Sold, Gross Profit, Operating Expenses, and Net Profit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Net Margin: {formatPercent(summary.netMargin)}
            </span>
          </div>
        </div>

        {/* Financial Flow Ledger Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 text-left">P&L Financial Line Item</th>
                <th className="py-2.5 px-3 text-left">Description / Formula</th>
                <th className="py-2.5 px-3 text-right">Amount ($)</th>
                <th className="py-2.5 px-3 text-right">% of Total Sales</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              
              {/* Row 1: Total Sales */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span>1. Total Sales</span>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  Gross Topline Revenue across all customer transactions
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                  {formatCurrency(summary.totalSales)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  100.0%
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Topline
                  </span>
                </td>
              </tr>

              {/* Row 2: COGS */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 font-semibold text-amber-300 flex items-center gap-2 pl-6">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Package className="w-3 h-3" />
                  </div>
                  <span>Less: Cost of Goods Sold (COGS)</span>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  Direct production, hosting, licensing, and fulfillment costs
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 text-sm">
                  −{formatCurrency(summary.cogs)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-300/80">
                  {formatPercent(summary.totalSales > 0 ? (summary.cogs / summary.totalSales) * 100 : 0)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Direct Cost
                  </span>
                </td>
              </tr>

              {/* Row 3: Gross Profit */}
              <tr className="bg-emerald-950/20 border-t border-b border-emerald-500/30">
                <td className="py-3 px-3 font-bold text-emerald-400 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>2. Gross Profit</span>
                </td>
                <td className="py-3 px-3 text-slate-300 font-medium">
                  Total Sales − Cost of Goods Sold (Gross Margin)
                </td>
                <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                  {formatCurrency(summary.grossProfit)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-300">
                  {formatPercent(summary.grossMargin)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Gross Margin
                  </span>
                </td>
              </tr>

              {/* Row 4: Operating Expenses */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 font-semibold text-purple-300 flex items-center gap-2 pl-6">
                  <div className="w-5 h-5 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <span>Less: Operating Expenses (OPEX)</span>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  Sales commissions, marketing, administrative & operational overhead
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-purple-400 text-sm">
                  −{formatCurrency(summary.operatingExpenses)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-purple-300/80">
                  {formatPercent(summary.opexRatio)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Overhead
                  </span>
                </td>
              </tr>

              {/* Row 5: Net Profit */}
              <tr className="bg-teal-950/30 border-t-2 border-b-2 border-teal-500/40">
                <td className="py-3.5 px-3 font-extrabold text-teal-300 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>3. Net Profit</span>
                </td>
                <td className="py-3.5 px-3 text-slate-200 font-semibold">
                  Gross Profit − Operating Expenses (Final Bottom Line)
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-extrabold text-teal-300 text-base">
                  {formatCurrency(summary.netProfit)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-300">
                  {formatPercent(summary.netMargin)}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    Bottom Line
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Margin Health Summary Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marginTiers.map(tier => (
          <div key={tier.label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{tier.label}</span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{tier.count}</span>
              <span className="text-xs text-slate-400">transactions ({Math.round((tier.count / (records.length || 1)) * 100)}%)</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all" 
                style={{ 
                  width: `${(tier.count / (records.length || 1)) * 100}%`,
                  backgroundColor: tier.color 
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Discount vs Margin Scatter Plot */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Discount Rate (%) vs Profit Margin (%) Correlation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Scatter plot of individual deals evaluating price erosion and margin preservation
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="discount" 
                name="Discount Rate" 
                unit="%" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="profitMargin" 
                name="Profit Margin" 
                unit="%" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <ZAxis range={[50, 400]} />
              <Tooltip content={<CustomScatterTooltip />} />
              <Scatter name="Transactions" data={scatterData} fill="#6366f1" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Deal Size Bracket Distribution */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-white mb-1">Deal Size Distribution & Volume</h2>
        <p className="text-xs text-slate-400 mb-4">Revenue and transaction frequency across deal value brackets</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dealTiers} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="tier" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-lg text-xs">
                        <p className="font-bold text-white">{d.tier}</p>
                        <p className="text-indigo-400 mt-1">Total Sales: {formatCurrency(d.sales)}</p>
                        <p className="text-emerald-400">Profit: {formatCurrency(d.profit)}</p>
                        <p className="text-slate-400">{d.count} deals</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
