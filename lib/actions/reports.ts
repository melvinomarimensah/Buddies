"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.string().trim().min(10, "Tell us a bit more (at least 10 characters).").max(500),
});

export async function createReportAction(input: { listingId: string; reason: string }) {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Add a reason." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to report a listing." };
  if (
    !(await rateLimit(
      `report:${user.id}`,
      RATE_LIMITS.createReport.limit,
      RATE_LIMITS.createReport.windowSeconds
    ))
  ) {
    return { error: "You've submitted several reports. Please try again later." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return { error: "That listing no longer exists." };

  await prisma.report.create({
    data: {
      reporterId: user.id,
      listingId: parsed.data.listingId,
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function resolveReportAction(
  reportId: string,
  resolution: "DISMISSED" | "RESOLVED",
  removeListing: boolean
) {
  const admin = await requireAdmin();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return { error: "Report not found." };

  await prisma.report.update({ where: { id: reportId }, data: { status: resolution } });

  if (removeListing) {
    await prisma.listing.update({ where: { id: report.listingId }, data: { status: "REMOVED" } });
    revalidatePath(`/listings/${report.listingId}`);
    revalidatePath("/browse");
  }

  await recordAudit({
    adminId: admin.id,
    action: removeListing ? "report.resolve_remove" : `report.${resolution.toLowerCase()}`,
    targetType: "Report",
    targetId: reportId,
    metadata: { listingId: report.listingId, removeListing },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}
