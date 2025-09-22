import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createExpense,
  fetchGroupDetail,
  fetchRecentExpenses,
} from "../../lib/api";
import { SplitEditor } from "../../components/SplitEditor";
import { AmountInput } from "../../components/AmountInput";
import { Button, Card } from "@wg-split/ui";
import { ReceiptUploader } from "../../components/ReceiptUploader";
import { useOfflineQueue } from "../../store/offlineQueue";

const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  date: z.string(),
  notes: z.string().max(200).optional(),
  splitType: z.enum(["EQUAL", "WEIGHTED", "SHARES", "FIXED", "PERCENT"]),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const { groupId = "" } = useParams();
  const queryClient = useQueryClient();
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  const [receipt, setReceipt] = useState<File | null>(null);

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroupDetail(groupId),
  });

  const { data: expenses } = useQuery({
    queryKey: ["recentExpenses", groupId],
    queryFn: () => fetchRecentExpenses(groupId),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: "",
      date: new Date().toISOString().slice(0, 10),
      splitType: "EQUAL",
    },
  });

  const splitType = watch("splitType");
  const amount = watch("amount");

  useEffect(() => {
    if (splitType === "EQUAL" && group) {
      const value = amount / Math.max(group.members.length, 1);
      const defaults = Object.fromEntries(
        group.members.map((member) => [member.userId, Number(value.toFixed(2))])
      );
      setSplitValues(defaults);
    }
  }, [amount, group, splitType]);

  const onSubmit = handleSubmit(async (data) => {
    if (!group) return;
    const payload = {
      ...data,
      participants: group.members.map((member) => ({
        userId: member.userId,
        share:
          splitValues[member.userId] ?? Number((amount / Math.max(group.members.length, 1)).toFixed(2)),
      })),
    };

    if (!navigator.onLine) {
      useOfflineQueue.getState().enqueueExpense(groupId, payload);
    } else {
      await createExpense(groupId, payload);
    }
    reset();
    setSplitValues({});
    queryClient.invalidateQueries({ queryKey: ["recentExpenses", groupId] });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
      <Card title="Neue Ausgabe" description="Erfasse Zahlungen in wenigen Sekunden">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Betrag</label>
            <AmountInput currency={group?.currency ?? "EUR"} step="0.01" {...register("amount", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kategorie</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              {...register("category")}
              placeholder="z. B. Einkauf"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Datum</label>
            <input type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register("date")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Split</label>
            {group && (
              <SplitEditor
                amount={amount}
                currency={group.currency ?? "EUR"}
                participants={group.members.map((member) => ({
                  id: member.userId,
                  name: member.user?.name ?? member.userId,
                }))}
                splitType={splitType}
                values={splitValues}
                onSplitTypeChange={(next) => {
                  setSplitValues({});
                  setValue("splitType", next, { shouldDirty: true, shouldTouch: true });
                }}
                onValuesChange={setSplitValues}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Beleg (optional)</label>
            <ReceiptUploader onUpload={setReceipt} />
            {receipt && <p className="mt-2 text-xs text-slate-500">Ausgewählt: {receipt.name}</p>}
          </div>
          <Button type="submit" loading={isSubmitting}>
            Speichern
          </Button>
        </form>
      </Card>
      <Card title="Letzte Ausgaben" description="Kontrolliere aktuelle Posten">
        {expenses && expenses.length > 0 ? (
          <ul className="space-y-3">
            {expenses.map((expense) => (
              <li key={expense.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-700">{expense.category}</p>
                <p className="text-xs text-slate-500">
                  {new Date(expense.date).toLocaleDateString()} · Zahler {expense.payerId}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {new Intl.NumberFormat(undefined, { style: "currency", currency: group?.currency ?? "EUR" }).format(
                    expense.amount
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Noch keine Ausgaben – leg deine erste Ausgabe an.</p>
        )}
      </Card>
    </div>
  );
}
