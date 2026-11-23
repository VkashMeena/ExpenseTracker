import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, User, DollarSign, Sparkles } from 'lucide-react';
import { FRIENDS, FriendName } from '../types';
import { getTodayDateString, getDayOfWeek } from '../utils/dateUtils';
import { addExpense } from '../services/api';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const QUICK_ITEMS = [
  'Milk & Dairy',
  'Vegetables',
  'Room Rent',
  'Electricity Bill',
  'Water Camper',
  'Gas Cylinder',
  'Kitchen Ration',
  'Cooking Oil & Spices',
  'Snacks & Tea',
  'Cleaning Supplies'
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded
}) => {
  const [personName, setPersonName] = useState<FriendName>(FRIENDS[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());
  const [category, setCategory] = useState('Groceries');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const dayInfo = getDayOfWeek(expenseDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Please enter an item description.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount (> 0).');
      return;
    }

    try {
      setIsSubmitting(true);
      await addExpense({
        person_name: personName,
        description: description.trim(),
        amount: numAmount,
        expense_date: expenseDate,
        category
      });

      // Reset form
      setDescription('');
      setAmount('');
      setExpenseDate(getTodayDateString());
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">Add New Expense</h2>
              <p className="text-xs text-emerald-100">Maintenance split for Vikash, Devendra & Kamlesh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* 1. Paid By Dropdown (ONLY 3 friends) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Paid By (Select Friend)
            </label>
            <select
              value={personName}
              onChange={(e) => setPersonName(e.target.value as FriendName)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              required
            >
              {FRIENDS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Item Description & Quick Suggestions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Item Description
            </label>
            <input
              type="text"
              placeholder="e.g. Milk & Dairy, Vegetables, Electricity Bill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              required
            />
            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_ITEMS.slice(0, 5).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setDescription(item)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 dark:text-slate-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                <option value="Groceries">Vegetables & Ration</option>
                <option value="Dairy">Milk & Dairy</option>
                <option value="Room & Utilities">Room Rent & Bills</option>
                <option value="Cooking & Gas">Gas & Cooking</option>
                <option value="Snacks & Food">Snacks & Fast Food</option>
                <option value="Other">General / Other</option>
              </select>
            </div>
          </div>

          {/* 4. Date & Automatic Day */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Expense Date
              </label>
              <button
                type="button"
                onClick={() => setExpenseDate(getTodayDateString())}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
              >
                Today
              </button>
            </div>
            
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 shadow-sm"
              required
            />

            {/* Day indicator - automatic */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Automatic Day of Week:
              </span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md text-xs border border-emerald-300/30">
                {dayInfo.english}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Submit Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
