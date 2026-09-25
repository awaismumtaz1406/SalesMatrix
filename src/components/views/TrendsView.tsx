import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Bar, 
  Line, 
  ComposedChart,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Layers, 
  Zap, 
  ArrowUpRight 
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/dataAnalytics';

interface TrendsViewProps {
  records: SalesRecord[];
}

export const TrendsView: React.FC<TrendsViewProps> = ({ records }) => {
  const [granularity, setGranularity] = useState<'monthly' | 'quarterly'>('monthly');
  const [activeMetric, setActiveMetric] = useState<'sales' | 'profit' | 'quantity' | 'margin'>('sales');
  const [chartStyle, setChartStyle] = useState<'area' | 'composed'>('composed');

  // Compute monthly data
  const monthlyMap: Record<string, { period: string; sales: number; profit: number; quantity: number; orders: number }> = {};
  
  const sorted = [...records].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

  sorted.forEach(r => {
    const key = granularity === 'monthly' ? r.month : r.quarter;
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        period: key,
        sales: 0,
        profit: 0,
        quantity: 0,
        orders: 0
      };
    }
    monthlyMap[key].sales += r.sales;
    monthlyMap[key].profit += r.profit;
    monthlyMap[key].quantity += r.quantity;
    monthlyMap[key].orders += 1;
  });

  // Calculate cumulative and margin
  let cumSales = 0;
  const trendData = Object.values(monthlyMap).map(m => {
    cumSales += m.sales;
    const margin = m.sales > 0 ? (m.profit / m.sales) * 100 : 0;
    return {
      ...m,
      sales: Math.round(m.sales),
      profit: Math.round(m.profit),
      cumSales: Math.round(cumSales),
      margin: Math.round(margin * 10) / 10,
      aov: m.orders > 0 ? Math.round(m.sales / m.orders) : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`trend-${index}`} className="flex items-center gap-2 py-0.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }} 
              />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-semibold text-white ml-auto">
                {entry.name.toLowerCase().includes('margin') 
                  ? formatPercent(entry.value)
                  : entry.name.toLowerCase().includes('quantity')
                  ? formatNumber(entry.value)
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
      
      {/* Control Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Financial Growth & Velocity Curves
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate time-series patterns, quarterly seasonality, and cumulative revenue build
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Granularity Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                granularity === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGranularity('quarterly')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                granularity === 'quarterly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quarterly
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMetric('sales')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMetric === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveMetric('profit')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMetric === 'profit' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => setActiveMetric('margin')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMetric === 'margin' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Margin %
            </button>
            <button
              onClick={() => setActiveMetric('quantity')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMetric === 'quantity' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Units
            </button>
          </div>

          {/* Chart Style Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartStyle('composed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartStyle === 'composed' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              Dual Bars+Line
            </button>
            <button
              onClick={() => setChartStyle('area')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartStyle === 'area' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              Smooth Area
            </button>
          </div>
        </div>
      </div>

      {/* Main Trend Visualization */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'composed' ? (
              <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  tickFormatter={val => activeMetric === 'margin' ? `${val}%` : activeMetric === 'quantity' ? formatNumber(val) : formatCurrency(val)} 
                  axisLine={false} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  tickFormatter={val => `${val}%`} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar 
                  yAxisId="left" 
                  dataKey={activeMetric} 
                  name={activeMetric === 'sales' ? 'Revenue' : activeMetric === 'profit' ? 'Profit' : activeMetric === 'margin' ? 'Margin %' : 'Quantity Sold'} 
                  fill={activeMetric === 'profit' ? '#10b981' : activeMetric === 'margin' ? '#a855f7' : activeMetric === 'quantity' ? '#06b6d4' : '#6366f1'} 
                  radius={[6, 6, 0, 0]} 
                  barSize={24} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="margin" 
                  name="Gross Margin %" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#f59e0b', r: 3 }} 
                />
              </ComposedChart>
            ) : (
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  tickFormatter={val => activeMetric === 'margin' ? `${val}%` : activeMetric === 'quantity' ? formatNumber(val) : formatCurrency(val)} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  name={activeMetric} 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#metricGrad)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Growth Curve */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Cumulative Revenue Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate revenue accumulation across chronological periods</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickFormatter={val => formatCurrency(val)} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="cumSales" 
                name="Cumulative Revenue" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#cumGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
