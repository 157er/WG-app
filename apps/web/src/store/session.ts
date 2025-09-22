import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Membership {
  groupId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  groupName: string;
  currency: string;
}

export interface SessionState {
  token: string | null;
  user: { id: string; email: string; memberships: Membership[] } | null;
  setSession: (payload: { token: string; user: SessionState["user"] }) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "wg-split-session",
    }
  )
);
