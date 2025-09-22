import { describe, expect, it, vi } from "vitest";
import { useOfflineQueue } from "../store/offlineQueue";
import * as api from "../lib/api";

vi.spyOn(api, "createExpense").mockResolvedValue({});

describe("Offline queue", () => {
  it("pwa_offline_queue_and_sync", async () => {
    useOfflineQueue.getState().enqueueExpense("group-1", { amount: 10 });
    useOfflineQueue.getState().enqueueExpense("group-2", { amount: 20 });

    const pending = useOfflineQueue.getState().flush();
    expect(pending).toHaveLength(2);

    await Promise.all(pending.map((item) => api.createExpense(item.groupId, item.payload)));
    expect(api.createExpense).toHaveBeenCalledTimes(2);
  });
});
