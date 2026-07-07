"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Flag,
  Settings,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { adminSignOutAction } from "@/lib/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-border bg-card p-3 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold">Buddies Admin</p>
          <p className="truncate text-xs text-muted-foreground">{adminName}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-secondary"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden flex-col gap-1 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
          View site
        </Link>
        <form action={adminSignOutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start px-3">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
