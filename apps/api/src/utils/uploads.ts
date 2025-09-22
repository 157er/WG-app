const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "application/pdf"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface ReceiptMetadata {
  filename: string;
  mime: string;
  size: number;
}

export function validateReceiptUpload(metadata: ReceiptMetadata): void {
  if (!ALLOWED_MIME.has(metadata.mime)) {
    throw new Error("Unsupported file type");
  }

  if (metadata.size > MAX_SIZE_BYTES) {
    throw new Error("File too large");
  }

  if (metadata.filename.toLowerCase().endsWith(".exe")) {
    throw new Error("Executable files are not allowed");
  }
}
