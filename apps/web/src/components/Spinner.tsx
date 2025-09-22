interface SpinnerProps {
  fullScreen?: boolean;
}

export function Spinner({ fullScreen = false }: SpinnerProps) {
  const className = fullScreen
    ? "flex h-screen w-full items-center justify-center"
    : "flex items-center justify-center";

  return (
    <div className={className} role="status" aria-live="polite">
      <svg
        className="h-6 w-6 animate-spin text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}
