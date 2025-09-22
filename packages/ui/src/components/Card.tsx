import { PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren {
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Lightweight card with sensible defaults for accessibility and spacing.
 */
export function Card({ children, className, title, description }: CardProps) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className
      )}
      aria-label={title}
    >
      {(title || description) && (
        <header className="mb-3">
          {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>}
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
          )}
        </header>
      )}
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}
