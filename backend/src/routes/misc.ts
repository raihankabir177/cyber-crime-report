import { Router } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export const miscRouter = Router();

miscRouter.get("/test_db", async (_req, res) => {
  if (env.isProduction) {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    return res.json({
      message: "Database connection successful",
      tables: tables.map((t) => t.tablename),
    });
  } catch (e) {
    return res.status(500).json({ error: `Database error: ${String(e)}` });
  }
});

miscRouter.get("/notifications", (_req, res) => {
  return res.json({ notifications: [] });
});

miscRouter.post("/notifications/mark-read", (_req, res) => {
  return res.json({ message: "Notifications marked as read" });
});
