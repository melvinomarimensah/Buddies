import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell({ count }: { count: number }) {
  const hasUnread = count > 0;
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      aria-label={hasUnread ? `Notifications (${count} unread)` : "Notifications"}
    >
      <Link href="/notifications">
        <Bell className="size-5" aria-hidden="true" />
        {hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
