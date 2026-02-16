import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthPayload } from "../middleware/auth";

export function signToken(payload: AuthPayload, expiresIn = "7d"): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function signMagicToken(email: string): string {
  return jwt.sign({ email, purpose: "magic-link" }, env.MAGIC_LINK_SECRET, {
    expiresIn: "15m",
  });
}

export function verifyMagicToken(token: string): { email: string } | null {
  try {
    const payload = jwt.verify(token, env.MAGIC_LINK_SECRET) as any;
    if (payload.purpose !== "magic-link") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
