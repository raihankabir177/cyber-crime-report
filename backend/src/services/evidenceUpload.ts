import { prisma } from "../lib/prisma";
import { uploadBufferToCloudinary } from "./cloudinary";
import { onEvidenceUploaded } from "./reports";
import { serializeEvidence } from "../utils/evidence";

export async function saveEvidenceFiles(
  reportId: number,
  uploadedBy: number,
  files: Express.Multer.File[],
  description: string
) {
  const saved = [];
  for (const file of files) {
    if (!file.originalname) continue;
    const upload = await uploadBufferToCloudinary(
      file.buffer,
      `reports/${reportId}`,
      file.originalname
    );
    const uniqueFilename = `${reportId}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const record = await prisma.evidence.create({
      data: {
        reportId,
        filename: uniqueFilename,
        originalName: file.originalname,
        filePath: upload.url,
        cloudinaryUrl: upload.url,
        cloudinaryPublicId: upload.publicId,
        fileSize: upload.bytes,
        contentType: file.mimetype,
        uploadedBy,
        description,
      },
    });
    saved.push(record);
  }
  if (saved.length > 0) {
    await onEvidenceUploaded(reportId, uploadedBy);
  }
  return saved.map(serializeEvidence);
}
