import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { MessagesView } from "@/components/messages/messages-view";
import type { ChatMessage, ConversationSummary } from "@/lib/messages-types";

export const metadata: Metadata = {
  title: "Messages — Buddies",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c: activeId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/messages");
  }

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, images: true, price: true, currency: true, status: true } },
      buyer: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      seller: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderId: { not: user.id }, readAt: null } },
        },
      },
    },
  });

  const summaries: ConversationSummary[] = conversations.map((conv) => {
    const isBuyer = conv.buyerId === user.id;
    const other = isBuyer ? conv.seller : conv.buyer;
    const last = conv.messages[0];
    return {
      id: conv.id,
      listing: {
        id: conv.listing.id,
        title: conv.listing.title,
        image: conv.listing.images[0] ?? null,
        price: conv.listing.price,
        currency: conv.listing.currency,
        status: conv.listing.status,
      },
      otherParty: {
        username: other.username,
        fullName: other.fullName,
        avatarUrl: other.avatarUrl,
      },
      role: isBuyer ? "buyer" : "seller",
      buyerCompleted: conv.buyerCompleted,
      sellerCompleted: conv.sellerCompleted,
      lastMessage: last
        ? { body: last.body, createdAt: last.createdAt.toISOString(), senderId: last.senderId }
        : null,
      unreadCount: conv._count.messages,
      lastMessageAt: conv.lastMessageAt.toISOString(),
    };
  });

  let initialMessages: ChatMessage[] = [];
  const active = activeId
    ? summaries.find((s) => s.id === activeId)
    : summaries[0];

  if (active) {
    const messages = await prisma.message.findMany({
      where: { conversationId: active.id },
      orderBy: { createdAt: "asc" },
    });
    initialMessages = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <MessagesView
        currentUserId={user.id}
        conversations={summaries}
        initialActiveId={active?.id ?? null}
        initialMessages={initialMessages}
      />
    </div>
  );
}
