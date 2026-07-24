import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingGrid } from "@/components/listings/listing-grid";
import { BrowseKindTabs } from "@/components/listings/browse-kind-tabs";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Browse listings — Buddies",
};

const PAGE_SIZE = 12;

type BrowseSearchParams = {
  q?: string;
  kind?: string;
  type?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  campus?: string;
  sort?: string;
  page?: string;
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, profile] = await Promise.all([
    getCategories(),
    user
      ? prisma.user.findUnique({ where: { id: user.id }, include: { university: true } })
      : Promise.resolve(null),
  ]);

  const isWanted = params.kind === "wanted";
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    kind: isWanted ? "WANTED" : "OFFER",
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.type === "PRODUCT" || params.type === "SERVICE") {
    where.type = params.type;
  }
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.condition) {
    where.condition = params.condition;
  }

  const priceFilter: Prisma.IntFilter = {};
  if (params.minPrice) {
    const value = Number.parseFloat(params.minPrice);
    if (!Number.isNaN(value)) priceFilter.gte = Math.round(value * 100);
  }
  if (params.maxPrice) {
    const value = Number.parseFloat(params.maxPrice);
    if (!Number.isNaN(value)) priceFilter.lte = Math.round(value * 100);
  }
  if (Object.keys(priceFilter).length > 0) {
    where.price = priceFilter;
  }

  if (params.campus === "mine" && profile?.universityId) {
    where.universityId = profile.universityId;
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { price: "asc" }
      : params.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [listings, total, favorites] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { university: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { listingId: true } })
      : Promise.resolve([]),
  ]);

  const favoritedIds = new Set(favorites.map((f) => f.listingId));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (nextPage: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    sp.set("page", String(nextPage));
    return `/browse?${sp.toString()}`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">
                {isWanted ? "What students want" : "Browse listings"}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {isWanted
                  ? `${total} open ${total === 1 ? "request" : "requests"} `
                  : `${total} ${total === 1 ? "listing" : "listings"} `}
                {params.campus === "mine" ? "on your campus" : "across all campuses"}
              </p>
            </div>
            {isWanted ? (
              <Button asChild className="rounded-full">
                <Link href="/wanted/new">
                  <PlusCircle className="size-4" aria-hidden="true" />
                  Post a request
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="mb-5">
            <BrowseKindTabs />
          </div>
          <ListingFilters categories={categories} myCampusName={profile?.university?.name ?? null} />
          <div className="mt-6">
            <ListingGrid listings={listings} favoritedIds={favoritedIds} wanted={isWanted} />
          </div>
          <div className="mt-10">
            <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
