import { Evidence } from "@prisma/client";
import { formatDateTime } from "./dates";

export type EvidenceRow = Pick<
  Evidence,
  | "id"
  | "filename"
  | "originalName"
  | "contentType"
  | "fileSize"
  | "description"
  | "uploadDate"
  | "cloudinaryUrl"
  | "filePath"
  | "reportId"
>;

export function serializeEvidence(ev: EvidenceRow & { reportId?: number }) {
  const fileUrl = ev.cloudinaryUrl || ev.filePath || null;
  return {
    id: ev.id,
    report_id: ev.reportId,
    case_id: ev.reportId,
    filename: ev.filename,
    original_name: ev.originalName,
    content_type: ev.contentType,
    file_size: ev.fileSize,
    description: ev.description,
    upload_date: formatDateTime(ev.uploadDate),
    file_url: fileUrl,
    cloudinary_url: ev.cloudinaryUrl,
  };
}
