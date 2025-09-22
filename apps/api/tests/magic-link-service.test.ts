import { describe, expect, it } from "vitest";
import { MagicLinkService } from "../src/services/magic-link-service";

describe("MagicLinkService", () => {
  it("auth_magiclink_single_use", () => {
    const service = new MagicLinkService(15);
    const { token } = service.issueToken("user@example.com");

    expect(service.consumeToken(token)).toBe("user@example.com");
    expect(() => service.consumeToken(token)).toThrow(/already used/);
  });
});
