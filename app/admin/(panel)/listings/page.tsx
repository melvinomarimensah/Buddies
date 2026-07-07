import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminSelectFilter } from "@/components/admin/admin-status-filter";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = {
  title: "Listings — Buddies Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const where: Prisma.ListingWhereInput = {};
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };
  if (params.status) where.status = params.status as Prisma.ListingWhereInput["status"];
  if (params.type === "PRODUCT" || params.type === "SERVICE") where.type = params.type;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { seller: { select: { username: true } }, category: { select: { name: true } } },
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    currency: l.currency,
    status: l.status,
    type: l.type,
    sellerUsername: l.seller.username,
    categoryName: l.category.name,
  }));

  const buildHref = (nextPage: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) sp.set(key, value);
    sp.set("page", String(nextPage));
    return `/admin/listings?${sp.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader title="Listings" description={`${total} total`} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <AdminSearch placeholder="Search listings…" />
          <AdminSelectFilter
            param="status"
            ariaLabel="Filter by status"
            options={[
              { value: "", label: "All statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "PENDING", label: "Pending" },
              { value: "SOLD", label: "Sold" },
              { value: "REMOVED", label: "Removed" },
            ]}
          />
          <AdminSelectFilter
            param="type"
            ariaLabel="Filter by type"
            options={[
              { value: "", label: "All types" },
              { value: "PRODUCT", label: "Products" },
              { value: "SERVICE", label: "Services" },
            ]}
          />
        </div>
        <AdminListingsTable listings={rows} />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
