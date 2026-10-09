import { prisma } from "../lib/prisma";

export async function logAuditEvent(
  userId: number | null | undefined,
  action: string,
  details: string,
  status = "Success",
  ipAddress = "127.0.0.1"
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        details,
        status,
        ipAddress,
      },
    });
  } catch (e) {
    console.error("Error logging audit event:", e);
  }
}
