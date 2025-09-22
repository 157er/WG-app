import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { downloadPeriodPdf, fetchGroupBalances, fetchRecentExpenses } from "../../lib/api";
import { Button, Card } from "@wg-split/ui";
import { PDFPreviewModal } from "../../components/PDFPreviewModal";
import { useSessionStore } from "../../store/session";

export default function ReportsPage() {
  const { groupId = "" } = useParams();
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [to, setTo] = useState(() => new Date());
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const currency = useSessionStore(
    (state) => state.user?.memberships.find((membership) => membership.groupId === groupId)?.currency ?? "EUR"
  );

  const { data: balances } = useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => fetchGroupBalances(groupId),
  });
  const { data: expenses } = useQuery({
    queryKey: ["expenses", groupId, from, to],
    queryFn: () => fetchRecentExpenses(groupId),
  });

  async function handleDownload() {
    const blob = await downloadPeriodPdf(groupId, {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  }

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="space-y-6">
      <Card title="Zeitraum" description="Wähle Start- und Enddatum">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Von</label>
            <input
              type="date"
              value={from.toISOString().slice(0, 10)}
              onChange={(event) => setFrom(new Date(event.target.value))}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bis</label>
            <input
              type="date"
              value={to.toISOString().slice(0, 10)}
              onChange={(event) => setTo(new Date(event.target.value))}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <Button type="button" onClick={handleDownload}>
            PDF erstellen
          </Button>
        </div>
      </Card>
      <Card title="Saldo je Mitglied" description="Wer steht wie viel im Plus oder Minus?">
        <ul className="divide-y divide-slate-200">
          {balances?.map((balance) => (
            <li key={balance.userId} className="flex items-center justify-between py-3 text-sm">
              <span>{balance.userId}</span>
              <span className={`font-semibold ${balance.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(balance.net)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Aktivität" description="Schneller Überblick über die letzten Buchungen">
        {expenses && expenses.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {expenses.map((expense) => (
              <li key={expense.id} className="flex items-center justify-between">
                <span>{expense.category}</span>
                <span>{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(expense.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Keine Ausgaben im Zeitraum.</p>
        )}
      </Card>
      <PDFPreviewModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
    </div>
  );
}
