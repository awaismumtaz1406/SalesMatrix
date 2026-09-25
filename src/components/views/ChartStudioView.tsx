import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  ScatterChart, 
  Scatter, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  SlidersHorizontal, 
  BarChart3, 
  LineChart as LineIcon, 
  PieChart as PieIcon, 
  Activity, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { SalesRecord, ChartType, AggregationType } from '../../types';
import { aggregateData, formatCurrency, formatNumber, formatPercent } from '../../utils/dataAnalytics';

interface ChartStudioViewProps {
  records: SalesRecord[];
}

const PALETTE = ['#6366f1', '#10b981', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

export const ChartStudioView: React.FC<ChartStudioViewProps> = ({ records }) => {
  const [xAxisField, setXAxisField] = useState<string>('category');
  const [yAxisField, setYAxisField] = useState<string>('sales');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [topN, setTopN] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'desc' | 'asc' | 'alpha'>('desc');

  const dimensionFields = [
    { id: 'category', label: 'Product Category' },
    { id: 'subCategory', label: 'Sub-Category' },
    { id: 'region', label: 'Region / Territory' },
    { id: 'country', label: 'Country' },
    { id: 'salesRep', label: 'Sales Representative' },
    { id: 'customerSegment', label: 'Customer Segment' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'paymentMethod', label: 'Payment Method' },
    { id: 'orderStatus', label: 'Order Status' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'year', label: 'Year' },
  ];

  const metricFields = [
    { id: 'sales', label: 'Sales Revenue ($)' },
    { id: 'profit', label: 'Net Profit ($)' },
    { id: 'quantity', label: 'Quantity / Units' },
    { id: 'profitMargin', label: 'Profit Margin (%)' },
    { id: 'discount', label: 'Discount Rate (%)' },
    { id: 'cost', label: 'Cost of Goods ($)' },
  ];

  // Aggregate data dynamically
  const rawAgg = aggregateData(records, xAxisField, yAxisField, aggregation);

  // Sort data
  const sorted = [...rawAgg].sort((a, b) => {
    if (sortBy === 'desc') return b.value - a.value;
    if (sortBy === 'asc') return a.value - b.value;
    return a.name.localeCompare(b.name);
  });

  const chartData = sorted.slice(0, topN);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`cs-${index}`} className="flex items-center gap-2 py-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-semibold text-white ml-auto">
                {yAxisField === 'sales' || yAxisField === 'profit' || yAxisField === 'cost'
                  ? formatCurrency(entry.value)
                  : yAxisField === 'profitMargin' || yAxisField === 'discount'
                  ? formatPercent(entry.value)
                  : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTypes: { id: ChartType; label: string; icon: React.FC<any> }[] = [
    { id: 'bar', label: 'Vertical Bar', icon: BarChart3 },
    { id: 'horizontal_bar', label: 'Horizontal Bar', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: LineIcon },
    { id: 'area', label: 'Area Chart', icon: Activity },
    { id: 'donut', label: 'Donut / Pie', icon: PieIcon },
    { id: 'composed', label: 'Composed Bar+Line', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      
      {/* Studio Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Chart Studio: Custom Visualization Builder
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Craft tailored visual representations by pairing any dimension, metric, and chart geometry
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {chartTypes.map(ct => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.id}
                onClick={() => setChartType(ct.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  chartType === ct.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title={ct.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{ct.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Axis & Parameter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">X-Axis Dimension</label>
          <select
            value={xAxisField}
            onChange={e => setXAxisField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {dimensionFields.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Y-Axis Metric</label>
          <select
            value={yAxisField}
            onChange={e => setYAxisField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {metricFields.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Aggregation</label>
          <select
            value={aggregation}
            onChange={e => setAggregation(e.target.value as AggregationType)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="sum">Sum (Total)</option>
            <option value="avg">Average</option>
            <option value="count">Count of Deals</option>
            <option value="max">Max Value</option>
            <option value="min">Min Value</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sort Order</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="desc">Highest Value First</option>
            <option value="asc">Lowest Value First</option>
            <option value="alpha">Alphabetical (A - Z)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Items to Display</label>
          <select
            value={topN}
            onChange={e => setTopN(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={25}>Top 25</option>
            <option value={50}>All (up to 50)</option>
          </select>
        </div>
      </div>

      {/* Main Rendered Chart Area */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>{dimensionFields.find(d => d.id === xAxisField)?.label}</span>
            <span className="text-slate-500">vs</span>
            <span className="text-indigo-400">{aggregation.toUpperCase()} of {metricFields.find(m => m.id === yAxisField)?.label}</span>
          </div>
          <span className="text-xs text-slate-400">
            Showing {chartData.length} entries
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => yAxisField === 'sales' || yAxisField === 'profit' ? formatCurrency(val) : formatNumber(val)} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name={yAxisField} fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            ) : chartType === 'horizontal_bar' ? (
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => yAxisField === 'sales' || yAxisField === 'profit' ? formatCurrency(val) : formatNumber(val)} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name={yAxisField} fill="#06b6d4" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => yAxisField === 'sales' || yAxisField === 'profit' ? formatCurrency(val) : formatNumber(val)} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name={yAxisField} stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="studioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => yAxisField === 'sales' || yAxisField === 'profit' ? formatCurrency(val) : formatNumber(val)} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name={yAxisField} stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#studioGrad)" />
              </AreaChart>
            ) : chartType === 'donut' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {chartData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11 }} />
              </PieChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={val => yAxisField === 'sales' || yAxisField === 'profit' ? formatCurrency(val) : formatNumber(val)} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name={`${yAxisField} (Bar)`} fill="#6366f1" radius={[4, 4, 0, 0]} barSize={26} />
                <Line type="monotone" dataKey="value" name={`${yAxisField} (Line)`} stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
