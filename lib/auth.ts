import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@prisma/client";

/** Returns the signed-in user's Prisma profile, or null if not signed in. */
export async function getCurrentProfile(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { id: user.id } });
}

/** Returns the profile only if the user is an ADMIN, otherwise null. */
export async function getAdminProfile(): Promise<User | null> {
  const profile = await getCurrentProfile();
  return profile?.role === "ADMIN" ? profile : null;
}

/** Guard for admin server actions. Throws if the caller is not an admin. */
export async function requireAdmin(): Promise<User> {
  const profile = await getAdminProfile();
  if (!profile) {
    throw new Error("Not authorized.");
  }
  return profile;
}
