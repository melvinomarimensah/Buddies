import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminSelectFilter } from "@/components/admin/admin-status-filter";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = {
  title: "Users — Buddies Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const where: Prisma.UserWhereInput = {};
  if (params.q) {
    where.OR = [
      { fullName: { contains: params.q, mode: "insensitive" } },
      { username: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.filter === "admin") where.role = "ADMIN";
  else if (params.filter === "verified") where.isVerified = true;
  else if (params.filter === "suspended") where.isSuspended = true;
  else if (params.filter === "listings_hidden") where.listingsHidden = true;
  else if (params.filter === "deactivated") where.deactivatedAt = { not: null };

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        university: { select: { name: true } },
        _count: { select: { listings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    isSuspended: u.isSuspended,
    listingsHidden: u.listingsHidden,
    isDeactivated: u.deactivatedAt !== null,
    universityName: u.university?.name ?? null,
    listingCount: u._count.listings,
  }));

  const buildHref = (nextPage: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) sp.set(key, value);
    sp.set("page", String(nextPage));
    return `/admin/users?${sp.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader title="Users" description={`${total} total`} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <AdminSearch placeholder="Search name, username, email…" />
          <AdminSelectFilter
            param="filter"
            ariaLabel="Filter users"
            options={[
              { value: "", label: "All users" },
              { value: "admin", label: "Admins" },
              { value: "verified", label: "Verified" },
              { value: "suspended", label: "Suspended" },
              { value: "listings_hidden", label: "Listings hidden" },
              { value: "deactivated", label: "Deactivated" },
            ]}
          />
        </div>
        <AdminUsersTable users={rows} currentAdminId={admin.id} />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
