import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Copy, 
  Check, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet 
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { formatCurrency, formatPercent, generateSalesCsv } from '../../utils/dataAnalytics';

interface DataTableViewProps {
  records: SalesRecord[];
}

export const DataTableView: React.FC<DataTableViewProps> = ({ records }) => {
  const [sortCol, setSortCol] = useState<keyof SalesRecord>('orderDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSort = (col: keyof SalesRecord) => {
    if (sortCol === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  // Local table search
  const filtered = records.filter(r => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      r.orderId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.salesRep.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const copyRow = (r: SalesRecord) => {
    navigator.clipboard.writeText(JSON.stringify(r, null, 2));
    setCopiedId(r.orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + generateSalesCsv(filtered);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_data_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (col: keyof SalesRecord) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 inline ml-1" />;
    return sortDir === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-indigo-400 inline ml-1" />
      : <ArrowDown className="w-3 h-3 text-indigo-400 inline ml-1" />;
  };

  return (
    <div className="space-y-4">
      
      {/* Table Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter table rows..."
            value={tableSearch}
            onChange={e => {
              setTableSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filtered.length}</strong> records
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th onClick={() => handleSort('orderId')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Order ID {renderSortIcon('orderId')}
                </th>
                <th onClick={() => handleSort('orderDate')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Date {renderSortIcon('orderDate')}
                </th>
                <th onClick={() => handleSort('customerName')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Customer {renderSortIcon('customerName')}
                </th>
                <th onClick={() => handleSort('productName')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Product {renderSortIcon('productName')}
                </th>
                <th onClick={() => handleSort('category')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Category {renderSortIcon('category')}
                </th>
                <th onClick={() => handleSort('region')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Region {renderSortIcon('region')}
                </th>
                <th onClick={() => handleSort('salesRep')} className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap">
                  Sales Rep {renderSortIcon('salesRep')}
                </th>
                <th onClick={() => handleSort('quantity')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Qty {renderSortIcon('quantity')}
                </th>
                <th onClick={() => handleSort('discount')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Disc % {renderSortIcon('discount')}
                </th>
                <th onClick={() => handleSort('sales')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Total Sales {renderSortIcon('sales')}
                </th>
                <th onClick={() => handleSort('cost')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  COGS {renderSortIcon('cost')}
                </th>
                <th onClick={() => handleSort('grossProfit')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Gross Profit {renderSortIcon('grossProfit')}
                </th>
                <th onClick={() => handleSort('operatingExpenses')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  OPEX {renderSortIcon('operatingExpenses')}
                </th>
                <th onClick={() => handleSort('netProfit')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Net Profit {renderSortIcon('netProfit')}
                </th>
                <th onClick={() => handleSort('profitMargin')} className="py-3 px-3 cursor-pointer hover:text-white text-right whitespace-nowrap">
                  Margin % {renderSortIcon('profitMargin')}
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginated.map((r) => (
                <tr key={r.orderId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-300 whitespace-nowrap">
                    {r.orderId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {r.orderDate}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap max-w-[160px] truncate" title={r.customerName}>
                    {r.customerName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap max-w-[180px] truncate" title={r.productName}>
                    {r.productName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {r.category}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {r.region}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                    {r.salesRep}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {r.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                    {Math.round(r.discount * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                    {formatCurrency(r.sales)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-amber-400 whitespace-nowrap">
                    {formatCurrency(r.cogs ?? r.cost)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                    {formatCurrency(r.grossProfit ?? (r.sales - r.cost))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-purple-400 whitespace-nowrap">
                    {formatCurrency(r.operatingExpenses ?? (r.sales * 0.16))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-teal-300 whitespace-nowrap">
                    {formatCurrency(r.netProfit ?? r.profit)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {formatPercent(r.profitMargin)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => copyRow(r)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Copy Row JSON"
                    >
                      {copiedId === r.orderId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
