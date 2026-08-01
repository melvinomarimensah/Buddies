import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { MobileNav } from "@/components/mobile-nav";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, unreadCount] = user
    ? await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: { fullName: true, username: true, avatarUrl: true },
        }),
        prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      ])
    : [null, 0];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            Buddies
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/browse" className="text-foreground/80 transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link
            href="/how-it-works"
            className="text-foreground/80 transition-colors hover:text-foreground"
          >
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <NotificationBell count={unreadCount} />
              <UserMenu
                fullName={profile.fullName}
                username={profile.username}
                avatarUrl={profile.avatarUrl}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
