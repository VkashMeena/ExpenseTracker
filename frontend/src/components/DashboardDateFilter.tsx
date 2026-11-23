import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { formatDatePretty } from '../utils/dateUtils';

interface DashboardDateFilterProps {
  from: string;
  to: string;
  onChangeRange: (from: string, to: string) => void;
  onReset: () => void;
  totalFilteredCount?: number;
}

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({
  from,
  to,
  onChangeRange,
  onReset,
  totalFilteredCount
}) => {
  const isFiltered = Boolean(from || to);

  const setPreset = (type: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (type === 'today') {
      const t = format(today);
      onChangeRange(t, t);
    } else if (type === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const str = format(y);
      onChangeRange(str, str);
    } else if (type === 'week') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 6);
      onChangeRange(format(past7), format(today));
    } else if (type === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onChangeRange(format(firstDay), format(today));
    } else if (type === 'all') {
      onReset();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5 transition-colors duration-200">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 rounded-xl text-emerald-700 dark:text-emerald-400">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Date Range Filter
              </h3>
              {isFiltered && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Active Filter
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isFiltered ? (
                <span>
                  Showing transactions from{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{from ? formatDatePretty(from) : 'Inception'}</strong> to{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{to ? formatDatePretty(to) : 'Present'}</strong>
                  {totalFilteredCount !== undefined && ` (${totalFilteredCount} ${totalFilteredCount === 1 ? 'record' : 'records'})`}
                </span>
              ) : (
                'Filter metrics and comparative charts by specific time periods'
              )}
            </p>
          </div>
        </div>

        {/* Clear Filter Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Date Pickers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Start Date
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => onChangeRange(e.target.value, to)}
            className="w-full pl-3.5 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 font-semibold transition shadow-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            End Date
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => onChangeRange(from, e.target.value)}
            className="w-full pl-3.5 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 font-semibold transition shadow-sm"
          />
        </div>
      </div>

      {/* Quick Select Presets */}
      <div className="pt-1 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:inline mr-1">
          Preset:
        </span>
        <button
          type="button"
          onClick={() => setPreset('today')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 active:scale-95"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setPreset('yesterday')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 active:scale-95"
        >
          Yesterday
        </button>
        <button
          type="button"
          onClick={() => setPreset('week')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 active:scale-95"
        >
          Last 7 Days
        </button>
        <button
          type="button"
          onClick={() => setPreset('month')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 active:scale-95"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => setPreset('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
            !isFiltered
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          All Time
        </button>
      </div>
    </div>
  );
};
