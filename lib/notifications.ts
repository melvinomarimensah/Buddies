import { prisma } from "@/lib/db";

/**
 * Notify the recipient of a new chat message. Collapses to a single unread
 * notification per conversation so an active back-and-forth doesn't flood the
 * bell. Best-effort: never throws into the caller.
 */
export async function notifyNewMessage(params: {
  recipientId: string;
  senderName: string;
  conversationId: string;
  preview: string;
}) {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: params.recipientId,
        type: "MESSAGE",
        conversationId: params.conversationId,
        readAt: null,
      },
    });
    await prisma.notification.create({
      data: {
        userId: params.recipientId,
        type: "MESSAGE",
        title: `New message from ${params.senderName}`,
        body: params.preview.trim().slice(0, 140),
        linkUrl: `/messages?c=${params.conversationId}`,
        conversationId: params.conversationId,
      },
    });
  } catch {
    // A failed notification must never break sending the message.
  }
}

/**
 * When a new for-sale listing is posted, notify students on the same campus who
 * have an open Wanted request in the same category. One notification per
 * requester. Best-effort.
 */
export async function notifyRequestMatches(params: {
  listingId: string;
  listingTitle: string;
  categoryId: string;
  universityId: string;
  sellerId: string;
}) {
  try {
    const [category, requesters] = await Promise.all([
      prisma.category.findUnique({ where: { id: params.categoryId }, select: { name: true } }),
      prisma.listing.findMany({
        where: {
          kind: "WANTED",
          status: "ACTIVE",
          categoryId: params.categoryId,
          universityId: params.universityId,
          sellerId: { not: params.sellerId },
          seller: { deactivatedAt: null, isSuspended: false },
        },
        select: { sellerId: true },
        distinct: ["sellerId"],
      }),
    ]);

    if (requesters.length === 0) return;
    const categoryName = category?.name ?? "item";

    await prisma.notification.createMany({
      data: requesters.map((r) => ({
        userId: r.sellerId,
        type: "REQUEST_MATCH" as const,
        title: `New ${categoryName} listing on your campus`,
        body: `"${params.listingTitle}" matches something you're looking for.`,
        linkUrl: `/listings/${params.listingId}`,
        listingId: params.listingId,
      })),
    });
  } catch {
    // Best-effort; never block listing creation.
  }
}
