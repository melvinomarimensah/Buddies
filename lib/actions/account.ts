"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Permanent, irreversible account deletion (GDPR/CCPA right-to-erasure). Purges
 * all of the user's data and their Supabase Auth identity. Admin accounts are
 * blocked here (they hold audit-log references) — those go through support.
 */
export async function deleteAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile) {
    return { error: "Account not found." };
  }
  if (profile.role === "ADMIN") {
    return { error: "Admin accounts can't be self-deleted. Contact support." };
  }

  const userId = user.id;

  // Permanently remove every row tied to the user. The schema has no
  // ON DELETE CASCADE, so we delete children before parents, inside one
  // transaction, to satisfy foreign keys.
  await prisma.$transaction(
    async (tx) => {
      // Conversations the user is part of (buyer or seller). Because the seller
      // of a conversation is always the listing owner, this already covers every
      // conversation on the user's own listings.
      const convos = await tx.conversation.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        select: { id: true },
      });
      const convoIds = convos.map((c) => c.id);

      const listings = await tx.listing.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });
      const listingIds = listings.map((l) => l.id);

      // 1. Messages: everything in those conversations (incl. the other party's)
      //    plus anything the user sent.
      await tx.message.deleteMany({
        where: { OR: [{ conversationId: { in: convoIds } }, { senderId: userId }] },
      });
      // 2. Conversations involving the user.
      await tx.conversation.deleteMany({ where: { id: { in: convoIds } } });
      // 3. Favorites: the user's own + others' favorites of the user's listings.
      await tx.favorite.deleteMany({
        where: { OR: [{ userId }, { listingId: { in: listingIds } }] },
      });
      // 4. Reports: filed by the user + reports against the user's listings.
      await tx.report.deleteMany({
        where: { OR: [{ reporterId: userId }, { listingId: { in: listingIds } }] },
      });
      // 5. The user's listings.
      await tx.listing.deleteMany({ where: { sellerId: userId } });
      // 6. The user profile row itself.
      await tx.user.delete({ where: { id: userId } });
    },
    { timeout: 15000 }
  );

  // Remove the Supabase Auth identity so the login can't linger as a ghost.
  // The DB rows are already gone, so don't block deletion if this fails.
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // Stale auth row is low-harm and an admin can clean it up later.
  }

  await supabase.auth.signOut();
  revalidatePath("/browse");
  redirect("/?deleted=1");
}
