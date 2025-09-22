import { create } from "zustand";

type QueuedExpense = {
  id: string;
  payload: Record<string, unknown>;
  createdAt: number;
  groupId: string;
};

interface OfflineQueueState {
  pendingExpenses: QueuedExpense[];
  enqueueExpense: (groupId: string, payload: Record<string, unknown>) => void;
  flush: () => QueuedExpense[];
}

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  pendingExpenses: [],
  enqueueExpense: (groupId, payload) =>
    set((state) => ({
      pendingExpenses: [
        ...state.pendingExpenses,
        { id: crypto.randomUUID(), payload, createdAt: Date.now(), groupId } as QueuedExpense,
      ],
    })),
  flush: () => {
    const { pendingExpenses } = get();
    set({ pendingExpenses: [] });
    return pendingExpenses;
  },
}));
