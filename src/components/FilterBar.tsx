import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar, 
  MapPin, 
  Tag, 
  UserCheck, 
  CheckSquare, 
  Square,
  RotateCcw
} from 'lucide-react';
import { DashboardFilter, SalesRecord } from '../types';

interface FilterBarProps {
  filter: DashboardFilter;
  onChangeFilter: (newFilter: DashboardFilter) => void;
  availableRegions: string[];
  availableCategories: string[];
  availableSalesReps: string[];
  availableSegments: string[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  availableRegions,
  availableCategories,
  availableSalesReps,
  availableSegments,
  totalRecordsCount,
  filteredRecordsCount
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => prev === key ? null : key);
  };

  const handleDateRange = (range: DashboardFilter['dateRange']) => {
    onChangeFilter({ ...filter, dateRange: range });
  };

  const toggleArrayItem = (key: keyof DashboardFilter, val: string) => {
    const current = (filter[key] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter(x => x !== val)
      : [...current, val];
    onChangeFilter({ ...filter, [key]: updated });
  };

  const clearAllFilters = () => {
    onChangeFilter({
      dateRange: 'all',
      regions: [],
      categories: [],
      salesReps: [],
      customerSegments: [],
      orderStatuses: [],
      searchQuery: ''
    });
  };

  const hasActiveFilters = 
    filter.dateRange !== 'all' ||
    filter.regions.length > 0 ||
    filter.categories.length > 0 ||
    filter.salesReps.length > 0 ||
    filter.customerSegments.length > 0 ||
    filter.searchQuery.trim().length > 0;

  const dateOptions: { id: DashboardFilter['dateRange']; label: string }[] = [
    { id: 'all', label: 'All Dates' },
    { id: '2024', label: 'FY 2024' },
    { id: '2025', label: 'FY 2025' },
    { id: 'q1', label: 'Q1' },
    { id: 'q2', label: 'Q2' },
    { id: 'q3', label: 'Q3' },
    { id: 'q4', label: 'Q4' },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 mb-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Date Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Period:
          </span>
          {dateOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleDateRange(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                filter.dateRange === opt.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search & Active Record Count */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, customer, rep..."
              value={filter.searchQuery}
              onChange={e => onChangeFilter({ ...filter, searchQuery: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onChangeFilter({ ...filter, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
            <span className="text-indigo-400 font-semibold">{filteredRecordsCount}</span> / {totalRecordsCount} records
          </div>
        </div>

      </div>

      {/* Multi-dimension dropdown filters bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Slice by:
          </span>

          {/* Region Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('region')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter.regions.length > 0
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3 h-3 text-indigo-400" />
              <span>Region {filter.regions.length > 0 ? `(${filter.regions.length})` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {openDropdown === 'region' && (
              <div className="absolute left-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 p-2">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Regions
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                  {availableRegions.map(reg => {
                    const checked = filter.regions.includes(reg);
                    return (
                      <button
                        key={reg}
                        onClick={() => toggleArrayItem('regions', reg)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-200 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        {checked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{reg}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('category')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter.categories.length > 0
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Tag className="w-3 h-3 text-purple-400" />
              <span>Category {filter.categories.length > 0 ? `(${filter.categories.length})` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {openDropdown === 'category' && (
              <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 p-2">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Categories
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                  {availableCategories.map(cat => {
                    const checked = filter.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleArrayItem('categories', cat)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-200 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        {checked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sales Rep Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('salesRep')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter.salesReps.length > 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>Sales Rep {filter.salesReps.length > 0 ? `(${filter.salesReps.length})` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {openDropdown === 'salesRep' && (
              <div className="absolute left-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 p-2">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Sales Reps
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                  {availableSalesReps.map(rep => {
                    const checked = filter.salesReps.includes(rep);
                    return (
                      <button
                        key={rep}
                        onClick={() => toggleArrayItem('salesReps', rep)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-200 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        {checked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{rep}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Segment Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('segment')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter.customerSegments.length > 0
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Segment {filter.customerSegments.length > 0 ? `(${filter.customerSegments.length})` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {openDropdown === 'segment' && (
              <div className="absolute left-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 p-2">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Segment
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                  {availableSegments.map(seg => {
                    const checked = filter.customerSegments.includes(seg);
                    return (
                      <button
                        key={seg}
                        onClick={() => toggleArrayItem('customerSegments', seg)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-200 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        {checked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{seg}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/40 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

    </div>
  );
};
