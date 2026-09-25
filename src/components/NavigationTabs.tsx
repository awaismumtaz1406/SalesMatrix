import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Globe, 
  Users, 
  ScatterChart as ScatterIcon, 
  Table2, 
  SlidersHorizontal,
  Table
} from 'lucide-react';
import { DashboardView } from '../types';

interface NavigationTabsProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  onSelectView
}) => {
  const tabs: { id: DashboardView; label: string; icon: React.FC<any>; description: string }[] = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, description: 'High-level business KPIs, trendline & category share' },
    { id: 'trends', label: 'Trends & Time Series', icon: TrendingUp, description: 'Monthly/Quarterly growth curves & velocity' },
    { id: 'categories', label: 'Products & Categories', icon: PieChart, description: 'Category share, stacked regional bars & Pareto analysis' },
    { id: 'geographic', label: 'Geographic Matrix', icon: Globe, description: 'Territory performance, countries & cross-tab heatmap' },
    { id: 'team', label: 'Sales Leaderboard', icon: Users, description: 'Rep rankings, deal volumes & margin performance' },
    { id: 'financial', label: 'Margin & Correlation', icon: ScatterIcon, description: 'Discount vs Margin scatter plot & health tiers' },
    { id: 'pivot', label: 'Dynamic Pivot', icon: Table2, description: 'Interactive multi-dimensional slice & dice' },
    { id: 'builder', label: 'Chart Studio', icon: SlidersHorizontal, description: 'Build any custom chart on the fly' },
    { id: 'table', label: 'Data Explorer', icon: Table, description: 'Searchable, sortable raw records table' },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={tab.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
