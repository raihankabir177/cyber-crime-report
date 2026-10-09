import { Router } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { logAuditEvent } from "../services/audit";
import { onUserCreated } from "../services/reports";
import { clientIp } from "../middleware/auth";
import { env, SESSION_COOKIE } from "../config/env";
import crypto from "crypto";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleLogin = async (req: any, res: any) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email, isActive: true },
    });
    if (!user || !verifyPassword(user.password, password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // New session id on login prevents session fixation.
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err: any) => (err ? reject(err) : resolve()))
    );
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;

    await logAuditEvent(
      user.id,
      "User Login",
      `Login successful for ${user.role}`,
      "Success",
      clientIp(req)
    );

    return res.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
    });
  } catch (e) {
    console.error("Database error during login:", e);
    return res.status(500).json({ error: "Database error" });
  }
};

const handleLogout = async (req: any, res: any) => {
  const userId = req.session.userId;
  if (userId) {
    await logAuditEvent(
      userId,
      "User Logout",
      "User logged out",
      "Success",
      clientIp(req)
    );
  }
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? "none" : "lax",
    });
    return res.json({ message: "Logout successful" });
  });
};

authRouter.post("/login", handleLogin);
authRouter.post("/auth/login", handleLogin);

authRouter.post("/logout", handleLogout);
authRouter.post("/auth/logout", handleLogout);

const handleSignup = async (req: any, res: any) => {
  const data = req.body ?? {};
  const {
    name,
    email,
    password,
    confirmPassword,
    role,
    phone,
    nid,
    badge,
    department,
    specialization,
    adminCode,
    position,
  } = data;

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (role === "admin") {
    const expected = Buffer.from(env.adminSignupCode);
    const given = Buffer.from(String(adminCode ?? ""));
    if (
      !env.adminSignupCode ||
      expected.length !== given.length ||
      !crypto.timingSafeEqual(expected, given)
    ) {
      return res.status(403).json({ error: "Invalid admin code" });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  if (role === "victim") {
    if (!name || !email || !phone || !nid || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
  } else if (role === "officer") {
    if (
      !name ||
      !email ||
      !phone ||
      !badge ||
      !department ||
      !specialization ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
  } else if (role === "admin") {
    if (!name || !email || !phone || !adminCode || !position || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
  } else {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const passwordHash = hashPassword(password);
    const userRole = role as UserRole;

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          phone,
          role: userRole,
        },
      });

      if (userRole === UserRole.victim) {
        await tx.victim.create({ data: { userId: created.id, nid } });
      } else if (userRole === UserRole.officer) {
        await tx.officer.create({
          data: {
            userId: created.id,
            badgeNumber: badge,
            department,
            specialization,
          },
        });
      } else if (userRole === UserRole.admin) {
        await tx.admin.create({
          data: {
            userId: created.id,
            adminCode,
            position,
          },
        });
      }

      return created;
    });

    await onUserCreated(user.id, role, email);
    await logAuditEvent(
      user.id,
      "User Created",
      `New ${role} account created`,
      "Success",
      clientIp(req)
    );

    return res.json({ message: "Signup successful", role });
  } catch (e) {
    console.error("Database error during signup:", e);
    return res.status(500).json({ error: "Database error" });
  }
};

authRouter.post("/signup", handleSignup);
authRouter.post("/auth/signup", handleSignup);
