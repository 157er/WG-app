import { PropsWithChildren, useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useSessionStore } from "../store/session";
import { Button } from "@wg-split/ui";
import { useOfflineQueue } from "../store/offlineQueue";
import { createExpense } from "../lib/api";

const navItems = [
  { path: "overview", label: "Overview" },
  { path: "expenses", label: "Expenses" },
  { path: "settle", label: "Settle" },
  { path: "reports", label: "Reports" },
  { path: "settings", label: "Settings" },
];

export function AppLayout({ children }: PropsWithChildren) {
  const { groupId } = useParams();
  const memberships = useSessionStore((state) => state.user?.memberships ?? []);
  const logout = useSessionStore((state) => state.clear);
  const currentGroup = memberships.find((membership) => membership.groupId === groupId);
  const flush = useOfflineQueue((state) => state.flush);
  const [isOffline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    async function syncQueuedExpenses() {
      const queued = flush();
      await Promise.all(
        queued.map((item) => createExpense(item.groupId, item.payload))
      );
    }

    if (navigator.onLine) {
      void syncQueuedExpenses();
    }

    const handleOnline = () => {
      setOffline(false);
      void syncQueuedExpenses();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flush]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
        <div className="mb-8">
          <h1 className="text-xl font-semibold">WG-Split</h1>
          <p className="text-sm text-slate-500">{currentGroup?.groupName ?? ""}</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/groups/${groupId ?? memberships[0]?.groupId}/${item.path}`}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" onClick={logout} className="mt-auto">
          Logout
        </Button>
      </aside>
      <main className="flex-1">
        <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <h1 className="text-lg font-semibold">WG-Split</h1>
        </div>
        {isOffline && (
          <div className="bg-amber-100 px-4 py-2 text-sm text-amber-800">
            Du bist offline. Neue Ausgaben werden automatisch synchronisiert, sobald du wieder
            online bist.
          </div>
        )}
        <div className="p-4 lg:p-8">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}

export default AppLayout;
