import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getMysqlPool } from "../config/database";
import { slugify } from "../utils/slug";

// ── List organizations ──
export async function listOrgs(req: Request, res: Response): Promise<void> {
  try {
    const { q, category, page = "1", limit = "12" } = req.query;
    const db = getMysqlPool();

    let sql = "SELECT * FROM organizations WHERE 1=1";
    const params: any[] = [];

    if (q) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    sql += " ORDER BY name ASC LIMIT ? OFFSET ?";
    params.push(parseInt(limit as string), offset);

    const [rows] = await db.execute(sql, params);

    // Count total
    let countSql = "SELECT COUNT(*) as total FROM organizations WHERE 1=1";
    const countParams: any[] = [];
    if (q) {
      countSql += " AND (name LIKE ? OR description LIKE ?)";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      countSql += " AND category = ?";
      countParams.push(category);
    }

    const [countRows] = await db.execute(countSql, countParams);
    const total = (countRows as any[])[0].total;

    res.json({
      organizations: rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    console.error("List orgs error:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
}

// ── Get single org with members ──
export async function getOrg(req: Request, res: Response): Promise<void> {
  try {
    const db = getMysqlPool();
    const [orgRows] = await db.execute(
      "SELECT * FROM organizations WHERE id = ?",
      [req.params.id]
    );
    const orgs = orgRows as any[];
    if (!orgs.length) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    const [memberRows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.avatar_url, m.role, m.joined_at
       FROM memberships m
       JOIN users u ON u.id = m.user_id
       WHERE m.org_id = ?
       ORDER BY m.role ASC, m.joined_at ASC`,
      [req.params.id]
    );

    res.json({ organization: orgs[0], members: memberRows });
  } catch (err) {
    console.error("Get org error:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}

// ── Create org ──
export async function createOrg(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, category, logoUrl } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const db = getMysqlPool();
    const id = uuid();
    const slug = slugify(name);

    await db.execute(
      "INSERT INTO organizations (id, name, slug, description, logo_url, category) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, slug, description || "", logoUrl || null, category || null]
    );

    // Creator becomes admin
    const membershipId = uuid();
    await db.execute(
      "INSERT INTO memberships (id, user_id, org_id, role) VALUES (?, ?, ?, 'admin')",
      [membershipId, req.user!.userId, id]
    );

    res.status(201).json({
      organization: { id, name, slug, description, logoUrl, category },
    });
  } catch (err) {
    console.error("Create org error:", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
}

// ── Update org ──
export async function updateOrg(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, category, logoUrl } = req.body;
    const db = getMysqlPool();

    await db.execute(
      "UPDATE organizations SET name = COALESCE(?, name), description = COALESCE(?, description), category = COALESCE(?, category), logo_url = COALESCE(?, logo_url) WHERE id = ?",
      [name, description, category, logoUrl, req.params.orgId]
    );

    res.json({ message: "Organization updated" });
  } catch (err) {
    console.error("Update org error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
}

// ── Add member ──
export async function addMember(req: Request, res: Response): Promise<void> {
  try {
    const { userId, role = "member" } = req.body;
    const orgId = req.params.orgId;
    const db = getMysqlPool();

    const id = uuid();
    await db.execute(
      "INSERT INTO memberships (id, user_id, org_id, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = ?",
      [id, userId, orgId, role, role]
    );

    res.json({ message: "Member added" });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
}

// ── Remove member ──
export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const db = getMysqlPool();
    await db.execute(
      "DELETE FROM memberships WHERE user_id = ? AND org_id = ?",
      [req.params.userId, req.params.orgId]
    );
    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
}

// ── Get user's orgs ──
export async function myOrgs(req: Request, res: Response): Promise<void> {
  try {
    const db = getMysqlPool();
    const [rows] = await db.execute(
      `SELECT o.*, m.role
       FROM organizations o
       JOIN memberships m ON m.org_id = o.id
       WHERE m.user_id = ?
       ORDER BY o.name ASC`,
      [req.user!.userId]
    );
    res.json({ organizations: rows });
  } catch (err) {
    console.error("My orgs error:", err);
    res.status(500).json({ error: "Failed to fetch your organizations" });
  }
}
