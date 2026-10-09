import { Request, Response, NextFunction } from "express";

export type SessionUser = {
  userId: number;
  email: string;
  role: "victim" | "officer" | "admin";
};

declare module "express-session" {
  interface SessionData {
    userId?: number;
    email?: string;
    role?: "victim" | "officer" | "admin";
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function requireRole(...roles: SessionUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.session.role)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
}

export function clientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1"
  );
}
