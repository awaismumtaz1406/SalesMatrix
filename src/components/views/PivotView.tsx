import React, { useState } from 'react';
import { 
  Table2, 
  Download, 
  ArrowUpDown, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';
import { SalesRecord, AggregationType } from '../../types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/dataAnalytics';

interface PivotViewProps {
  records: SalesRecord[];
}

export const PivotView: React.FC<PivotViewProps> = ({ records }) => {
  const [rowField, setRowField] = useState<string>('category');
  const [colField, setColField] = useState<string>('region');
  const [valField, setValField] = useState<string>('sales');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');

  const dimensionOptions = [
    { id: 'category', label: 'Product Category' },
    { id: 'subCategory', label: 'Sub-Category' },
    { id: 'region', label: 'Territory / Region' },
    { id: 'country', label: 'Country' },
    { id: 'salesRep', label: 'Sales Representative' },
    { id: 'customerSegment', label: 'Customer Segment' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'month', label: 'Month' },
    { id: 'paymentMethod', label: 'Payment Method' },
    { id: 'orderStatus', label: 'Order Status' },
  ];

  const metricOptions = [
    { id: 'sales', label: 'Sales Revenue ($)' },
    { id: 'profit', label: 'Net Profit ($)' },
    { id: 'quantity', label: 'Quantity / Units' },
    { id: 'profitMargin', label: 'Profit Margin (%)' },
    { id: 'discount', label: 'Discount Rate (%)' },
  ];

  // Extract unique row keys & col keys
  const rowKeys = Array.from(new Set(records.map(r => String(r[rowField] || 'N/A')))).sort();
  const colKeys = Array.from(new Set(records.map(r => String(r[colField] || 'N/A')))).sort();

  // Accumulate cell values
  const cellMap: Record<string, Record<string, number[]>> = {};
  rowKeys.forEach(r => {
    cellMap[r] = {};
    colKeys.forEach(c => {
      cellMap[r][c] = [];
    });
  });

  records.forEach(item => {
    const rKey = String(item[rowField] || 'N/A');
    const cKey = String(item[colField] || 'N/A');
    const val = Number(item[valField]) || 0;
    if (cellMap[rKey] && cellMap[rKey][cKey]) {
      cellMap[rKey][cKey].push(val);
    }
  });

  const aggregate = (vals: number[]): number => {
    if (vals.length === 0) return 0;
    if (aggregation === 'sum') return vals.reduce((a, b) => a + b, 0);
    if (aggregation === 'avg') return vals.reduce((a, b) => a + b, 0) / vals.length;
    if (aggregation === 'count') return vals.length;
    if (aggregation === 'max') return Math.max(...vals);
    if (aggregation === 'min') return Math.min(...vals);
    return 0;
  };

  const formatPivotVal = (val: number) => {
    if (val === 0) return '—';
    if (aggregation === 'count') return formatNumber(val);
    if (valField === 'profitMargin' || valField === 'discount') return formatPercent(val);
    return formatCurrency(val);
  };

  // Export pivot table to CSV
  const handleExportPivotCsv = () => {
    const headers = [rowField.toUpperCase(), ...colKeys, 'ROW TOTAL'];
    const rows = rowKeys.map(r => {
      const rowVals = colKeys.map(c => aggregate(cellMap[r][c]));
      const allRowVals = colKeys.flatMap(c => cellMap[r][c]);
      const rowTotal = aggregate(allRowVals);
      return [`"${r}"`, ...rowVals, rowTotal].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pivot_${rowField}_by_${colField}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Pivot Controls Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Table2 className="w-4 h-4 text-indigo-400" />
            Dynamic Multi-Dimensional Pivot Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Slice and aggregate any business dimension across any column axis
          </p>
        </div>

        <button
          onClick={handleExportPivotCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 self-start lg:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Pivot CSV</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Row Dimension (Y)</label>
          <select
            value={rowField}
            onChange={e => setRowField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {dimensionOptions.filter(d => d.id !== colField).map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Column Dimension (X)</label>
          <select
            value={colField}
            onChange={e => setColField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {dimensionOptions.filter(d => d.id !== rowField).map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Metric Value</label>
          <select
            value={valField}
            onChange={e => setValField(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {metricOptions.map(m => (
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
            <option value="count">Count of Records</option>
            <option value="max">Maximum</option>
            <option value="min">Minimum</option>
          </select>
        </div>
      </div>

      {/* Rendered Pivot Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4 font-bold text-slate-200 bg-slate-950 uppercase tracking-wider rounded-tl-xl">
                {dimensionOptions.find(d => d.id === rowField)?.label} \ {dimensionOptions.find(d => d.id === colField)?.label}
              </th>
              {colKeys.map((c, idx) => (
                <th key={c} className={`py-3 px-4 font-semibold uppercase tracking-wider bg-slate-950/80 text-right ${idx === colKeys.length - 1 ? '' : ''}`}>
                  {c}
                </th>
              ))}
              <th className="py-3 px-4 font-bold uppercase tracking-wider bg-slate-950 text-right text-indigo-400 rounded-tr-xl">
                Row Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {rowKeys.map(r => {
              const allRowVals = colKeys.flatMap(c => cellMap[r][c]);
              const rowTotal = aggregate(allRowVals);
              return (
                <tr key={r} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/30">
                    {r}
                  </td>
                  {colKeys.map(c => {
                    const cellVals = cellMap[r][c];
                    const val = aggregate(cellVals);
                    return (
                      <td key={c} className="py-3 px-4 text-right font-medium">
                        {formatPivotVal(val)}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-indigo-300 bg-slate-950/30">
                    {formatPivotVal(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Column Totals Footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-800 bg-slate-950 font-bold text-slate-200">
              <td className="py-3 px-4 uppercase text-slate-400 rounded-bl-xl">Column Total</td>
              {colKeys.map(c => {
                const allColVals = rowKeys.flatMap(r => cellMap[r][c]);
                const colTotal = aggregate(allColVals);
                return (
                  <td key={c} className="py-3 px-4 text-right text-emerald-400">
                    {formatPivotVal(colTotal)}
                  </td>
                );
              })}
              {/* Grand Total */}
              <td className="py-3 px-4 text-right text-indigo-400 text-sm font-extrabold rounded-br-xl">
                {formatPivotVal(aggregate(records.map(r => Number(r[valField]) || 0)))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};
