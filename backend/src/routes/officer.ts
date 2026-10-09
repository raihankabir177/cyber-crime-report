import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { saveEvidenceFiles } from "../services/evidenceUpload";
import {
  getOfficerWorkload,
  mapStatusInput,
  onCaseLogAdded,
  updateReportStatus,
} from "../services/reports";
import { serializeEvidence } from "../utils/evidence";
import { serializeReport } from "../utils/reportSerialize";
import { formatDateTime } from "../utils/dates";

export const officerRouter = Router();

officerRouter.get("/officer/all_evidence", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;

  try {
    const evidence = await prisma.evidence.findMany({
      where: { report: { assignedOfficerId: officerId } },
      include: {
        report: {
          include: { victim: { select: { name: true } } },
        },
      },
      orderBy: { uploadDate: "desc" },
    });

    return res.json({
      evidence: evidence.map((e) => ({
        ...serializeEvidence(e),
        crime_type: e.report.crimeType,
        status:
          e.report.status === "Under_Investigation"
            ? "Under Investigation"
            : e.report.status,
        victim_name: e.report.victim.name,
      })),
    });
  } catch (e) {
    console.error("Database error in officer_all_evidence:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

officerRouter.get("/officer/case/:caseId", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;
  const caseId = parseInt(req.params.caseId, 10);

  try {
    const report = await prisma.report.findFirst({
      where: { id: caseId, assignedOfficerId: officerId },
      include: { victim: { select: { name: true, phone: true } } },
    });
    if (!report) {
      return res.status(404).json({ error: "Case not found" });
    }

    return res.json({
      case: {
        id: report.id,
        crime_type: report.crimeType,
        description: report.description,
        date_occurred: report.dateOccurred.toISOString().slice(0, 10),
        date_submitted: formatDateTime(report.dateSubmitted),
        location: report.location,
        status:
          report.status === "Under_Investigation"
            ? "Under Investigation"
            : report.status,
        priority: report.priority,
        victim_name: report.victim.name,
        victim_phone: report.victim.phone,
      },
    });
  } catch (e) {
    console.error("Database error in get_case_details:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

officerRouter.put("/officer/case/:caseId", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;
  const caseId = parseInt(req.params.caseId, 10);
  const newStatus = req.body?.status;

  if (!newStatus) {
    return res.status(400).json({ error: "Status is required" });
  }

  const mapped = mapStatusInput(newStatus);
  if (!mapped) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const ok = await updateReportStatus(caseId, mapped, officerId);
    if (!ok) {
      return res.status(404).json({ error: "Case not found or not assigned to you" });
    }
    return res.json({ message: "Status updated successfully" });
  } catch (e) {
    console.error("Error updating report status:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

officerRouter.post("/officer/case/:caseId/logs", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;
  const caseId = parseInt(req.params.caseId, 10);
  const { action, notes } = req.body ?? {};

  if (!action || !notes) {
    return res.status(400).json({ error: "Action and notes are required" });
  }

  try {
    const report = await prisma.report.findFirst({
      where: { id: caseId, assignedOfficerId: officerId },
    });
    if (!report) {
      return res.status(404).json({ error: "Case not found or not assigned to you" });
    }

    await prisma.caseLog.create({
      data: {
        reportId: caseId,
        officerId,
        action,
        notes,
      },
    });

    await onCaseLogAdded(caseId, officerId, action);
    return res.json({ message: "Log entry saved successfully." });
  } catch (e) {
    console.error("Database error in add_case_log:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

officerRouter.get("/officer/case/:caseId/logs", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;
  const caseId = parseInt(req.params.caseId, 10);

  try {
    const report = await prisma.report.findFirst({
      where: { id: caseId, assignedOfficerId: officerId },
    });
    if (!report) {
      return res.status(404).json({ error: "Case not found or not assigned to you" });
    }

    const logs = await prisma.caseLog.findMany({
      where: { reportId: caseId },
      include: { officer: { select: { name: true, email: true } } },
      orderBy: { logDate: "desc" },
    });

    return res.json({
      logs: logs.map((log) => {
        const logDate = formatDateTime(log.logDate)!;
        return {
          ...log,
          log_date: logDate,
          date: logDate.split(" ")[0],
          officer_name: log.officer.name,
          officer_email: log.officer.email,
        };
      }),
    });
  } catch (e) {
    console.error("Database error in get_case_logs:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

officerRouter.get(
  "/officer/case/:caseId/evidence",
  requireRole("officer"),
  async (req, res) => {
    const officerId = req.session.userId!;
    const caseId = parseInt(req.params.caseId, 10);

    try {
      const report = await prisma.report.findFirst({
        where: { id: caseId, assignedOfficerId: officerId },
      });
      if (!report) {
        return res.status(404).json({ error: "Case not found or not assigned to you" });
      }

      const evidence = await prisma.evidence.findMany({
        where: { reportId: caseId },
        orderBy: { uploadDate: "desc" },
      });

      return res.json({ evidence: evidence.map(serializeEvidence) });
    } catch (e) {
      console.error("Database error in officer_case_evidence GET:", e);
      return res.status(500).json({ error: "Database error" });
    }
  }
);

officerRouter.post(
  "/officer/case/:caseId/evidence",
  requireRole("officer"),
  upload.array("files"),
  async (req, res) => {
    const officerId = req.session.userId!;
    const caseId = parseInt(req.params.caseId, 10);
    const files = (req.files as Express.Multer.File[]) ?? [];

    if (!files.length) {
      return res.status(400).json({ error: "No files provided" });
    }

    try {
      const report = await prisma.report.findFirst({
        where: { id: caseId, assignedOfficerId: officerId },
      });
      if (!report) {
        return res.status(404).json({ error: "Case not found or not assigned to you" });
      }

      const evidence = await saveEvidenceFiles(
        caseId,
        officerId,
        files,
        "Evidence uploaded by officer"
      );

      if (!evidence.length) {
        return res.status(400).json({ error: "No valid files were uploaded" });
      }

      return res.json({ message: "Evidence added successfully", evidence });
    } catch (e) {
      console.error("Database error in officer_case_evidence POST:", e);
      return res.status(500).json({ error: "Database error" });
    }
  }
);

officerRouter.get("/officer/workload", requireRole("officer"), async (req, res) => {
  const workload = await getOfficerWorkload(req.session.userId!);
  if (!workload) {
    return res.status(500).json({ error: "Unable to get workload data" });
  }
  return res.json({ workload });
});

officerRouter.get("/officer/assigned_cases", requireRole("officer"), async (req, res) => {
  const officerId = req.session.userId!;
  const statusFilter = (req.query.status as string) || "All Status";
  const crimeTypeFilter = (req.query.crimeType as string) || "All Types";
  const searchQuery = (req.query.search as string) || "";
  const sortBy = (req.query.sortBy as string) || "Date Reported";

  try {
    const where: Record<string, unknown> = { assignedOfficerId: officerId };
    if (statusFilter !== "All Status") {
      where.status =
        statusFilter === "Under Investigation"
          ? "Under_Investigation"
          : statusFilter;
    }
    if (crimeTypeFilter !== "All Types") {
      where.crimeType = crimeTypeFilter;
    }

    let reports = await prisma.report.findMany({
      where,
      include: { victim: { select: { name: true, phone: true } } },
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.victim.name.toLowerCase().includes(q) ||
          r.crimeType.toLowerCase().includes(q)
      );
    }

    reports.sort((a, b) => {
      if (sortBy === "Victim Name") {
        return a.victim.name.localeCompare(b.victim.name);
      }
      if (sortBy === "Case ID") {
        return a.id - b.id;
      }
      if (sortBy === "Crime Type") {
        return a.crimeType.localeCompare(b.crimeType);
      }
      if (sortBy === "Status") {
        return String(a.status).localeCompare(String(b.status));
      }
      return b.dateSubmitted.getTime() - a.dateSubmitted.getTime();
    });

    return res.json({
      cases: reports.map((r) =>
        serializeReport({
          ...r,
          victim: r.victim,
        })
      ),
    });
  } catch (e) {
    console.error("Database error in officer_assigned_cases:", e);
    return res.status(500).json({ error: "Database error" });
  }
});
