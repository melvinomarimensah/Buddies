"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

type AdminResult = { success?: boolean; error?: string; count?: number };

// ---------- Listings ----------

export async function adminSetListingStatusAction(listingId: string, status: ListingStatus): Promise<AdminResult> {
  const admin = await requireAdmin();
  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  await recordAudit({
    adminId: admin.id,
    action: "listing.set_status",
    targetType: "Listing",
    targetId: listingId,
    metadata: { status },
  });
  revalidatePath("/admin/listings");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/browse");
  return { success: true };
}

export async function adminBulkRemoveListingsAction(listingIds: string[]): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (listingIds.length === 0) return { success: true, count: 0 };
  await prisma.listing.updateMany({
    where: { id: { in: listingIds } },
    data: { status: "REMOVED" },
  });
  await recordAudit({
    adminId: admin.id,
    action: "listing.bulk_remove",
    targetType: "Listing",
    targetId: listingIds.join(","),
    metadata: { count: listingIds.length },
  });
  revalidatePath("/admin/listings");
  revalidatePath("/browse");
  return { success: true, count: listingIds.length };
}

// ---------- Users ----------

export async function adminSetUserVerifiedAction(userId: string, isVerified: boolean): Promise<AdminResult> {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerified } });
  await recordAudit({
    adminId: admin.id,
    action: isVerified ? "user.verify" : "user.unverify",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminSetUserSuspendedAction(userId: string, isSuspended: boolean): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "You can't suspend your own account." };
  await prisma.user.update({ where: { id: userId }, data: { isSuspended } });
  await recordAudit({
    adminId: admin.id,
    action: isSuspended ? "user.suspend" : "user.unsuspend",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminReactivateUserAction(userId: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { deactivatedAt: null } });
  await recordAudit({
    adminId: admin.id,
    action: "user.reactivate",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
  revalidatePath("/browse");
  return { success: true };
}

export async function adminSetUserRoleAction(userId: string, role: "STUDENT" | "ADMIN"): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (userId === admin.id && role !== "ADMIN") {
    return { error: "You can't remove your own admin access." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await recordAudit({
    adminId: admin.id,
    action: role === "ADMIN" ? "user.promote" : "user.demote",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
  return { success: true };
}
