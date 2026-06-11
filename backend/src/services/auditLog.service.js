import prisma from "../prisma/client.js";

export async function createAuditLog({
  req,
  action,
  entity = null,
  entityId = null,
  description = null,
  metadata = null,
}) {
  try {
    const userId = req?.user?.id || req?.user?.userId || null;
    const clinicId = req?.user?.clinicId || null;

    const ipAddress =
      req?.headers?.["x-forwarded-for"] ||
      req?.socket?.remoteAddress ||
      null;

    const userAgent = req?.headers?.["user-agent"] || null;

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        description,
        userId,
        clinicId,
        metadata,
        ipAddress: String(ipAddress || ""),
        userAgent: String(userAgent || ""),
      },
    });
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
  }
}