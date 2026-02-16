import mongoose from "mongoose";
import mysql from "mysql2/promise";
import { env } from "./env";

// ── MongoDB connection ──
export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("[DB] MongoDB connected");
  } catch (err) {
    console.error("[DB] MongoDB connection error:", err);
    process.exit(1);
  }
}

// ── MySQL connection pool ──
let pool: mysql.Pool | null = null;

export function getMysqlPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
    });
    console.log("[DB] MySQL pool created");
  }
  return pool;
}

// ── Bootstrap MySQL tables ──
export async function initMysqlTables(): Promise<void> {
  const db = getMysqlPool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          VARCHAR(36) PRIMARY KEY,
      email       VARCHAR(255) NOT NULL UNIQUE,
      name        VARCHAR(255) NOT NULL,
      avatar_url  TEXT,
      password    VARCHAR(255),
      provider    ENUM('local','google') DEFAULT 'local',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id          VARCHAR(36) PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      logo_url    TEXT,
      category    VARCHAR(100),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS memberships (
      id          VARCHAR(36) PRIMARY KEY,
      user_id     VARCHAR(36) NOT NULL,
      org_id      VARCHAR(36) NOT NULL,
      role        ENUM('admin','officer','member') DEFAULT 'member',
      joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
      UNIQUE KEY unique_membership (user_id, org_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id          VARCHAR(36) PRIMARY KEY,
      event_id    VARCHAR(36) NOT NULL,
      user_id     VARCHAR(36) NOT NULL,
      type        ENUM('free','paid') DEFAULT 'free',
      price       DECIMAL(10,2) DEFAULT 0,
      status      ENUM('active','used','cancelled') DEFAULT 'active',
      qr_code     TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("[DB] MySQL tables initialized");
}
