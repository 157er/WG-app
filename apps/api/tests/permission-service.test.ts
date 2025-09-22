import { describe, expect, it } from "vitest";
import { assertAdminOrOwner } from "../src/services/permission-service";
import { GroupRole } from "@prisma/client";

describe("PermissionService", () => {
  it("permissions_admin_only_endpoints_403", () => {
    expect(() => assertAdminOrOwner(GroupRole.MEMBER)).toThrow(/Forbidden/);
    expect(() => assertAdminOrOwner(GroupRole.ADMIN)).not.toThrow();
    expect(() => assertAdminOrOwner(GroupRole.OWNER)).not.toThrow();
  });
});
