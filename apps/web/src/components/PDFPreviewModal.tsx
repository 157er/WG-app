import { useEffect } from "react";

interface PDFPreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export function PDFPreviewModal({ url, onClose }: PDFPreviewModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="relative h-full w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <button
          type="button"
          aria-label="Schließen"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
        >
          ×
        </button>
        <iframe title="PDF Vorschau" src={url} className="h-full w-full rounded-b-lg" />
      </div>
    </div>
  );
}
