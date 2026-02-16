import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),

  // MongoDB
  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb://campusflow:campusflow_secret@localhost:27017/campusflow?authSource=admin",

  // MySQL
  MYSQL_HOST: process.env.MYSQL_HOST || "localhost",
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT || "3306", 10),
  MYSQL_USER: process.env.MYSQL_USER || "campusflow",
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || "campusflow_secret",
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || "campusflow",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  MAGIC_LINK_SECRET: process.env.MAGIC_LINK_SECRET || "dev-magic-secret",

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
} as const;
