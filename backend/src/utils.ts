import { ALLOWED_FRIENDS, FriendName, SettlementDetail, SettlementTransfer } from './types.js';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Returns day of week for a given date string (YYYY-MM-DD) or Date object
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  // Parse date safely handling timezones by using UTC parts or splitting YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return DAYS_OF_WEEK[d.getDay()];
  }
  const d = new Date(dateStr);
  return DAYS_OF_WEEK[d.getDay()] || 'Unknown';
}

/**
 * Calculates fair 3-way split settlement
 */
export function calculateSettlement(
  totals: Record<FriendName, number>,
  overallTotal: number
): { details: SettlementDetail[]; transfers: SettlementTransfer[] } {
  const share = Number((overallTotal / ALLOWED_FRIENDS.length).toFixed(2));

  const details: SettlementDetail[] = ALLOWED_FRIENDS.map((person) => {
    const paid = totals[person] || 0;
    const netBalance = Number((paid - share).toFixed(2));
    return {
      person,
      paid,
      share,
      netBalance
    };
  });

  // Debt simplification: who pays whom
  // Debtors: netBalance < 0 (they owe money)
  // Creditors: netBalance > 0 (they are owed money)
  const debtors = details
    .filter((d) => d.netBalance < -0.01)
    .map((d) => ({ person: d.person, amount: Math.abs(d.netBalance) }));

  const creditors = details
    .filter((d) => d.netBalance > 0.01)
    .map((d) => ({ person: d.person, amount: d.netBalance }));

  const transfers: SettlementTransfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);
    if (transferAmount > 0.01) {
      transfers.push({
        from: debtor.person,
        to: creditor.person,
        amount: Number(transferAmount.toFixed(2))
      });
    }

    debtor.amount = Number((debtor.amount - transferAmount).toFixed(2));
    creditor.amount = Number((creditor.amount - transferAmount).toFixed(2));

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return { details, transfers };
}
