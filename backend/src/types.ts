export const ALLOWED_FRIENDS = [
  'Vikash Meena',
  'Devendra Singh',
  'Kamlesh Meena'
] as const;

export type FriendName = typeof ALLOWED_FRIENDS[number];

export interface Expense {
  id: number;
  person_name: FriendName;
  description: string;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  day_of_week: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementDetail {
  person: FriendName;
  paid: number;
  share: number;
  netBalance: number; // positive = receives, negative = owes
}

export interface SettlementTransfer {
  from: FriendName;
  to: FriendName;
  amount: number;
}

export interface StatsResponse {
  totalAmount: number;
  totalCount: number;
  perPersonShare: number;
  breakdown: Record<FriendName, { total: number; count: number; percentage: number }>;
  settlement: {
    details: SettlementDetail[];
    transfers: SettlementTransfer[];
  };
  byDayOfWeek: { day: string; amount: number }[];
  byMonth: { month: string; amount: number }[];
  recentExpenses: Expense[];
}
