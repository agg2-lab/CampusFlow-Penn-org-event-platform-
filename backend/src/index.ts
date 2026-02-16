import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

import { env } from "./config/env";
import { connectMongo, initMysqlTables } from "./config/database";
import { redis } from "./config/redis";

import authRoutes from "./routes/auth.routes";
import eventsRoutes from "./routes/events.routes";
import orgsRoutes from "./routes/orgs.routes";
import checkinRoutes from "./routes/checkin.routes";
import analyticsRoutes from "./routes/analytics.routes";

async function bootstrap() {
  // ── Connect databases ──
  await connectMongo();
  await initMysqlTables();

  const app = express();
  const httpServer = createServer(app);

  // ── Socket.io for real-time check-in ──
  const io = new SocketServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join-event", (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`[Socket] ${socket.id} joined event:${eventId}`);
    });

    socket.on("leave-event", (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  // Make io accessible to controllers
  app.set("io", io);

  // ── Middleware ──
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  // ── Health check ──
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Routes ──
  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/orgs", orgsRoutes);
  app.use("/api/checkin", checkinRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // ── Real-time check-in broadcast middleware ──
  app.use("/api/checkin", (_req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.checkIn && _req.body?.qrData) {
        const eventId =
          body.checkIn.eventId || JSON.parse(_req.body.qrData)?.eventId;
        if (eventId) {
          io.to(`event:${eventId}`).emit("new-checkin", body.checkIn);
        }
      }
      return originalJson(body);
    };
    next();
  });

  // ── Global error handler ──
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  // ── Start server ──
  httpServer.listen(env.PORT, () => {
    console.log(`\n🚀 CampusFlow API running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}\n`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
