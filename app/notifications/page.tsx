import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageCircle, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkNotificationsRead } from "@/components/notifications/mark-notifications-read";

export const metadata: Metadata = {
  title: "Notifications — Buddies",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/notifications");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const hasUnread = notifications.some((n) => n.readAt === null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MarkNotificationsRead hasUnread={hasUnread} />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            New messages and requests that match your posts show up here.
          </p>

          <div className="mt-8 space-y-2">
            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="When someone messages you or posts something you're looking for, you'll see it here."
              />
            ) : (
              notifications.map((n) => {
                const Icon = n.type === "MESSAGE" ? MessageCircle : Sparkles;
                const unread = n.readAt === null;
                return (
                  <Link
                    key={n.id}
                    href={n.linkUrl}
                    className={cn(
                      "flex gap-3 rounded-2xl border p-4 transition-colors hover:bg-secondary/40",
                      unread ? "border-primary/30 bg-primary/5" : "border-border"
                    )}
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{n.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    {unread ? (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
