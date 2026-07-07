"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save listings." };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, listingId } });
  }

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/account");

  return { favorited: !existing };
}
