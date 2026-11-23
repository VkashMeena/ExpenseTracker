import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { StatsResponse, FriendName } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsChartsProps {
  stats: StatsResponse | null;
  isFiltered?: boolean;
}

const FRIEND_COLORS: Record<FriendName, string> = {
  'Vikash Meena': '#10b981', // Emerald
  'Devendra Singh': '#3b82f6', // Blue
  'Kamlesh Meena': '#8b5cf6', // Violet
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, isFiltered }) => {
  const { isDark } = useTheme();

  if (!stats) return null;

  // Prepare Friend Payment data for Bar Chart
  const friendBarData = Object.entries(stats.breakdown).map(([name, data]) => ({
    name,
    amount: data.total,
    count: data.count,
    color: FRIEND_COLORS[name as FriendName] || '#64748b'
  }));

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisTickColor = isDark ? '#94a3b8' : '#475569';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Total Payment by Friend (Bar Chart)</span>
            {isFiltered && (
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
                Filtered Range
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Payment comparison for Vikash Meena, Devendra Singh, and Kamlesh Meena
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          {friendBarData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={friendBarData}
            margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisTickColor, fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.6)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                      <p className="font-bold text-sm text-white">{data.name}</p>
                      <p className="text-emerald-400 font-bold text-base">
                        Total Paid: {formatCurrency(data.amount)}
                      </p>
                      <p className="text-slate-300">Purchases: {data.count}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={90}>
              {friendBarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
