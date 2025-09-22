import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../lib/api";
import { useSessionStore } from "../store/session";

export function useAuth() {
  const token = useSessionStore((state) => state.token);
  const setSession = useSessionStore((state) => state.setSession);
  const clear = useSessionStore((state) => state.clear);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data && token) {
      const normalized = {
        id: query.data.id,
        email: query.data.email,
        memberships: (query.data.memberships ?? []).map((membership: any) => ({
          groupId: membership.groupId,
          role: membership.role,
          groupName: membership.group?.name ?? membership.groupId,
          currency: membership.group?.currency ?? "EUR",
        })),
      };
      setSession({ token, user: normalized });
    }
  }, [query.data, setSession, token]);

  useEffect(() => {
    if (query.error) {
      clear();
    }
  }, [query.error, clear]);

  return {
    token,
    user: useSessionStore((state) => state.user),
    isLoading: query.isLoading,
  };
}
