import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card } from "@wg-split/ui";
import { fetchGroupBalances, fetchRecentExpenses } from "../../lib/api";
import { Spinner } from "../../components/Spinner";
import { CurrencyBadge } from "../../components/CurrencyBadge";
import { useSessionStore } from "../../store/session";

export default function OverviewPage() {
  const { groupId = "" } = useParams();
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => fetchGroupBalances(groupId),
  });
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["recentExpenses", groupId],
    queryFn: () => fetchRecentExpenses(groupId),
  });
  const currency = useSessionStore(
    (state) => state.user?.memberships.find((membership) => membership.groupId === groupId)?.currency ?? "EUR"
  );

  if (balancesLoading || expensesLoading) {
    return <Spinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {balances?.map((balance) => (
          <Card key={balance.userId} title={balance.userId} description="Saldo">
            <p className={`text-2xl font-semibold ${balance.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(balance.net)}
            </p>
            <p className="text-xs text-slate-500">Bezahlt: {balance.totalPaid.toFixed(2)} · Anteil: {balance.totalOwed.toFixed(2)}</p>
          </Card>
        ))}
      </div>
      <Card title="Letzte Ausgaben" description="Die fünf neusten Bewegungen">
        {expenses && expenses.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <li key={expense.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{expense.category}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(expense.date).toLocaleDateString()} · {expense.payerId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyBadge currency={currency} />
                  <span className="font-semibold text-slate-700">
                    {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(expense.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Keine Ausgaben vorhanden. Leg deine erste Ausgabe an!</p>
        )}
      </Card>
    </div>
  );
}
