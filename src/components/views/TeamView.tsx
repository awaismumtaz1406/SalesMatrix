import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Users, 
  Award, 
  Percent, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getSalesRepLeaderboard, formatCurrency, formatPercent } from '../../utils/dataAnalytics';

interface TeamViewProps {
  records: SalesRecord[];
}

export const TeamView: React.FC<TeamViewProps> = ({ records }) => {
  const reps = getSalesRepLeaderboard(records);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`rep-${index}`} className="flex items-center gap-2 py-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-semibold text-white ml-auto">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Reps Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reps.map((rep, idx) => {
          const isTop3 = idx < 3;
          const badgeColor = 
            idx === 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            idx === 1 ? 'bg-slate-400/20 text-slate-200 border-slate-400/40' :
            idx === 2 ? 'bg-amber-700/20 text-amber-400 border-amber-700/40' :
            'bg-slate-800 text-slate-400 border-slate-700';

          return (
            <div 
              key={rep.name}
              className={`p-5 rounded-2xl bg-slate-900/60 border ${isTop3 ? 'border-slate-700 shadow-indigo-500/5' : 'border-slate-800'} shadow-lg relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor} flex items-center gap-1`}>
                  {idx === 0 && <Award className="w-3 h-3 text-amber-400" />}
                  Rank #{idx + 1}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  {rep.margin}% Margin
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-bold text-white tracking-tight">{rep.name}</h3>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {formatCurrency(rep.sales)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">Deals Closed:</span>
                  <div className="text-slate-200 font-semibold">{rep.deals} transactions</div>
                </div>
                <div>
                  <span className="text-slate-500">Avg Deal Size:</span>
                  <div className="text-slate-200 font-semibold">{formatCurrency(rep.aov)}</div>
                </div>
                <div>
                  <span className="text-slate-500">Net Profit:</span>
                  <div className="text-emerald-400 font-semibold">{formatCurrency(rep.profit)}</div>
                </div>
                <div>
                  <span className="text-slate-500">Avg Discount:</span>
                  <div className="text-slate-200 font-semibold">{rep.avgDiscount}%</div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Top Domain:</span>
                <span className="font-semibold text-slate-300 truncate max-w-[150px]">{rep.topCategory}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart: Sales vs Profit by Representative */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Sales Representative Performance Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side revenue generated vs net profit captured per account executive
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reps} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => formatCurrency(val)} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar dataKey="sales" name="Total Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={26} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
