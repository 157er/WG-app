interface SettlementItemProps {
  from: string;
  to: string;
  amount: number;
  currency: string;
  status?: "OPEN" | "SENT" | "CONFIRMED" | "POSTED";
  onConfirm?: () => void;
}

export function SettlementItem({ from, to, amount, currency, status = "OPEN", onConfirm }: SettlementItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {from} → {to}
        </p>
        <p className="text-xs text-slate-500">Status: {status}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)}
        </span>
        {status === "OPEN" && (
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
            onClick={onConfirm}
          >
            Bestätigen
          </button>
        )}
      </div>
    </div>
  );
}
