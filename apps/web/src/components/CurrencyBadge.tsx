interface CurrencyBadgeProps {
  currency: string;
}

export function CurrencyBadge({ currency }: CurrencyBadgeProps) {
  return (
    <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
      {currency}
    </span>
  );
}
