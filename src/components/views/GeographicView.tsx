import React from 'react';
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  Layers, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { 
  getRegionalBreakdown, 
  getRegionCategoryMatrix, 
  formatCurrency, 
  formatPercent 
} from '../../utils/dataAnalytics';

interface GeographicViewProps {
  records: SalesRecord[];
}

export const GeographicView: React.FC<GeographicViewProps> = ({ records }) => {
  const regionalData = getRegionalBreakdown(records);
  const { regions, categories, matrix } = getRegionCategoryMatrix(records);

  // Country breakdown
  const countryMap: Record<string, { country: string; region: string; sales: number; profit: number; count: number }> = {};
  records.forEach(r => {
    if (!countryMap[r.country]) {
      countryMap[r.country] = { country: r.country, region: r.region, sales: 0, profit: 0, count: 0 };
    }
    countryMap[r.country].sales += r.sales;
    countryMap[r.country].profit += r.profit;
    countryMap[r.country].count += 1;
  });

  const countryList = Object.values(countryMap)
    .sort((a, b) => b.sales - a.sales)
    .map(c => ({
      ...c,
      margin: c.sales > 0 ? (c.profit / c.sales) * 100 : 0
    }));

  // Find max cell sales for heatmap intensity
  let maxCellSales = 1;
  regions.forEach(r => {
    categories.forEach(c => {
      const cellVal = matrix[r]?.[c]?.sales || 0;
      if (cellVal > maxCellSales) maxCellSales = cellVal;
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Regional Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalData.map((reg) => (
          <div 
            key={reg.region} 
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {reg.region}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {reg.share}% Global Share
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(reg.sales)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{reg.deals} transactions</span>
              <span className="text-emerald-400 font-semibold">{reg.margin}% Margin</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 truncate">
              Primary anchor: <strong className="text-slate-300 font-medium">{reg.topCountry}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Tabulation Heatmap Matrix: Region x Category */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Regional Product Matrix Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-tabulation showing revenue concentration across global theatres & product domains
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Intensity:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-3 rounded bg-slate-900 border border-slate-800" />
              <span className="w-4 h-3 rounded bg-indigo-950/60 border border-indigo-800" />
              <span className="w-4 h-3 rounded bg-indigo-800/80" />
              <span className="w-4 h-3 rounded bg-indigo-600" />
            </div>
            <span className="font-semibold text-slate-300">High Revenue</span>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider bg-slate-950/60 rounded-tl-xl">Region</th>
              {categories.map((cat, idx) => (
                <th key={cat} className={`py-3 px-4 font-semibold uppercase tracking-wider bg-slate-950/60 ${idx === categories.length - 1 ? 'rounded-tr-xl' : ''}`}>
                  {cat}
                </th>
              ))}
              <th className="py-3 px-4 font-semibold uppercase tracking-wider bg-slate-950/60 text-right">Region Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {regions.map((reg) => {
              const regTotal = categories.reduce((sum, cat) => sum + (matrix[reg]?.[cat]?.sales || 0), 0);
              return (
                <tr key={reg} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white bg-slate-950/40">
                    {reg}
                  </td>
                  {categories.map((cat) => {
                    const cell = matrix[reg]?.[cat] || { sales: 0, profit: 0, count: 0 };
                    const ratio = cell.sales / maxCellSales;
                    
                    let bgClass = 'bg-slate-950/40 text-slate-400';
                    if (ratio > 0.6) bgClass = 'bg-indigo-600/90 text-white font-bold shadow-sm';
                    else if (ratio > 0.3) bgClass = 'bg-indigo-800/70 text-indigo-100 font-semibold';
                    else if (ratio > 0.05) bgClass = 'bg-indigo-950/70 text-indigo-200';

                    return (
                      <td key={cat} className="p-1">
                        <div className={`p-2.5 rounded-xl border border-slate-800/80 text-center transition-all ${bgClass}`}>
                          <div className="text-xs">{formatCurrency(cell.sales)}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">{cell.count} deals</div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 font-bold text-indigo-300 text-right bg-slate-950/40">
                    {formatCurrency(regTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Country Breakdown Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          Sovereign Country Rankings
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Country</th>
              <th className="py-2.5 px-3">Operating Region</th>
              <th className="py-2.5 px-3">Completed Deals</th>
              <th className="py-2.5 px-3">Total Sales</th>
              <th className="py-2.5 px-3">Net Profit</th>
              <th className="py-2.5 px-3">Profit Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {countryList.map((c, idx) => (
              <tr key={c.country} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  {c.country}
                </td>
                <td className="py-2.5 px-3 text-slate-400">{c.region}</td>
                <td className="py-2.5 px-3">{c.count}</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-300">{formatCurrency(c.sales)}</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-300">{formatCurrency(c.profit)}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {formatPercent(c.margin)}
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
