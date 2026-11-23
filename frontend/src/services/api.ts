import { Expense, ExpenseListResponse, StatsResponse, FilterState } from '../types';

const API_BASE = '/api';

export async function fetchExpenses(filters: FilterState): Promise<ExpenseListResponse> {
  const params = new URLSearchParams();
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.person) params.append('person', filters.person);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE}/expenses?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch expenses');
  }
  return res.json();
}

export async function fetchStats(from?: string, to?: string): Promise<StatsResponse> {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/stats${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return res.json();
}

export async function addExpense(payload: {
  person_name: string;
  description: string;
  amount: number;
  expense_date?: string;
  category?: string;
}): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add expense');
  }
  return data.expense;
}

export async function updateExpense(
  id: number,
  payload: {
    person_name?: string;
    description?: string;
    amount?: number;
    expense_date?: string;
    category?: string;
  }
): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update expense');
  }
  return data.expense;
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete expense');
  }
}
