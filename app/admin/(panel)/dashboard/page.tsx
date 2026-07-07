import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Users, Package, CheckCircle2, MessageSquare, Flag, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard — Buddies Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeListings,
    soldListings,
    removedListings,
    recentConversations,
    openReports,
    topCategories,
    recentListings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.listing.count({ where: { status: "REMOVED" } }),
    prisma.conversation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 5,
    }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { seller: { select: { username: true } }, category: { select: { name: true } } },
    }),
  ]);

  const categoryIds = topCategories.map((c) => c.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const maxCategoryCount = topCategories[0]?._count.categoryId ?? 1;

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="A quick pulse on the Buddies marketplace." />
      <div className="space-y-8 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total users" value={totalUsers} icon={Users} />
          <StatCard label="Active listings" value={activeListings} icon={Package} />
          <StatCard label="Sold listings" value={soldListings} icon={CheckCircle2} />
          <StatCard label="Removed listings" value={removedListings} icon={Package} />
          <StatCard
            label="New conversations"
            value={recentConversations}
            icon={MessageSquare}
            hint="Last 7 days"
          />
          <StatCard label="Open reports" value={openReports} icon={Flag} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="font-semibold">Top categories</h2>
            </div>
            <div className="mt-4 space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No listings yet.</p>
              ) : (
                topCategories.map((row) => (
                  <div key={row.categoryId}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{categoryName.get(row.categoryId) ?? "Unknown"}</span>
                      <span className="text-muted-foreground">{row._count.categoryId}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row._count.categoryId / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Recent listings</h2>
            <ul className="mt-4 divide-y divide-border/60">
              {recentListings.map((listing) => (
                <li key={listing.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      @{listing.seller.username} · {listing.category.name} ·{" "}
                      {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    <Badge variant={listing.status === "ACTIVE" ? "secondary" : "outline"}>
                      {listing.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
