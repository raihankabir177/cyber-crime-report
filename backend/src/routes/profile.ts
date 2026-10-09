import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { logAuditEvent } from "../services/audit";
import { clientIp, requireAuth } from "../middleware/auth";
import { formatDateOnly } from "../utils/dates";

export const profileRouter = Router();

async function buildProfileResponse(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      victimProfile: true,
      officerProfile: true,
      adminProfile: true,
    },
  });
  if (!user) return null;

  const profile: Record<string, unknown> = {
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    id: user.id,
    join_date: formatDateOnly(user.createdAt) ?? user.createdAt,
  };

  if (user.role === "officer" && user.officerProfile) {
    profile.badge = user.officerProfile.badgeNumber ?? "";
    profile.department = user.officerProfile.department ?? "";
    profile.specialization = user.officerProfile.specialization ?? "";
  } else if (user.role === "admin" && user.adminProfile) {
    profile.admin_code = user.adminProfile.adminCode ?? "";
    profile.position = user.adminProfile.position ?? "";
  } else if (user.role === "victim" && user.victimProfile) {
    profile.nid = user.victimProfile.nid ?? "";
  }

  return profile;
}

profileRouter.get("/profile", requireAuth, async (req, res) => {
  try {
    const profile = await buildProfileResponse(req.session.userId!);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ profile });
  } catch (e) {
    console.error("Database error in profile GET:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

profileRouter.put("/profile", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const data = req.body ?? {};

  try {
    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });

    if (current.role === "officer") {
      await prisma.officer.updateMany({
        where: { userId },
        data: {
          ...(data.specialization !== undefined
            ? { specialization: data.specialization }
            : {}),
          ...(data.department !== undefined
            ? { department: data.department }
            : {}),
        },
      });
    } else if (current.role === "admin" && data.position !== undefined) {
      await prisma.admin.updateMany({
        where: { userId },
        data: { position: data.position },
      });
    }

    await logAuditEvent(
      userId,
      "Profile Updated",
      "User updated their profile information",
      "Success",
      clientIp(req)
    );

    const profile = await buildProfileResponse(userId);
    if (profile) {
      return res.json({ profile });
    }
    return res.json({ message: "Profile updated successfully" });
  } catch (e) {
    console.error("Database error in profile PUT:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

profileRouter.post("/profile/change-password", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { current_password, new_password, confirm_password } = req.body ?? {};

  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "New passwords do not match" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!verifyPassword(user.password, current_password)) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword(new_password) },
    });

    await logAuditEvent(
      userId,
      "Password Changed",
      "User changed their password",
      "Success",
      clientIp(req)
    );

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Database error in change password:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

profileRouter.get("/profile/stats", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const role = req.session.role!;

  try {
    const stats = {
      total_reports: 0,
      active_cases: 0,
      completed_cases: 0,
      total_evidence: 0,
    };

    if (role === "victim") {
      const reports = await prisma.report.findMany({
        where: { victimId: userId },
        select: { id: true, status: true },
      });
      stats.total_reports = reports.length;
      stats.active_cases = reports.filter((r) => r.status !== "Closed").length;
      stats.completed_cases = reports.filter((r) => r.status === "Closed").length;
      const reportIds = reports.map((r) => r.id);
      stats.total_evidence =
        reportIds.length === 0
          ? 0
          : await prisma.evidence.count({
              where: { reportId: { in: reportIds } },
            });
    } else if (role === "officer") {
      const reports = await prisma.report.findMany({
        where: { assignedOfficerId: userId },
        select: { id: true, status: true },
      });
      stats.total_reports = reports.length;
      stats.active_cases = reports.filter((r) => r.status !== "Closed").length;
      stats.completed_cases = reports.filter((r) => r.status === "Closed").length;
      const reportIds = reports.map((r) => r.id);
      stats.total_evidence =
        reportIds.length === 0
          ? 0
          : await prisma.evidence.count({
              where: { reportId: { in: reportIds } },
            });
    } else if (role === "admin") {
      stats.total_reports = await prisma.report.count();
      stats.active_cases = await prisma.report.count({
        where: { status: { not: "Closed" } },
      });
      stats.completed_cases = await prisma.report.count({
        where: { status: "Closed" },
      });
      stats.total_evidence = await prisma.evidence.count();
    }

    return res.json({ stats });
  } catch (e) {
    console.error("Database error in get_profile_stats:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

profileRouter.get("/test-session", (req, res) => {
  return res.json({
    user_id: req.session.userId,
    role: req.session.role,
    email: req.session.email,
    session_data: { ...req.session },
  });
});
