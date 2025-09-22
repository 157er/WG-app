import { useMemo } from "react";
import { AmountInput } from "./AmountInput";

type SplitType = "EQUAL" | "WEIGHTED" | "SHARES" | "FIXED" | "PERCENT";

type Participant = {
  id: string;
  name?: string | null;
};

interface SplitEditorProps {
  amount: number;
  currency: string;
  participants: Participant[];
  splitType: SplitType;
  values: Record<string, number>;
  onSplitTypeChange: (type: SplitType) => void;
  onValuesChange: (values: Record<string, number>) => void;
}

const splitTabs: Array<{ value: SplitType; label: string; description: string }> = [
  { value: "EQUAL", label: "Gleich", description: "Teilt den Betrag fair auf alle" },
  { value: "WEIGHTED", label: "Gewichtet", description: "Gewichte bestimmen die Anteile" },
  { value: "SHARES", label: "Anteile", description: "Anteile summieren sich zum Gesamtbetrag" },
  { value: "FIXED", label: "Fix", description: "Feste Beträge, Rest wird verteilt" },
  { value: "PERCENT", label: "%", description: "Prozentwerte müssen 100 ergeben" },
];

export function SplitEditor({
  amount,
  currency,
  participants,
  splitType,
  values,
  onSplitTypeChange,
  onValuesChange,
}: SplitEditorProps) {
  const perPerson = useMemo(() => amount / Math.max(participants.length, 1), [amount, participants.length]);

  function updateValue(id: string, value: number) {
    const safeValue = Number.isFinite(value) ? value : 0;
    onValuesChange({ ...values, [id]: safeValue });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {splitTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSplitTypeChange(tab.value)}
            className={`rounded-full border px-3 py-1 text-sm ${
              splitType === tab.value
                ? "border-indigo-500 bg-indigo-100 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
            aria-pressed={splitType === tab.value}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        {splitTabs.find((tab) => tab.value === splitType)?.description}
      </p>
      <div className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{participant.name ?? "Mitglied"}</p>
              <p className="text-xs text-slate-500">{participant.id}</p>
            </div>
            {splitType === "EQUAL" ? (
              <span className="text-sm text-slate-600">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency,
                }).format(perPerson)}
              </span>
            ) : (
              <AmountInput
                currency={splitType === "PERCENT" ? "%" : currency}
                value={values[participant.id] ?? ""}
                onChange={(event) => updateValue(participant.id, Number(event.target.value))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
