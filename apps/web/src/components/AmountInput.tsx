import { forwardRef } from "react";

interface AmountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  currency: string;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ currency, className, ...props }, ref) => {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
          {currency}
        </span>
        <input
          ref={ref}
          inputMode="decimal"
          className={`w-full rounded-md border border-slate-300 py-2 pl-12 pr-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className ?? ""}`}
          {...props}
        />
      </div>
    );
  }
);

AmountInput.displayName = "AmountInput";
