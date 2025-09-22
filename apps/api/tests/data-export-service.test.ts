import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { DataExportService } from "../src/services/data-export-service";

describe("DataExportService", () => {
  it("export_zip_contains_all_entities", async () => {
    const service = new DataExportService();
    const archive = await service.buildArchive({
      users: [{ id: "u1" }],
      groups: [{ id: "g1" }],
      expenses: [{ id: "e1" }],
      settlements: [{ id: "s1" }],
    });

    const zip = await JSZip.loadAsync(archive);
    const files = Object.keys(zip.files).sort();
    expect(files).toEqual([
      "expenses.json",
      "groups.json",
      "settlements.json",
      "users.json",
    ]);
  });
});
