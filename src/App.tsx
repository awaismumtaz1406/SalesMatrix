import React, { useState, useMemo, useEffect } from 'react';
import { SalesRecord, DashboardFilter, DashboardView, SavedDashboard } from './types';
import { DEFAULT_SALES_DATA } from './data/defaultSalesData';
import { 
  filterRecords, 
  calculateKPISummary, 
  generateSalesCsv 
} from './utils/dataAnalytics';
import { supabase, isSupabaseConfigured, fetchUserDashboards } from './supabaseClient';
import { User } from '@supabase/supabase-js';

import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { FilterBar } from './components/FilterBar';
import { NavigationTabs } from './components/NavigationTabs';
import { DataUploadModal } from './components/DataUploadModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { AuthModal } from './components/AuthModal';
import { SavedDashboardsModal } from './components/SavedDashboardsModal';

import { OverviewView } from './components/views/OverviewView';
import { TrendsView } from './components/views/TrendsView';
import { CategoriesView } from './components/views/CategoriesView';
import { GeographicView } from './components/views/GeographicView';
import { TeamView } from './components/views/TeamView';
import { FinancialView } from './components/views/FinancialView';
import { PivotView } from './components/views/PivotView';
import { ChartStudioView } from './components/views/ChartStudioView';
import { DataTableView } from './components/views/DataTableView';
import { Cloud, LogIn, X } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<SalesRecord[]>(DEFAULT_SALES_DATA);
  const [datasetName, setDatasetName] = useState<string>('Sales data - Sheet1.csv');
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  // Supabase Auth & Cloud State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedDashboardsCount, setSavedDashboardsCount] = useState<number>(0);
  const [dismissBanner, setDismissBanner] = useState<boolean>(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Filters state
  const [filter, setFilter] = useState<DashboardFilter>({
    dateRange: 'all',
    regions: [],
    categories: [],
    salesReps: [],
    customerSegments: [],
    orderStatuses: [],
    searchQuery: '',
  });

  // Supabase auth subscription
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        updateSavedCount();
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        updateSavedCount();
      } else {
        setSavedDashboardsCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateSavedCount = async () => {
    const { data } = await fetchUserDashboards();
    if (data) {
      setSavedDashboardsCount(data.length);
    }
  };

  // Unique options extracted from data
  const availableRegions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.region))).filter(Boolean).sort();
  }, [records]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(records.map(r => r.category))).filter(Boolean).sort();
  }, [records]);

  const availableSalesReps = useMemo(() => {
    return Array.from(new Set(records.map(r => r.salesRep))).filter(Boolean).sort();
  }, [records]);

  const availableSegments = useMemo(() => {
    return Array.from(new Set(records.map(r => r.customerSegment))).filter(Boolean).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filter);
  }, [records, filter]);

  // Computed KPI Summary
  const kpiSummary = useMemo(() => {
    return calculateKPISummary(filteredRecords);
  }, [filteredRecords]);

  // Handlers
  const handleLoadNewData = (newRecords: SalesRecord[], name: string) => {
    setRecords(newRecords);
    setDatasetName(name);
    setIsCustomData(true);
    setFilter({
      dateRange: 'all',
      regions: [],
      categories: [],
      salesReps: [],
      customerSegments: [],
      orderStatuses: [],
      searchQuery: '',
    });
  };

  const handleResetData = () => {
    setRecords(DEFAULT_SALES_DATA);
    setDatasetName('Sales data - Sheet1.csv');
    setIsCustomData(false);
    setFilter({
      dateRange: 'all',
      regions: [],
      categories: [],
      salesReps: [],
      customerSegments: [],
      orderStatuses: [],
      searchQuery: '',
    });
  };

  const handleLoadSavedDashboard = (saved: SavedDashboard) => {
    if (saved.data?.records && Array.isArray(saved.data.records)) {
      setRecords(saved.data.records);
      setDatasetName(saved.data.datasetName || saved.name);
      setIsCustomData(true);
      if (saved.data.view) {
        setCurrentView(saved.data.view);
      }
      if (saved.data.filter) {
        setFilter(prev => ({
          ...prev,
          ...saved.data.filter
        }));
      }
      updateSavedCount();
    }
  };

  const handleExportFilteredCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + generateSalesCsv(filteredRecords);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${datasetName.replace('.csv', '')}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      
      {/* Top Application Navbar */}
      <Navbar
        currentDatasetName={datasetName}
        rowCount={records.length}
        totalSales={kpiSummary.totalSales}
        isCustomData={isCustomData}
        currentUser={currentUser}
        savedCount={savedDashboardsCount}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onResetData={handleResetData}
        onExportCsv={handleExportFilteredCsv}
        onOpenAiInsights={() => setIsAiInsightsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* Polite Cloud Persistence Prompt for unauthenticated visitors */}
      {!currentUser && !dismissBanner && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/20 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Cloud className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Cloud Persistence:</strong> Sign in with Supabase to save your customized views & datasets, or explore the live interactive dashboard below.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In / Sign Up</span>
              </button>
              <button
                onClick={() => setDismissBanner(true)}
                className="p-1 text-slate-400 hover:text-white"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top-Level KPI Summary Cards */}
        <KPICards summary={kpiSummary} />

        {/* Dynamic Multi-Dimension Filter Bar */}
        <FilterBar
          filter={filter}
          onChangeFilter={setFilter}
          availableRegions={availableRegions}
          availableCategories={availableCategories}
          availableSalesReps={availableSalesReps}
          availableSegments={availableSegments}
          totalRecordsCount={records.length}
          filteredRecordsCount={filteredRecords.length}
        />

        {/* View Selection Tabs */}
        <NavigationTabs
          currentView={currentView}
          onSelectView={setCurrentView}
        />

        {/* Rendered View Component */}
        <div className="transition-all duration-300">
          {filteredRecords.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center my-8">
              <h3 className="text-base font-bold text-white mb-2">No matching records found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                No transactions match your current search query or active filter combination.
              </p>
              <button
                onClick={() => setFilter({
                  dateRange: 'all',
                  regions: [],
                  categories: [],
                  salesReps: [],
                  customerSegments: [],
                  orderStatuses: [],
                  searchQuery: '',
                })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {currentView === 'overview' && (
                <OverviewView 
                  records={filteredRecords} 
                  summary={kpiSummary} 
                  onOpenAiInsights={() => setIsAiInsightsOpen(true)}
                />
              )}
              {currentView === 'trends' && (
                <TrendsView records={filteredRecords} />
              )}
              {currentView === 'categories' && (
                <CategoriesView records={filteredRecords} />
              )}
              {currentView === 'geographic' && (
                <GeographicView records={filteredRecords} />
              )}
              {currentView === 'team' && (
                <TeamView records={filteredRecords} />
              )}
              {currentView === 'financial' && (
                <FinancialView records={filteredRecords} />
              )}
              {currentView === 'pivot' && (
                <PivotView records={filteredRecords} />
              )}
              {currentView === 'builder' && (
                <ChartStudioView records={filteredRecords} />
              )}
              {currentView === 'table' && (
                <DataTableView records={filteredRecords} />
              )}
            </>
          )}
        </div>

      </main>

      {/* CSV Import & Management Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadNewData={handleLoadNewData}
        onResetToDefault={handleResetData}
        currentDatasetName={datasetName}
        currentRecords={records}
      />

      {/* AI & Statistical Intelligence Modal */}
      <AIInsightsModal
        isOpen={isAiInsightsOpen}
        onClose={() => setIsAiInsightsOpen(false)}
        records={filteredRecords}
        summary={kpiSummary}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user) updateSavedCount();
        }}
      />

      {/* Saved Cloud Dashboards Modal */}
      <SavedDashboardsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentRecords={records}
        currentDatasetName={datasetName}
        currentView={currentView}
        currentFilter={filter}
        onLoadDashboard={handleLoadSavedDashboard}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SalesMatrix Studio • Interactive Data Visualization Dashboard
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>RFC-4180 CSV Engine</span>
            <span>•</span>
            <span>Supabase Cloud Auth & Persistence</span>
            <span>•</span>
            <span>Gemini Intelligence</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
