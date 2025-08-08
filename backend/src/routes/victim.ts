import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, clientIp } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { saveEvidenceFiles } from "../services/evidenceUpload";
import { logAuditEvent } from "../services/audit";
import { onReportSubmitted } from "../services/reports";
import { serializeEvidence } from "../utils/evidence";
import { serializeReport } from "../utils/reportSerialize";
import { formatDateTime } from "../utils/dates";

export const victimRouter = Router();

victimRouter.post(
  "/victim/report",
  requireRole("victim"),
  upload.array("files"),
  async (req, res) => {
    const victimId = req.session.userId!;
    const { crime_type, description, date, location } = req.body ?? {};
    const files = (req.files as Express.Multer.File[]) ?? [];

    if (!crime_type || !description || !date || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const report = await prisma.report.create({
        data: {
          victimId,
          crimeType: crime_type,
          description,
          dateOccurred: new Date(date),
          location,
          status: "Open",
          priority: "Medium",
        },
      });

      let evidenceCount = 0;
      if (files.length > 0) {
        try {
          const saved = await saveEvidenceFiles(
            report.id,
            victimId,
            files,
            "Evidence uploaded with report"
          );
          evidenceCount = saved.length;
        } catch (uploadError) {
          // Don't leave a half-created report behind (a retry would duplicate it).
          console.error("Evidence upload failed, rolling back report:", uploadError);
          await prisma.report.delete({ where: { id: report.id } }).catch(() => {});
          return res.status(502).json({
            error: "Evidence upload failed. Your report was not submitted; please try again.",
          });
        }
      }

      await onReportSubmitted(report.id, victimId);

      return res.json({
        message: "Report submitted successfully",
        report_id: report.id,
        evidence_count: evidenceCount,
      });
    } catch (e) {
      console.error("Database error in report submission:", e);
      return res.status(500).json({ error: "Database error" });
    }
  }
);

victimRouter.post(
  "/victim/report/:reportId/evidence",
  requireRole("victim"),
  upload.array("files"),
  async (req, res) => {
    const userId = req.session.userId!;
    const reportId = parseInt(req.params.reportId, 10);
    const files = (req.files as Express.Multer.File[]) ?? [];

    try {
      const report = await prisma.report.findFirst({
        where: { id: reportId, victimId: userId },
      });
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (files.length > 0) {
        await saveEvidenceFiles(
          reportId,
          userId,
          files,
          "Additional evidence uploaded"
        );
      }

      const evidence = await prisma.evidence.findMany({
        where: { reportId },
        orderBy: { uploadDate: "desc" },
      });

      return res.json({
        message: "Evidence added successfully",
        evidence: evidence.map(serializeEvidence),
      });
    } catch (e) {
      console.error("Database error in add evidence:", e);
      return res.status(500).json({ error: "Database error" });
    }
  }
);

victimRouter.get("/victim/reports", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  try {
    const reports = await prisma.report.findMany({
      where: { victimId: userId },
      include: {
        victim: { select: { name: true } },
        assignedOfficer: { select: { name: true } },
        _count: { select: { evidence: true } },
      },
      orderBy: { dateSubmitted: "desc" },
    });

    return res.json({
      reports: reports.map((r) =>
        serializeReport({
          ...r,
          victim: r.victim,
          assignedOfficer: r.assignedOfficer,
          _count: r._count,
        })
      ),
    });
  } catch (e) {
    console.error("Database error in get_victim_reports:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

victimRouter.get("/victim/report/:reportId", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const reportId = parseInt(req.params.reportId, 10);

  try {
    const report = await prisma.report.findFirst({
      where: { id: reportId, victimId: userId },
      include: {
        victim: { select: { name: true } },
        assignedOfficer: { select: { name: true, email: true } },
      },
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const officerProfile =
      report.assignedOfficerId != null
        ? await prisma.officer.findFirst({
            where: { userId: report.assignedOfficerId },
          })
        : null;

    const evidence = await prisma.evidence.findMany({
      where: { reportId },
      orderBy: { uploadDate: "desc" },
    });

    const serialized = serializeReport({
      ...report,
      victim: report.victim,
      assignedOfficer: report.assignedOfficer,
      officerProfile,
    });
    return res.json({
      report: {
        ...serialized,
        evidence: evidence.map(serializeEvidence),
      },
    });
  } catch (e) {
    console.error("Database error in get_victim_report_details:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

victimRouter.get("/victim/report/:reportId/logs", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const reportId = parseInt(req.params.reportId, 10);

  try {
    const report = await prisma.report.findFirst({
      where: { id: reportId, victimId: userId },
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found or not authorized" });
    }

    const logs = await prisma.caseLog.findMany({
      where: { reportId },
      include: { officer: { select: { name: true, email: true } } },
      orderBy: { logDate: "desc" },
    });

    return res.json({
      logs: logs.map((log) => {
        const logDate = formatDateTime(log.logDate)!;
        return {
          id: log.id,
          report_id: log.reportId,
          officer_id: log.officerId,
          action: log.action,
          notes: log.notes,
          log_date: logDate,
          date: logDate.split(" ")[0],
          status: log.status,
          officer_name: log.officer.name,
          officer_email: log.officer.email,
        };
      }),
    });
  } catch (e) {
    console.error("Database error in get_victim_report_logs:", e);
    return res.status(500).json({ error: "Database error" });
  }
});
