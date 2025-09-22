import { describe, expect, it } from "vitest";
import { validateReceiptUpload } from "../src/utils/uploads";

describe("Receipt upload validation", () => {
  it("receipts_upload_validation_rejects_exe", () => {
    expect(() =>
      validateReceiptUpload({ filename: "malware.exe", mime: "application/pdf", size: 1024 })
    ).toThrow(/Executable/);
  });

  it("rejects_oversized_files", () => {
    expect(() =>
      validateReceiptUpload({ filename: "file.pdf", mime: "application/pdf", size: 20 * 1024 * 1024 })
    ).toThrow(/File too large/);
  });

  it("accepts_valid_pdf", () => {
    expect(() =>
      validateReceiptUpload({ filename: "receipt.pdf", mime: "application/pdf", size: 1024 })
    ).not.toThrow();
  });
});
