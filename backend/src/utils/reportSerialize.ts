import { Report, User, Officer } from "@prisma/client";
import { formatDateOnly, formatDateTime } from "./dates";

type ReportWithRelations = Report & {
  victim?: Partial<Pick<User, "name" | "phone">> | null;
  assignedOfficer?: Partial<Pick<User, "name" | "email">> | null;
  officerProfile?: Partial<Pick<Officer, "badgeNumber" | "specialization">> | null;
  _count?: { evidence: number };
};

export function serializeReport(r: ReportWithRelations) {
  return {
    id: r.id,
    victim_id: r.victimId,
    crime_type: r.crimeType,
    description: r.description,
    date_occurred: formatDateOnly(r.dateOccurred),
    date_submitted: formatDateTime(r.dateSubmitted),
    location: r.location,
    status: r.status === "Under_Investigation" ? "Under Investigation" : r.status,
    priority: r.priority,
    assigned_officer_id: r.assignedOfficerId,
    assignment_date: formatDateTime(r.assignmentDate),
    assignment_note: r.assignmentNote,
    victim_name: r.victim?.name,
    victim_phone: r.victim?.phone,
    assigned_officer_name: r.assignedOfficer?.name,
    assigned_officer_email: r.assignedOfficer?.email,
    badge_number: r.officerProfile?.badgeNumber,
    specialization: r.officerProfile?.specialization,
    evidence_count: r._count?.evidence,
  };
}
