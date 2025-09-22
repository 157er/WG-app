import { GroupMember } from "@prisma/client";

export interface BalanceEntry {
  userId: string;
  net: number;
}

export interface SettlementSuggestion {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

const EPSILON = 0.01;

/**
 * Greedy settlement algorithm matching the largest debtors with the largest creditors.
 * Guarantees a minimal number of transactions for monotone nets.
 */
export class SettlementService {
  static suggestTransfers(balances: BalanceEntry[]): SettlementSuggestion[] {
    const debtors = balances
      .filter((balance) => balance.net < -EPSILON)
      .map((balance) => ({ ...balance, net: Math.abs(balance.net) }))
      .sort((a, b) => b.net - a.net);

    const creditors = balances
      .filter((balance) => balance.net > EPSILON)
      .map((balance) => ({ ...balance }))
      .sort((a, b) => b.net - a.net);

    const suggestions: SettlementSuggestion[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const transfer = Math.min(debtor.net, creditor.net);

      suggestions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: parseFloat(transfer.toFixed(2)),
      });

      debtor.net = parseFloat((debtor.net - transfer).toFixed(2));
      creditor.net = parseFloat((creditor.net - transfer).toFixed(2));

      if (debtor.net <= EPSILON) {
        debtorIndex += 1;
      }
      if (creditor.net <= EPSILON) {
        creditorIndex += 1;
      }
    }

    return suggestions;
  }

  /**
   * Transforms raw totals into net balances per user.
   */
  static netBalances(entries: { userId: string; totalPaid: number; totalOwed: number }[]): BalanceEntry[] {
    return entries.map((entry) => ({
      userId: entry.userId,
      net: parseFloat((entry.totalPaid - entry.totalOwed).toFixed(2)),
    }));
  }

  /**
   * Helper validating permissions for settlement creation.
   */
  static canInitiateSettlement(member: GroupMember): boolean {
    return member.role === "OWNER" || member.role === "ADMIN" || member.role === "MEMBER";
  }
}
