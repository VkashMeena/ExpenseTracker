import React from 'react';
import { StatsResponse, FriendName } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { Wallet } from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsResponse | null;
  isFiltered?: boolean;
}

const FRIEND_THEMES: Record<
  FriendName,
  { text: string; border: string; badge: string }
> = {
  'Vikash Meena': {
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/90 dark:border-emerald-800/50',
    badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
  },
  'Devendra Singh': {
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200/90 dark:border-blue-800/50',
    badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
  },
  'Kamlesh Meena': {
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200/90 dark:border-purple-800/50',
    badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
  }
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isFiltered }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Payment Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-700 dark:via-emerald-800 dark:to-teal-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-emerald-700/15 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200">
            {isFiltered ? 'Filtered Payment' : 'Total Payment'}
          </span>
          <div className="p-1.5 sm:p-2 bg-white/10 rounded-xl">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3">
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            {formatCurrency(stats.totalAmount)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-emerald-100 font-medium">
            <span>{stats.totalCount} {stats.totalCount === 1 ? 'purchase' : 'purchases'}</span>
            {isFiltered && <span className="bg-emerald-900/80 px-1.5 py-0.5 rounded text-[10px] font-semibold">in range</span>}
          </div>
        </div>
      </div>

      {/* 3 Friends Individual Cards */}
      {(['Vikash Meena', 'Devendra Singh', 'Kamlesh Meena'] as FriendName[]).map((name) => {
        const data = stats.breakdown[name] || { total: 0, count: 0 };
        const theme = FRIEND_THEMES[name];

        return (
          <div
            key={name}
            className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border ${theme.border} shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-md ${theme.badge}`}>
                {name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {data.count} {data.count === 1 ? 'purchase' : 'purchases'}
              </span>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.text}`}>
                {formatCurrency(data.total)}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Total Paid
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
