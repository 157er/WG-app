import axios from "axios";
import { useSessionStore } from "../store/session";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MagicLinkRequest {
  email: string;
}

export async function requestMagicLink(payload: MagicLinkRequest) {
  const response = await api.post("/auth/magic-link/request", payload);
  return response.data as { token?: string; expiresAt: string };
}

export async function consumeMagicLink(token: string) {
  const response = await api.post("/auth/magic-link/consume", { token });
  return response.data as { jwt: string };
}

export async function fetchCurrentUser() {
  const response = await api.get("/me");
  return response.data;
}

export async function fetchGroupBalances(groupId: string) {
  const response = await api.get(`/groups/${groupId}/balances`);
  return response.data as Array<{ userId: string; totalPaid: number; totalOwed: number; net: number }>;
}

export async function fetchGroupDetail(groupId: string) {
  const response = await api.get(`/groups/${groupId}`);
  return response.data as {
    id: string;
    currency: string;
    name: string;
    members: Array<{ userId: string; role: string; user: { name?: string } }>;
  };
}

export async function fetchRecentExpenses(groupId: string) {
  const response = await api.get(`/groups/${groupId}/expenses`, { params: { limit: 5 } });
  return response.data as Array<{
    id: string;
    category: string;
    amount: number;
    date: string;
    payerId: string;
  }>;
}

export async function fetchSettlementSuggestions(groupId: string) {
  const response = await api.post(`/groups/${groupId}/settlements/suggest`);
  return response.data as Array<{ fromUserId: string; toUserId: string; amount: number }>;
}

export async function createExpense(groupId: string, payload: Record<string, unknown>) {
  const response = await api.post(`/groups/${groupId}/expenses`, payload);
  return response.data;
}

export async function confirmSettlement(groupId: string, settlementId: string) {
  const response = await api.post(`/groups/${groupId}/settlements/${settlementId}/confirm`);
  return response.data;
}

export async function createSettlementRecord(groupId: string, payload: { fromUserId: string; toUserId: string; amount: number }) {
  const response = await api.post(`/groups/${groupId}/settlements`, payload);
  return response.data as { id: string };
}

export async function downloadPeriodPdf(groupId: string, params: { from: string; to: string }) {
  const response = await api.post(`/groups/${groupId}/reports/period/pdf`, null, {
    params,
    responseType: "blob",
  });
  return response.data as Blob;
}
