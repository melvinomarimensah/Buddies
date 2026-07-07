"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

const universitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(80),
  emailDomain: z.string().trim().toLowerCase().min(3).max(120),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only use lowercase letters, numbers, and hyphens."),
  icon: z.string().trim().min(1).max(40),
  type: z.enum(["PRODUCT", "SERVICE"]),
});

function revalidateLookups() {
  revalidateTag("universities");
  revalidateTag("categories");
  revalidatePath("/admin/settings");
}

// ---------- Universities ----------

export async function upsertUniversityAction(input: {
  id?: string;
  name: string;
  country: string;
  city: string;
  emailDomain: string;
}) {
  const admin = await requireAdmin();
  const parsed = universitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };

  const clash = await prisma.university.findFirst({
    where: { emailDomain: parsed.data.emailDomain, NOT: input.id ? { id: input.id } : undefined },
  });
  if (clash) return { error: "That email domain is already registered." };

  const record = input.id
    ? await prisma.university.update({ where: { id: input.id }, data: parsed.data })
    : await prisma.university.create({ data: parsed.data });

  await recordAudit({
    adminId: admin.id,
    action: input.id ? "university.update" : "university.create",
    targetType: "University",
    targetId: record.id,
    metadata: { name: record.name },
  });
  revalidateLookups();
  return { success: true };
}

export async function deleteUniversityAction(id: string) {
  const admin = await requireAdmin();
  const inUse = await prisma.user.count({ where: { universityId: id } });
  if (inUse > 0) {
    return { error: `Can't delete — ${inUse} user(s) belong to this campus.` };
  }
  await prisma.university.delete({ where: { id } });
  await recordAudit({ adminId: admin.id, action: "university.delete", targetType: "University", targetId: id });
  revalidateLookups();
  return { success: true };
}

// ---------- Categories ----------

export async function upsertCategoryAction(input: {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  type: "PRODUCT" | "SERVICE";
}) {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };

  const clash = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, NOT: input.id ? { id: input.id } : undefined },
  });
  if (clash) return { error: "That slug is already in use." };

  const record = input.id
    ? await prisma.category.update({ where: { id: input.id }, data: parsed.data })
    : await prisma.category.create({ data: parsed.data });

  await recordAudit({
    adminId: admin.id,
    action: input.id ? "category.update" : "category.create",
    targetType: "Category",
    targetId: record.id,
    metadata: { name: record.name },
  });
  revalidateLookups();
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const admin = await requireAdmin();
  const inUse = await prisma.listing.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return { error: `Can't delete — ${inUse} listing(s) use this category.` };
  }
  await prisma.category.delete({ where: { id } });
  await recordAudit({ adminId: admin.id, action: "category.delete", targetType: "Category", targetId: id });
  revalidateLookups();
  return { success: true };
}
