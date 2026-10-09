import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireRole, clientIp } from "../middleware/auth";
import { logAuditEvent } from "../services/audit";
import {
  assignOfficerToReport,
  getReportStatistics,
  getUserStatistics,
} from "../services/reports";
import { serializeReport } from "../utils/reportSerialize";
import { formatDateTime, formatDateOnly } from "../utils/dates";

export const adminRouter = Router();

adminRouter.post("/admin/assign", requireRole("admin"), async (req, res) => {
  const { report_id, officer_id, note } = req.body ?? {};
  if (!report_id || !officer_id) {
    return res.status(400).json({ error: "Report ID and Officer ID are required" });
  }

  try {
    const ok = await assignOfficerToReport(
      Number(report_id),
      Number(officer_id),
      note || ""
    );
    if (!ok) {
      return res.status(500).json({ error: "Failed to assign officer" });
    }
    return res.json({ message: "Officer assigned successfully" });
  } catch (e) {
    console.error("Error in admin assign:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/analytics", requireRole("admin"), async (req, res) => {
  try {
    const userStats = await getUserStatistics();
    const reportStats = await getReportStatistics();

    const officers = await prisma.user.findMany({
      where: { role: "officer", isActive: true },
      include: {
        officerProfile: true,
        reportsAsOfficer: true,
      },
    });

    const reportsPerOfficer = officers.map((o) => {
      const total = o.reportsAsOfficer.length;
      const closed = o.reportsAsOfficer.filter((r) => r.status === "Closed").length;
      const avg =
        total === 0
          ? 0
          : o.reportsAsOfficer.reduce((sum, r) => {
              const start = r.dateSubmitted.getTime();
              const end = (r.assignmentDate ?? new Date()).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / total;
      return {
        officer_name: o.name,
        total_cases: total,
        closed_cases: closed,
        avg_response_time: avg,
      };
    });

    const activeReports = await prisma.report.findMany({
      where: { status: { in: ["Open", "Under_Investigation"] } },
      include: {
        victim: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true, email: true } },
      },
      orderBy: [{ priority: "desc" }, { dateSubmitted: "desc" }],
      take: 10,
    });

    const activeCases = activeReports.map((r) => ({
      id: r.id,
      crime_type: r.crimeType,
      description: r.description,
      date_occurred: formatDateOnly(r.dateOccurred),
      date_submitted: formatDateTime(r.dateSubmitted),
      location: r.location,
      status: r.status === "Under_Investigation" ? "Under Investigation" : r.status,
      priority: r.priority,
      victim_name: r.victim.name,
      victim_phone: r.victim.phone,
      officer_name: r.assignedOfficer?.name,
      officer_email: r.assignedOfficer?.email,
    }));

    const evidenceGroups = await prisma.evidence.groupBy({
      by: ["reportId"],
      _count: { id: true },
      _sum: { fileSize: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const reportIds = evidenceGroups.map((g) => g.reportId);
    const reportsMap = new Map(
      (
        await prisma.report.findMany({
          where: { id: { in: reportIds } },
          select: { id: true, crimeType: true },
        })
      ).map((r) => [r.id, r.crimeType])
    );

    const evidenceSummary = evidenceGroups.map((g) => ({
      report_id: g.reportId,
      crime_type: reportsMap.get(g.reportId),
      evidence_count: g._count.id,
      total_size: g._sum.fileSize ?? 0,
    }));

    return res.json({
      user_stats: userStats,
      report_stats: reportStats,
      reports_per_officer: reportsPerOfficer,
      active_cases: activeCases,
      evidence_summary: evidenceSummary,
    });
  } catch (e) {
    console.error("Database error in admin_analytics:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/active_cases", requireRole("admin"), async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: { in: ["Open", "Under_Investigation"] } },
      include: {
        victim: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true, email: true } },
      },
      orderBy: [{ priority: "desc" }, { dateSubmitted: "desc" }],
    });

    return res.json({
      active_cases: reports.map((r) => ({
        id: r.id,
        crime_type: r.crimeType,
        description: r.description,
        date_occurred: formatDateOnly(r.dateOccurred),
        date_submitted: formatDateTime(r.dateSubmitted),
        location: r.location,
        status: r.status === "Under_Investigation" ? "Under Investigation" : r.status,
        priority: r.priority,
        victim_name: r.victim.name,
        victim_phone: r.victim.phone,
        officer_name: r.assignedOfficer?.name,
        officer_email: r.assignedOfficer?.email,
      })),
    });
  } catch (e) {
    console.error("Database error in get_active_cases:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/officer_performance", requireRole("admin"), async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: "officer", isActive: true },
      include: { officerProfile: true, reportsAsOfficer: true },
    });

    const officerPerformance = officers.map((o) => {
      const total = o.reportsAsOfficer.length;
      const open = o.reportsAsOfficer.filter((r) => r.status === "Open").length;
      const investigating = o.reportsAsOfficer.filter(
        (r) => r.status === "Under_Investigation"
      ).length;
      const closed = o.reportsAsOfficer.filter((r) => r.status === "Closed").length;
      const avg =
        total === 0
          ? 0
          : o.reportsAsOfficer.reduce((sum, r) => {
              const start = r.dateSubmitted.getTime();
              const end = (r.assignmentDate ?? new Date()).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / total;

      return {
        id: o.id,
        officer_name: o.name,
        email: o.email,
        badge_number: o.officerProfile?.badgeNumber,
        department: o.officerProfile?.department,
        specialization: o.officerProfile?.specialization,
        total_cases: total,
        open_cases: open,
        investigating_cases: investigating,
        closed_cases: closed,
        avg_response_time: avg,
      };
    });

    return res.json({ officer_performance: officerPerformance });
  } catch (e) {
    console.error("Database error in get_officer_performance:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/audit_trail", requireRole("admin"), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return res.json({
      audit_trail: logs.map((log) => ({
        id: log.id,
        timestamp: formatDateTime(log.timestamp),
        action: log.action,
        details: log.details,
        status: log.status,
        ip_address: log.ipAddress,
        user_name: log.user?.name,
        user_email: log.user?.email,
        user_role: log.user?.role,
      })),
    });
  } catch (e) {
    console.error("Database error in get_audit_trail:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/all_reports", requireRole("admin"), async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        victim: { select: { name: true, phone: true } },
        assignedOfficer: { select: { name: true } },
      },
      orderBy: { dateSubmitted: "desc" },
    });

    return res.json({
      reports: reports.map((r) => serializeReport({ ...r, victim: r.victim, assignedOfficer: r.assignedOfficer })),
    });
  } catch (e) {
    console.error("Database error in admin_all_reports:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/available_officers", requireRole("admin"), async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: "officer", isActive: true },
      include: { officerProfile: true },
      orderBy: { name: "asc" },
    });

    return res.json({
      officers: officers.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        specialization: o.officerProfile?.specialization ?? "General",
        department: o.officerProfile?.department ?? "Cyber Crime",
        badge: o.officerProfile?.badgeNumber ?? "N/A",
        rank: o.officerProfile?.rankName ?? "Officer",
      })),
    });
  } catch (e) {
    console.error("Database error in admin_available_officers:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/users", requireRole("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        victimProfile: true,
        officerProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "N/A",
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        joinDate: formatDateOnly(user.createdAt) ?? "2024-01-01",
        specialization: user.officerProfile?.specialization ?? "General",
        department: user.officerProfile?.department ?? "Cyber Crime",
        badge: user.officerProfile?.badgeNumber ?? "N/A",
      })),
    });
  } catch (e) {
    console.error("Database error in get_all_users:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.put("/admin/users/:userId", requireRole("admin"), async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const data = req.body ?? {};

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.role !== undefined
          ? { role: data.role.toLowerCase() as "victim" | "officer" | "admin" }
          : {}),
      },
    });

    if (data.role?.toLowerCase() === "officer") {
      await prisma.officer.updateMany({
        where: { userId },
        data: {
          ...(data.specialization !== undefined
            ? { specialization: data.specialization }
            : {}),
          ...(data.department !== undefined ? { department: data.department } : {}),
        },
      });
    }

    await logAuditEvent(
      req.session.userId,
      "User Updated",
      `User ID ${userId} updated`,
      "Success",
      clientIp(req)
    );

    return res.json({ message: "User updated successfully" });
  } catch (e) {
    console.error("Database error during user update:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.delete("/admin/users/:userId", requireRole("admin"), async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (userId === req.session.userId) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await logAuditEvent(
      req.session.userId,
      "User Deleted",
      `User ${user.name} (${user.email}) deleted`,
      "Success",
      clientIp(req)
    );

    return res.json({ message: "User deleted successfully" });
  } catch (e) {
    console.error("Database error during user deletion:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/users/stats", requireRole("admin"), async (req, res) => {
  try {
    const grouped = await prisma.user.groupBy({
      by: ["role"],
      where: { isActive: true },
      _count: { id: true },
    });
    const total = grouped.reduce((s, g) => s + g._count.id, 0);
    const byRole = Object.fromEntries(grouped.map((g) => [g.role, g._count.id]));

    return res.json({
      total,
      victims: byRole.victim ?? 0,
      officers: byRole.officer ?? 0,
      admins: byRole.admin ?? 0,
    });
  } catch (e) {
    console.error("Database error in get_user_stats:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.get("/admin/audit_logs", requireRole("admin"), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return res.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        status: log.status,
        ip_address: log.ipAddress,
        timestamp: formatDateTime(log.timestamp),
        user: log.user?.name ?? "Unknown User",
        user_email: log.user?.email,
        role: log.user?.role ?? "Unknown Role",
      })),
    });
  } catch (e) {
    console.error("Database error in get_audit_logs:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

adminRouter.delete("/admin/audit_logs/reset", requireRole("admin"), async (req, res) => {
  try {
    await prisma.auditLog.deleteMany();
    await logAuditEvent(
      req.session.userId,
      "Audit Log Reset",
      "All audit logs have been cleared",
      "Success",
      clientIp(req)
    );
    return res.json({ message: "Audit logs reset successfully" });
  } catch (e) {
    console.error("Database error in reset_audit_logs:", e);
    return res.status(500).json({ error: "Database error" });
  }
});
