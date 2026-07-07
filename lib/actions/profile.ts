"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";

export async function updateProfileAction(input: UpdateProfileInput) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your profile details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const existingUsername = await prisma.user.findFirst({
    where: { username: parsed.data.username, NOT: { id: user.id } },
  });

  if (existingUsername) {
    return { error: "That username is already taken." };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.data.fullName,
      username: parsed.data.username,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/account");
  revalidatePath(`/u/${updated.username}`);

  return { success: true, username: updated.username };
}
