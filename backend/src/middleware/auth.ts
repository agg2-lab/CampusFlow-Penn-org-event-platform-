import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { getMysqlPool } from "../config/database";

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload & { name: string; avatarUrl?: string };
    }
  }
}

/**
 * Verify JWT from Authorization header or cookie.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const db = getMysqlPool();
    const [rows] = await db.execute(
      "SELECT id, email, name, avatar_url FROM users WHERE id = ?",
      [payload.userId]
    );

    const users = rows as any[];
    if (!users.length) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = {
      userId: users[0].id,
      email: users[0].email,
      name: users[0].name,
      avatarUrl: users[0].avatar_url,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Require specific org-level role(s).
 */
export function requireRole(...roles: Array<"admin" | "officer" | "member">) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params.orgId || req.body?.orgId;
      if (!orgId || !req.user) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const db = getMysqlPool();
      const [rows] = await db.execute(
        "SELECT role FROM memberships WHERE user_id = ? AND org_id = ?",
        [req.user.userId, orgId]
      );

      const memberships = rows as any[];
      if (!memberships.length || !roles.includes(memberships[0].role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}
