import { describe, expect, it } from "vitest";
import { SettlementService } from "../src/services/settlement-service";

describe("SettlementService", () => {
  it("splitEqual_3Members_rounding_ok", () => {
    const balances = SettlementService.netBalances([
      { userId: "A", totalPaid: 90, totalOwed: 30 },
      { userId: "B", totalPaid: 0, totalOwed: 30 },
      { userId: "C", totalPaid: 0, totalOwed: 30 },
    ]);

    expect(balances).toEqual([
      { userId: "A", net: 60 },
      { userId: "B", net: -30 },
      { userId: "C", net: -30 },
    ]);

    const suggestions = SettlementService.suggestTransfers(balances);
    expect(suggestions).toEqual([
      { fromUserId: "B", toUserId: "A", amount: 30 },
      { fromUserId: "C", toUserId: "A", amount: 30 },
    ]);
  });

  it("settlementGreedy_minTransactions_smallSets", () => {
    const suggestions = SettlementService.suggestTransfers([
      { userId: "A", net: -50 },
      { userId: "B", net: -25 },
      { userId: "C", net: 75 },
    ]);

    expect(suggestions).toEqual([
      { fromUserId: "A", toUserId: "C", amount: 50 },
      { fromUserId: "B", toUserId: "C", amount: 25 },
    ]);
  });
});
