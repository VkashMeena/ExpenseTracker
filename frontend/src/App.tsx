import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardDateFilter } from './components/DashboardDateFilter';
import { DashboardStats } from './components/DashboardStats';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ExpenseHistoryView } from './components/ExpenseHistoryView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { FRIENDS, FilterState, ExpenseListResponse, StatsResponse } from './types';
import { fetchExpenses, fetchStats } from './services/api';
import { PlusCircle, RefreshCw, CheckCircle, Database, Plus } from 'lucide-react';
import { formatCurrency, formatDatePretty } from './utils/dateUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Global Date Filter syncing across Dashboard & History
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  });

  const [historyFilters, setHistoryFilters] = useState<FilterState>({
    from: '',
    to: '',
    person: '',
    search: ''
  });

  const [expenseData, setExpenseData] = useState<ExpenseListResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDashboardRangeChange = (from: string, to: string) => {
    setDateRange({ from, to });
    setHistoryFilters((prev) => ({ ...prev, from, to }));
  };

  const handleDashboardReset = () => {
    setDateRange({ from: '', to: '' });
    setHistoryFilters((prev) => ({ ...prev, from: '', to: '' }));
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [expRes, statRes] = await Promise.all([
        fetchExpenses({
          from: dateRange.from,
          to: dateRange.to,
          person: historyFilters.person,
          search: historyFilters.search
        }),
        fetchStats(dateRange.from, dateRange.to)
      ]);
      setExpenseData(expRes);
      setStats(statRes);
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, historyFilters.person, historyFilters.search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExpenseAdded = () => {
    showToast('Expense recorded successfully');
    loadData();
  };

  const isFiltered = Boolean(dateRange.from || dateRange.to);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs sm:text-sm font-semibold animate-bounce border border-emerald-400/40">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        friends={FRIENDS}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Expense Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Daily purchase records and payment tracking for Vikash Meena, Devendra Singh, and Kamlesh Meena.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => loadData()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            {/* 1. Date Range Filter on Main Dashboard */}
            <DashboardDateFilter
              from={dateRange.from}
              to={dateRange.to}
              onChangeRange={handleDashboardRangeChange}
              onReset={handleDashboardReset}
              totalFilteredCount={stats?.totalCount}
            />

            {/* 2. Top Stats Cards (Total Payment & 3 Friends Paid Amounts) */}
            <DashboardStats stats={stats} isFiltered={isFiltered} />

            {/* 3. Bar Chart (Total Payment by Friend) */}
            <AnalyticsCharts stats={stats} isFiltered={isFiltered} />

            {/* 4. Recent Purchases Log */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {isFiltered ? 'Purchases in Selected Date Range' : 'Recent Purchases'}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {isFiltered ? 'Transactions filtered by date' : 'Latest purchases added to database'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  View Full History ➔
                </button>
              </div>

              {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentExpenses.map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.description}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{exp.person_name}</span> • {formatDatePretty(exp.expense_date)} ({exp.day_of_week})
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {formatCurrency(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                  No purchases found. Click "+ Add Expense" to record a new purchase.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full History & Search View */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <ExpenseHistoryView
              data={expenseData}
              filters={historyFilters}
              setFilters={setHistoryFilters}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for Mobile View */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xl shadow-emerald-700/60 active:scale-95 transition"
          aria-label="Add Expense"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 sm:py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PostgreSQL Database Active: <strong>maintenance_db</strong></span>
          </div>
          <div>
            Expense Tracker for <strong>Vikash Meena</strong>, <strong>Devendra Singh</strong> & <strong>Kamlesh Meena</strong>
          </div>
        </div>
      </footer>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}
