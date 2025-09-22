import crypto from "crypto";

type TokenRecord = {
  email: string;
  expiresAt: Date;
  used: boolean;
};

/**
 * In-memory magic link token service suitable for tests. Production uses Redis/DB.
 */
export class MagicLinkService {
  constructor(private readonly ttlMinutes: number, private readonly store = new Map<string, TokenRecord>()) {}

  issueToken(email: string): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + this.ttlMinutes * 60 * 1000);
    this.store.set(token, { email, expiresAt, used: false });
    return { token, expiresAt };
  }

  consumeToken(token: string): string {
    const record = this.store.get(token);
    if (!record) {
      throw new Error("Token not found");
    }
    if (record.used) {
      throw new Error("Token already used");
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new Error("Token expired");
    }

    record.used = true;
    this.store.set(token, record);
    return record.email;
  }
}
