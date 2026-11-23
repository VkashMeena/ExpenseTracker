import React, { useState } from 'react';
import { Settlement, FriendName } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Scale
} from 'lucide-react';

interface SettlementViewProps {
  settlement: Settlement | null;
  totalAmount: number;
  perPersonShare: number;
}

const FRIEND_COLORS: Record<FriendName, { bg: string; text: string; badge: string }> = {
  'Vikash Meena': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' },
  'Devendra Singh': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' },
  'Kamlesh Meena': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300' }
};

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlement,
  totalAmount,
  perPersonShare
}) => {
  const [copied, setCopied] = useState(false);

  if (!settlement) return null;

  const { details, transfers } = settlement;

  // Copy settlement summary for WhatsApp group in English
  const handleCopyWhatsApp = () => {
    let text = `🏠 *Room Maintenance & Expense Settlement*\n`;
    text += `💰 Total Expenses: ${formatCurrency(totalAmount)}\n`;
    text += `⚖️ Fair Share per Person (1/3rd): ${formatCurrency(perPersonShare)}\n\n`;
    text += `*Individual Balances:*\n`;
    details.forEach((d) => {
      const status =
        d.netBalance > 0
          ? `+${formatCurrency(d.netBalance)} (Receives)`
          : d.netBalance < 0
          ? `${formatCurrency(d.netBalance)} (Owes)`
          : `₹0 (Settled)`;
      text += `• ${d.person}: Paid ${formatCurrency(d.paid)} ➔ ${status}\n`;
    });

    if (transfers.length > 0) {
      text += `\n*Final Payment Transfers:*\n`;
      transfers.forEach((t) => {
        text += `👉 ${t.from} pays ${formatCurrency(t.amount)} to ${t.to}\n`;
      });
    } else {
      text += `\n✅ All balances are fully settled!\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/70 rounded-xl text-emerald-700 dark:text-emerald-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Settlement & Split Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Equal 1/3rd share calculation and direct payment settlement between friends
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyWhatsApp}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary for WhatsApp'}</span>
        </button>
      </div>

      {/* 3 Friends Individual Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {details.map((item) => {
          const isCreditor = item.netBalance > 0.01;
          const isDebtor = item.netBalance < -0.01;
          const colors = FRIEND_COLORS[item.person];

          return (
            <div
              key={item.person}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${colors.badge}`}>
                  {item.person}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isCreditor
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : isDebtor
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCreditor ? 'Receives (+)' : isDebtor ? 'Owes (-)' : 'Settled'}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Amount Paid:</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(item.paid)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Equal Share (1/3rd):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(item.share)}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Net Balance:</span>
                  <span
                    className={
                      isCreditor
                        ? 'text-emerald-600 dark:text-emerald-400 text-sm'
                        : isDebtor
                        ? 'text-rose-600 dark:text-rose-400 text-sm'
                        : 'text-slate-600 dark:text-slate-400 text-sm'
                    }
                  >
                    {isCreditor && '+'}
                    {formatCurrency(item.netBalance)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Settlements / Money Transfers */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Settlement Transfers (Who Pays Whom)</span>
        </h4>

        {transfers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              All accounts are fully settled!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              No outstanding transfers or payments needed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transfers.map((t, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md text-xs border border-rose-200 dark:border-rose-900">
                    {t.from}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md text-xs border border-emerald-200 dark:border-emerald-900">
                    {t.to}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-900 dark:text-emerald-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                  {formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
