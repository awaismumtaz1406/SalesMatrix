import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Line, 
  ComposedChart 
} from 'recharts';
import { 
  PieChart as PieIcon, 
  Layers, 
  Target, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { 
  getCategoryBreakdown, 
  getParetoAnalysis, 
  formatCurrency, 
  formatPercent 
} from '../../utils/dataAnalytics';

interface CategoriesViewProps {
  records: SalesRecord[];
}

const REGION_COLORS: Record<string, string> = {
  'North America': '#6366f1',
  'Europe': '#10b981',
  'Asia Pacific': '#a855f7',
  'Latin America': '#f59e0b',
  'Global': '#06b6d4'
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ records }) => {
  const [paretoMode, setParetoMode] = useState<'productName' | 'subCategory'>('subCategory');
  
  const categoryData = getCategoryBreakdown(records);
  const paretoData = getParetoAnalysis(records, paretoMode).slice(0, 10);

  // Build stacked Category x Region breakdown
  const regions = Array.from(new Set(records.map(r => r.region)));
  const stackedMap: Record<string, any> = {};

  records.forEach(r => {
    if (!stackedMap[r.category]) {
      stackedMap[r.category] = { category: r.category };
      regions.forEach(reg => {
        stackedMap[r.category][reg] = 0;
      });
    }
    stackedMap[r.category][r.region] = (stackedMap[r.category][r.region] || 0) + r.sales;
  });

  const stackedData = Object.values(stackedMap);

  // Sub-category analysis
  const subCatMap: Record<string, { subCategory: string; category: string; sales: number; profit: number; count: number }> = {};
  records.forEach(r => {
    if (!subCatMap[r.subCategory]) {
      subCatMap[r.subCategory] = { subCategory: r.subCategory, category: r.category, sales: 0, profit: 0, count: 0 };
    }
    subCatMap[r.subCategory].sales += r.sales;
    subCatMap[r.subCategory].profit += r.profit;
    subCatMap[r.subCategory].count += 1;
  });

  const subCatList = Object.values(subCatMap)
    .sort((a, b) => b.sales - a.sales)
    .map(sc => ({
      ...sc,
      margin: sc.sales > 0 ? (sc.profit / sc.sales) * 100 : 0
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`cat-${index}`} className="flex items-center gap-2 py-0.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }} 
              />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="font-semibold text-white ml-auto">
                {entry.name.toLowerCase().includes('share') 
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
      
      {/* Row 1: Stacked Category x Region Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Category Sales Stacked by Operating Region
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Examine which geographical territories generate demand for each product line
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => formatCurrency(val)} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              {regions.map((reg) => (
                <Bar 
                  key={reg} 
                  dataKey={reg} 
                  name={reg} 
                  stackId="regionStack" 
                  fill={REGION_COLORS[reg] || '#6366f1'} 
                  radius={[0, 0, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Pareto 80/20 Analysis */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              80/20 Pareto Distribution Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify vital products and sub-categories driving cumulative revenue
            </p>
          </div>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setParetoMode('subCategory')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                paretoMode === 'subCategory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              By Sub-Category
            </button>
            <button
              onClick={() => setParetoMode('productName')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                paretoMode === 'productName' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              By Product SKU
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                interval={0} 
                angle={-20} 
                textAnchor="end" 
              />
              <YAxis 
                yAxisId="left" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickFormatter={val => formatCurrency(val)} 
                axisLine={false} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickFormatter={val => `${val}%`} 
                domain={[0, 100]} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar 
                yAxisId="left" 
                dataKey="sales" 
                name="Revenue" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={28} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="cumulativeShare" 
                name="Cumulative Share %" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={{ fill: '#10b981', r: 4 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Sub-Category Profitability Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          Sub-Category Performance Ledger
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Sub-Category</th>
              <th className="py-2.5 px-3">Parent Line</th>
              <th className="py-2.5 px-3">Deals</th>
              <th className="py-2.5 px-3">Revenue</th>
              <th className="py-2.5 px-3">Net Profit</th>
              <th className="py-2.5 px-3">Profit Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {subCatList.map((sc, idx) => (
              <tr key={sc.subCategory} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  {sc.subCategory}
                </td>
                <td className="py-2.5 px-3 text-slate-400">{sc.category}</td>
                <td className="py-2.5 px-3">{sc.count}</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-300">{formatCurrency(sc.sales)}</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-300">{formatCurrency(sc.profit)}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {formatPercent(sc.margin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
