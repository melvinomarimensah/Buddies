"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Self-service soft deactivation. The account's data is kept, but the profile
 * and listings are hidden and the user can't sign back in until an admin
 * restores it.
 */
export async function deactivateAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { deactivatedAt: new Date() },
  });

  await supabase.auth.signOut();

  revalidatePath("/browse");
  redirect("/?deactivated=1");
}
