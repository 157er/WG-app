import { describe, expect, it } from "vitest";
import { SplitService } from "../src/services/split-service";
import { SplitType } from "@prisma/client";

describe("SplitService", () => {
  const service = new SplitService(2);

  it("splitWeighted_sum_equals_amount", () => {
    const result = service.compute(SplitType.WEIGHTED, 100, [
      { userId: "A", weight: 1 },
      { userId: "B", weight: 3 },
    ]);

    expect(result.reduce((sum, entry) => sum + entry.amount, 0)).toBeCloseTo(100, 2);
    expect(result).toEqual([
      { userId: "A", amount: 25 },
      { userId: "B", amount: 75 },
    ]);
  });

  it("equalSplit handles rounding remainders", () => {
    const result = service.compute(SplitType.EQUAL, 10, [
      { userId: "A" },
      { userId: "B" },
      { userId: "C" },
    ]);

    expect(result).toEqual([
      { userId: "A", amount: 3.34 },
      { userId: "B", amount: 3.33 },
      { userId: "C", amount: 3.33 },
    ]);
  });
});
