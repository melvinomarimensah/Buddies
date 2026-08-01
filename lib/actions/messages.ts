"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { notifyNewMessage } from "@/lib/notifications";
import { sendMessageSchema } from "@/lib/validations/message";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function isSuspended(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuspended: true },
  });
  return Boolean(profile?.isSuspended);
}

export async function startConversationAction(listingId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Sign in to message a seller." };
  if (await isSuspended(userId)) return { error: "Your account is suspended." };
  if (
    !(await rateLimit(
      `convo:${userId}`,
      RATE_LIMITS.startConversation.limit,
      RATE_LIMITS.startConversation.windowSeconds
    ))
  ) {
    return { error: "You're reaching out to a lot of people quickly. Please try again later." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status === "REMOVED") {
    return { error: "This listing is no longer available." };
  }
  if (listing.sellerId === userId) {
    return { error: "This is your own listing." };
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
    },
    update: {},
    create: {
      listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
    },
  });

  return { conversationId: conversation.id };
}

export async function sendMessageAction(input: { conversationId: string; body: string }) {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Type a message." };
  }

  const userId = await getUserId();
  if (!userId) return { error: "Sign in to send messages." };
  if (await isSuspended(userId)) return { error: "Your account is suspended." };
  if (
    !(await rateLimit(
      `message:${userId}`,
      RATE_LIMITS.sendMessage.limit,
      RATE_LIMITS.sendMessage.windowSeconds
    ))
  ) {
    return { error: "You're sending messages too fast. Take a breather and try again." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
  });
  if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
    return { error: "You're not part of this conversation." };
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      body: parsed.data.body,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: message.createdAt },
  });

  const recipientId =
    conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });
  await notifyNewMessage({
    recipientId,
    senderName: sender?.fullName ?? "Someone",
    conversationId: conversation.id,
    preview: parsed.data.body,
  });

  revalidatePath("/messages");

  return {
    message: {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
  };
}

export async function getConversationMessagesAction(conversationId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Sign in first." };

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
    return { error: "You're not part of this conversation." };
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return {
    messages: messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function markConversationReadAction(conversationId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Sign in first." };

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
    return { error: "You're not part of this conversation." };
  }

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
  await prisma.notification.updateMany({
    where: { userId, type: "MESSAGE", conversationId, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/messages");
  return { success: true };
}

export async function markMetAction(conversationId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Sign in first." };

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
    return { error: "You're not part of this conversation." };
  }

  const isBuyer = conversation.buyerId === userId;
  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: isBuyer ? { buyerCompleted: true } : { sellerCompleted: true },
  });

  let listingSold = false;
  if (updated.buyerCompleted && updated.sellerCompleted) {
    await prisma.listing.update({
      where: { id: updated.listingId },
      data: { status: "SOLD" },
    });
    listingSold = true;
    revalidatePath(`/listings/${updated.listingId}`);
  }

  revalidatePath("/messages");

  return {
    buyerCompleted: updated.buyerCompleted,
    sellerCompleted: updated.sellerCompleted,
    listingSold,
  };
}
