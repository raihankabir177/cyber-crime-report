import { ReportStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logAuditEvent } from "./audit";

export async function assignOfficerToReport(
  reportId: number,
  officerId: number,
  assignmentNote: string
): Promise<boolean> {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return false;

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: {
        assignedOfficerId: officerId,
        assignmentDate: new Date(),
        assignmentNote,
        status: ReportStatus.Under_Investigation,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: officerId,
        action: "Officer Assigned",
        details: `Officer assigned to report #${reportId}`,
        status: "Success",
      },
    }),
  ]);

  return true;
}

export async function updateReportStatus(
  reportId: number,
  newStatus: ReportStatus,
  officerId: number
): Promise<boolean> {
  const report = await prisma.report.findFirst({
    where: { id: reportId, assignedOfficerId: officerId },
  });
  if (!report) return false;

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus },
    }),
    prisma.auditLog.create({
      data: {
        userId: officerId,
        action: "Status Updated",
        details: `Report #${reportId} status changed to ${newStatus.replace("_", " ")}`,
        status: "Success",
      },
    }),
  ]);

  return true;
}

export async function getUserStatistics() {
  const users = await prisma.user.groupBy({
    by: ["role"],
    where: { isActive: true },
    _count: { id: true },
  });
  const total = users.reduce((s, u) => s + u._count.id, 0);
  const byRole = Object.fromEntries(users.map((u) => [u.role, u._count.id]));
  return {
    total_users: total,
    victims: byRole.victim ?? 0,
    officers: byRole.officer ?? 0,
    admins: byRole.admin ?? 0,
  };
}

export async function getReportStatistics() {
  const reports = await prisma.report.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const total = reports.reduce((s, r) => s + r._count.id, 0);
  const byStatus = Object.fromEntries(
    reports.map((r) => [r.status, r._count.id])
  );
  return {
    total_reports: total,
    open_reports: byStatus.Open ?? 0,
    investigating_reports: byStatus.Under_Investigation ?? 0,
    closed_reports: byStatus.Closed ?? 0,
    rejected_reports: byStatus.Rejected ?? 0,
  };
}

export async function getOfficerWorkload(officerId: number) {
  const user = await prisma.user.findFirst({
    where: { id: officerId, role: "officer", isActive: true },
    include: { officerProfile: true },
  });
  if (!user) return null;

  const reports = await prisma.report.groupBy({
    by: ["status"],
    where: { assignedOfficerId: officerId },
    _count: { id: true },
  });
  const total = reports.reduce((s, r) => s + r._count.id, 0);
  const byStatus = Object.fromEntries(
    reports.map((r) => [r.status, r._count.id])
  );

  return {
    id: user.officerProfile?.id ?? user.id,
    officer_name: user.name,
    total_cases: total,
    open_cases: byStatus.Open ?? 0,
    investigating_cases: byStatus.Under_Investigation ?? 0,
    closed_cases: byStatus.Closed ?? 0,
  };
}

export function mapStatusInput(status: string): ReportStatus | null {
  const normalized = status.trim();
  const map: Record<string, ReportStatus> = {
    Open: ReportStatus.Open,
    "Under Investigation": ReportStatus.Under_Investigation,
    Closed: ReportStatus.Closed,
    Rejected: ReportStatus.Rejected,
  };
  return map[normalized] ?? null;
}

export async function onEvidenceUploaded(
  reportId: number,
  uploadedBy: number
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: uploadedBy,
      action: "Evidence Uploaded",
      details: `Evidence uploaded for report #${reportId}`,
      status: "Success",
    },
  });

  await prisma.report.updateMany({
    where: { id: reportId, status: ReportStatus.Open },
    data: { status: ReportStatus.Under_Investigation },
  });
}

export async function onReportSubmitted(
  reportId: number,
  victimId: number
): Promise<void> {
  await logAuditEvent(
    victimId,
    "Report Submitted",
    `Crime report #${reportId} submitted`,
    "Success"
  );
}

export async function onUserCreated(
  userId: number,
  role: string,
  email: string
): Promise<void> {
  await logAuditEvent(
    userId,
    "User Created",
    `New ${role} account created: ${email}`,
    "Success"
  );
}

export async function onCaseLogAdded(
  reportId: number,
  officerId: number,
  action: string
): Promise<void> {
  await logAuditEvent(
    officerId,
    "Case Log Added",
    `Log entry added for report #${reportId}: ${action}`,
    "Success"
  );
}
