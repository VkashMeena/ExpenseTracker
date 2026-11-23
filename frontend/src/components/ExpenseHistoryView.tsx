import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  Download,
  RotateCcw,
  User,
  AlertCircle
} from 'lucide-react';
import { ExpenseListResponse, FilterState, FriendName } from '../types';
import { formatCurrency, formatDatePretty, getTodayDateString } from '../utils/dateUtils';
import { deleteExpense } from '../services/api';

interface ExpenseHistoryViewProps {
  data: ExpenseListResponse | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onRefresh: () => void;
  isLoading: boolean;
}

const FRIEND_BADGES: Record<FriendName, { bg: string; text: string; dot: string }> = {
  'Vikash Meena': { bg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Devendra Singh': { bg: 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  'Kamlesh Meena': { bg: 'bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' }
};

export const ExpenseHistoryView: React.FC<ExpenseHistoryViewProps> = ({
  data,
  filters,
  setFilters,
  onRefresh,
  isLoading
}) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick range helper
  const handleQuickRange = (type: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (type === 'today') {
      const t = formatDate(today);
      setFilters((prev) => ({ ...prev, from: t, to: t }));
    } else if (type === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const str = formatDate(y);
      setFilters((prev) => ({ ...prev, from: str, to: str }));
    } else if (type === 'week') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 6);
      setFilters((prev) => ({ ...prev, from: formatDate(past7), to: formatDate(today) }));
    } else if (type === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilters((prev) => ({ ...prev, from: formatDate(firstDay), to: formatDate(today) }));
    } else if (type === 'all') {
      setFilters((prev) => ({ ...prev, from: '', to: '' }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      from: '',
      to: '',
      person: '',
      search: ''
    });
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await deleteExpense(id);
      setDeleteId(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!data || data.expenses.length === 0) return;
    const headers = ['ID', 'Date', 'Day', 'Paid By', 'Item Description', 'Category', 'Amount (INR)'];
    const rows = data.expenses.map((e) => [
      e.id,
      e.expense_date,
      e.day_of_week,
      `"${e.person_name}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Room_Expenses_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const expenses = data?.expenses || [];
  const filteredTotal = data?.filteredTotal || 0;
  const friendTotals = data?.friendTotals || {
    'Vikash Meena': 0,
    'Devendra Singh': 0,
    'Kamlesh Meena': 0
  };

  const hasActiveFilters = Boolean(filters.from || filters.to || filters.person || filters.search);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Search & Date Filter Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Date-wise Search & History Filter</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter and view purchases between two dates
            </p>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleQuickRange('today')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickRange('yesterday')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickRange('week')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickRange('month')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickRange('all')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* From Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              From Date
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              To Date
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Friend Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Paid By
            </label>
            <select
              value={filters.person}
              onChange={(e) => setFilters((prev) => ({ ...prev, person: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium"
            >
              <option value="">All 3 Friends</option>
              <option value="Vikash Meena">Vikash Meena</option>
              <option value="Devendra Singh">Devendra Singh</option>
              <option value="Kamlesh Meena">Kamlesh Meena</option>
            </select>
          </div>

          {/* Search by Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Search Items
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Milk, Vegetables, Rent..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Clear and Status Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Filtered results active {filters.from && `from ${filters.from}`} {filters.to && `to ${filters.to}`}
            </span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Filtered Total Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                {hasActiveFilters ? '🔍 Filtered Range Total' : 'Total Expense Summary'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {expenses.length} Records Found
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrency(filteredTotal)}
            </div>
          </div>

          {/* Individual Breakdowns for this Range */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="bg-white/10 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-xs border border-white/5">
              <div className="text-emerald-300 font-semibold">Vikash Meena</div>
              <div className="text-sm sm:text-base font-bold">{formatCurrency(friendTotals['Vikash Meena'])}</div>
            </div>

            <div className="bg-white/10 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-xs border border-white/5">
              <div className="text-blue-300 font-semibold">Devendra Singh</div>
              <div className="text-sm sm:text-base font-bold">{formatCurrency(friendTotals['Devendra Singh'])}</div>
            </div>

            <div className="bg-white/10 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-xs border border-white/5">
              <div className="text-purple-300 font-semibold">Kamlesh Meena</div>
              <div className="text-sm sm:text-base font-bold">{formatCurrency(friendTotals['Kamlesh Meena'])}</div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={expenses.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            Purchase History Log ({expenses.length})
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Sorted by latest date & day
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading expense history...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">No expenses found.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {hasActiveFilters ? 'Try changing the date filter range.' : 'Add your first expense using the "+ Add Expense" button!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold border-b border-slate-200/70 dark:border-slate-800">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Date & Day</th>
                  <th className="px-5 sm:px-6 py-3.5">Paid By</th>
                  <th className="px-5 sm:px-6 py-3.5">Item Description</th>
                  <th className="px-5 sm:px-6 py-3.5">Category</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Amount (₹)</th>
                  <th className="px-5 sm:px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((expense) => {
                  const badge = FRIEND_BADGES[expense.person_name] || {
                    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
                    text: 'text-slate-700 dark:text-slate-300',
                    dot: 'bg-slate-400'
                  };

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Date & Day */}
                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatDatePretty(expense.expense_date)}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 inline-flex items-center px-2 py-0.5 rounded-md mt-0.5 border border-emerald-200/50 dark:border-emerald-800/40">
                          {expense.day_of_week}
                        </div>
                      </td>

                      {/* Paid By */}
                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          {expense.person_name}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-5 sm:px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs sm:max-w-md truncate">
                          {expense.description}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          Logged: {new Date(expense.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                          {expense.category || 'General'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setDeleteId(expense.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Are you sure you want to delete this expense?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This record will be permanently deleted from the PostgreSQL database.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                {isDeleting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
