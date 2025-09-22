import JSZip from "jszip";

export interface ExportPayload {
  users: unknown[];
  groups: unknown[];
  expenses: unknown[];
  settlements: unknown[];
}

export class DataExportService {
  constructor(private readonly zip = new JSZip()) {}

  async buildArchive(payload: ExportPayload): Promise<Uint8Array> {
    this.zip.file("users.json", JSON.stringify(payload.users, null, 2));
    this.zip.file("groups.json", JSON.stringify(payload.groups, null, 2));
    this.zip.file("expenses.json", JSON.stringify(payload.expenses, null, 2));
    this.zip.file("settlements.json", JSON.stringify(payload.settlements, null, 2));

    return this.zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  }
}
