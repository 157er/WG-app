import { GroupRole } from "@prisma/client";

export function assertAdminOrOwner(role: GroupRole): void {
  if (!(role === GroupRole.ADMIN || role === GroupRole.OWNER)) {
    throw new Error("Forbidden");
  }
}
