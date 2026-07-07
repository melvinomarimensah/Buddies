import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function recordAudit(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata,
    },
  });
}
