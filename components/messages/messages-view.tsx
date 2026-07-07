"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, CheckCheck, Send, ShieldCheck, Handshake, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  getConversationMessagesAction,
  markConversationReadAction,
  markMetAction,
  sendMessageAction,
} from "@/lib/actions/messages";
import type { ChatMessage, ConversationSummary } from "@/lib/messages-types";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

export function MessagesView({
  currentUserId,
  conversations: initialConversations,
  initialActiveId,
  initialMessages,
}: {
  currentUserId: string;
  conversations: ConversationSummary[];
  initialActiveId: string | null;
  initialMessages: ChatMessage[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherHasRead, setOtherHasRead] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  const markRead = useCallback(
    async (conversationId: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
      await markConversationReadAction(conversationId);
      channelRef.current?.send({
        type: "broadcast",
        event: "read",
        payload: { userId: currentUserId },
      });
    },
    [currentUserId]
  );

  // Subscribe to the active conversation's realtime channel.
  useEffect(() => {
    if (!activeId) return;
    const supabase = createClient();
    const channel = supabase.channel(`conversation:${activeId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        if (msg.senderId === currentUserId) return;
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
        setOtherTyping(false);
        scrollToBottom();
        void markRead(activeId);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if ((payload as { userId: string }).userId === currentUserId) return;
        setOtherTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setOtherTyping(false), 3000);
      })
      .on("broadcast", { event: "read" }, ({ payload }) => {
        if ((payload as { userId: string }).userId === currentUserId) return;
        setOtherHasRead(true);
      })
      .on("broadcast", { event: "met" }, () => {
        toast.info("Your buddy confirmed the meetup.");
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [activeId, currentUserId, scrollToBottom, markRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark the initially-open conversation as read on mount.
  useEffect(() => {
    if (initialActiveId) void markRead(initialActiveId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openConversation(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setMessages([]);
    setOtherTyping(false);
    setOtherHasRead(false);
    window.history.replaceState(null, "", `/messages?c=${id}`);
    const result = await getConversationMessagesAction(id);
    if (result.messages) {
      setMessages(result.messages);
      scrollToBottom();
      void markRead(id);
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    const now = Date.now();
    if (now - lastTypingSent.current > 1500) {
      lastTypingSent.current = now;
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId },
      });
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || isSending) return;

    setIsSending(true);
    setDraft("");
    const result = await sendMessageAction({ conversationId: activeId, body });
    setIsSending(false);

    if (result.error || !result.message) {
      toast.error(result.error ?? "Couldn't send that message.");
      setDraft(body);
      return;
    }

    const msg = result.message as ChatMessage;
    setMessages((prev) => [...prev, msg]);
    setOtherHasRead(false);
    setConversations((prev) =>
      prev
        .map((c) =>
          c.id === activeId
            ? {
                ...c,
                lastMessage: { body: msg.body, createdAt: msg.createdAt, senderId: msg.senderId },
                lastMessageAt: msg.createdAt,
              }
            : c
        )
        .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
    );
    scrollToBottom();
    channelRef.current?.send({ type: "broadcast", event: "message", payload: msg });
  }

  async function handleMarkMet() {
    if (!active) return;
    const result = await markMetAction(active.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, buyerCompleted: result.buyerCompleted!, sellerCompleted: result.sellerCompleted! }
          : c
      )
    );
    channelRef.current?.send({ type: "broadcast", event: "met", payload: { userId: currentUserId } });
    toast.success(result.listingSold ? "Marked as sold — nice trade!" : "Thanks! Waiting on your buddy to confirm.");
  }

  const myCompleted = active
    ? active.role === "buyer"
      ? active.buyerCompleted
      : active.sellerCompleted
    : false;
  const bothCompleted = active ? active.buyerCompleted && active.sellerCompleted : false;

  const lastMineIndex = messages.reduce(
    (acc, m, i) => (m.senderId === currentUserId ? i : acc),
    -1
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden">
      {/* Conversation list */}
      <aside
        className={cn(
          "w-full shrink-0 overflow-y-auto border-r border-border md:w-80",
          activeId && "hidden md:block"
        )}
      >
        <div className="border-b border-border px-4 py-4">
          <h1 className="font-display text-xl font-bold">Messages</h1>
        </div>
        {conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="When you message a seller or someone messages you, your chats show up here."
            />
          </div>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() => openConversation(conv.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/40",
                    conv.id === activeId && "bg-secondary/60"
                  )}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {conv.listing.image ? (
                      <Image src={conv.listing.image} alt="" fill sizes="48px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{conv.listing.title}</p>
                      {conv.unreadCount > 0 ? (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.otherParty.fullName} ·{" "}
                      {conv.lastMessage ? conv.lastMessage.body : "Say hello 👋"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Active chat */}
      <section className={cn("flex flex-1 flex-col", !activeId && "hidden md:flex")}>
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  setActiveId(null);
                  window.history.replaceState(null, "", "/messages");
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Button>
              <Link
                href={`/listings/${active.listing.id}`}
                className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                {active.listing.image ? (
                  <Image src={active.listing.image} alt="" fill sizes="44px" className="object-cover" />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${active.listing.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {active.listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(active.listing.price, active.listing.currency)} ·{" "}
                  <Link href={`/u/${active.otherParty.username}`} className="hover:underline">
                    {active.otherParty.fullName}
                  </Link>
                </p>
              </div>
              {bothCompleted ? (
                <Badge className="bg-success text-success-foreground">Completed</Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={handleMarkMet}
                  disabled={myCompleted}
                >
                  <Handshake className="size-4" aria-hidden="true" />
                  {myCompleted ? "Waiting…" : "Mark as met"}
                </Button>
              )}
            </header>

            <div className="flex items-center gap-2 bg-accent px-4 py-2 text-xs text-accent-foreground">
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              <p>
                Buddies doesn&apos;t handle payments. Meet in a public spot on campus and pay on
                delivery.
              </p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => {
                const mine = message.senderId === currentUserId;
                const showRead = mine && index === lastMineIndex && (otherHasRead || Boolean(message.readAt));
                return (
                  <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className="max-w-[75%] space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm",
                          mine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-secondary text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      </div>
                      <p
                        className={cn(
                          "flex items-center gap-1 px-1 text-[11px] text-muted-foreground",
                          mine ? "justify-end" : "justify-start"
                        )}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        {showRead ? (
                          <span className="flex items-center gap-0.5 text-primary">
                            <CheckCheck className="size-3" aria-hidden="true" />
                            Read
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                );
              })}
              {otherTyping ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-2 text-sm text-muted-foreground">
                    typing…
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
              <Input
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                placeholder="Type a message…"
                className="h-11 rounded-full"
                aria-label="Message"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className="size-11 shrink-0 rounded-full"
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center p-8 md:flex">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="size-7" aria-hidden="true" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold">Your conversations</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a chat on the left to start talking.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
