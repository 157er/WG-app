import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
}

export function ReceiptUploader({ onUpload }: ReceiptUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Bitte lade nur PNG, JPG oder PDF hoch.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Die Datei ist zu groß (max. 10 MB).");
      return;
    }
    setError(null);
    onUpload(file);
  }

  return (
    <div className="rounded-md border border-dashed border-slate-300 p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
        accept={ACCEPTED_TYPES.join(",")}
      />
      <p className="text-sm text-slate-600">Zieh deinen Beleg hierher oder</p>
      <button
        type="button"
        className="mt-2 text-sm font-medium text-indigo-600"
        onClick={() => inputRef.current?.click()}
      >
        Datei auswählen
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
