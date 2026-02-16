import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { getMysqlPool } from "../config/database";
import { signToken, signMagicToken, verifyMagicToken } from "../utils/jwt";
import { sendMagicLinkEmail } from "../services/email";
import { env } from "../config/env";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ── Register with email + password ──
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ error: "email, name, and password are required" });
      return;
    }

    const db = getMysqlPool();
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if ((existing as any[]).length) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const id = uuid();
    const hash = await bcrypt.hash(password, 12);
    await db.execute(
      "INSERT INTO users (id, email, name, password, provider) VALUES (?, ?, ?, ?, 'local')",
      [id, email, name, hash]
    );

    const token = signToken({ userId: id, email });
    res.status(201).json({ token, user: { id, email, name } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

// ── Login with email + password ──
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getMysqlPool();

    const [rows] = await db.execute(
      "SELECT id, email, name, password, avatar_url FROM users WHERE email = ?",
      [email]
    );
    const users = rows as any[];
    if (!users.length) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = users[0];
    if (!user.password) {
      res.status(401).json({ error: "Use Google or magic link to sign in" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

// ── Google OAuth ──
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: "Invalid Google token" });
      return;
    }

    const db = getMysqlPool();
    const [rows] = await db.execute(
      "SELECT id, email, name, avatar_url FROM users WHERE email = ?",
      [payload.email]
    );
    const users = rows as any[];

    let user: any;
    if (users.length) {
      user = users[0];
    } else {
      const id = uuid();
      await db.execute(
        "INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, ?, 'google')",
        [id, payload.email, payload.name || "User", payload.picture || null]
      );
      user = { id, email: payload.email, name: payload.name, avatarUrl: payload.picture };
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url || user.avatarUrl },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
}

// ── Send magic link ──
export async function sendMagicLink(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const token = signMagicToken(email);
    await sendMagicLinkEmail(email, token);
    res.json({ message: "Magic link sent" });
  } catch (err) {
    console.error("Magic link error:", err);
    res.status(500).json({ error: "Failed to send magic link" });
  }
}

// ── Verify magic link ──
export async function verifyMagicLink(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.query;
    const result = verifyMagicToken(token as string);
    if (!result) {
      res.status(400).json({ error: "Invalid or expired magic link" });
      return;
    }

    const db = getMysqlPool();
    const [rows] = await db.execute(
      "SELECT id, email, name, avatar_url FROM users WHERE email = ?",
      [result.email]
    );
    const users = rows as any[];

    let user: any;
    if (users.length) {
      user = users[0];
    } else {
      const id = uuid();
      await db.execute(
        "INSERT INTO users (id, email, name, provider) VALUES (?, ?, ?, 'local')",
        [id, result.email, result.email.split("@")[0]]
      );
      user = { id, email: result.email, name: result.email.split("@")[0] };
    }

    const authToken = signToken({ userId: user.id, email: user.email });
    res.json({
      token: authToken,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url },
    });
  } catch (err) {
    console.error("Verify magic link error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}

// ── Get current user ──
export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: req.user });
}
