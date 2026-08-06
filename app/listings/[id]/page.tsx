import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Hand, MapPin, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingImageCarousel } from "@/components/listings/image-carousel";
import { SellerCard } from "@/components/listings/seller-card";
import { ListingGrid } from "@/components/listings/listing-grid";
import { MessageSellerButton } from "@/components/listings/message-seller-button";
import { DeleteListingButton } from "@/components/listings/delete-listing-button";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ReportButton } from "@/components/shared/report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { title: true } });
  return { title: listing ? `${listing.title} — Buddies` : "Listing — Buddies" };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { seller: true, category: true, university: true },
  });

  if (
    !listing ||
    listing.status === "REMOVED" ||
    listing.seller.deactivatedAt ||
    listing.seller.listingsHidden ||
    listing.seller.isSuspended
  ) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === listing.sellerId;
  const isWanted = listing.kind === "WANTED";

  const [favorite, similarListings, matchingRequestCount] = await Promise.all([
    user
      ? prisma.favorite.findUnique({
          where: { userId_listingId: { userId: user.id, listingId: listing.id } },
        })
      : Promise.resolve(null),
    prisma.listing.findMany({
      where: {
        categoryId: listing.categoryId,
        kind: listing.kind,
        status: "ACTIVE",
        id: { not: listing.id },
        seller: { deactivatedAt: null, listingsHidden: false, isSuspended: false },
      },
      include: { university: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    // For an item on sale, how many students on this campus are asking for this category?
    isWanted
      ? Promise.resolve(0)
      : prisma.listing.count({
          where: {
            kind: "WANTED",
            status: "ACTIVE",
            categoryId: listing.categoryId,
            universityId: listing.universityId,
            seller: { deactivatedAt: null, listingsHidden: false, isSuspended: false },
          },
        }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href={isWanted ? "/browse?kind=wanted" : "/browse"}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to browse
          </Link>

          <div className="mt-4 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {isWanted ? (
                <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-coral-soft text-coral-soft-foreground">
                  <Hand className="size-16" aria-hidden="true" />
                  <p className="font-display text-xl font-semibold">Looking for this</p>
                  <p className="text-sm">A student on your campus is hoping to find it.</p>
                </div>
              ) : (
                <ListingImageCarousel images={listing.images} title={listing.title} />
              )}
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">{listing.title}</h1>
                  {!isOwner ? (
                    <FavoriteButton
                      listingId={listing.id}
                      initialFavorited={Boolean(favorite)}
                      className="shrink-0"
                    />
                  ) : null}
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-primary">
                  {isWanted
                    ? listing.price > 0
                      ? `Budget ${formatPrice(listing.price, listing.currency)}`
                      : "Open budget"
                    : formatPrice(listing.price, listing.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isWanted ? (
                    <Badge className="bg-coral text-coral-foreground">Wanted</Badge>
                  ) : null}
                  <Badge variant="secondary">
                    {listing.type === "PRODUCT" ? "Product" : "Service"}
                  </Badge>
                  <Badge variant="outline">{listing.category.name}</Badge>
                  {listing.condition ? <Badge variant="outline">{listing.condition}</Badge> : null}
                  {listing.availability ? (
                    <Badge variant="outline">{listing.availability}</Badge>
                  ) : null}
                  {listing.status === "SOLD" ? (
                    <Badge className="bg-success text-success-foreground">
                      {isWanted ? "Fulfilled" : "Sold"}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {isOwner ? (
                isWanted ? (
                  <DeleteListingButton listingId={listing.id} />
                ) : (
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href={`/sell/${listing.id}/edit`}>
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit your listing
                    </Link>
                  </Button>
                )
              ) : listing.status === "SOLD" ? (
                <Button disabled className="w-full rounded-full">
                  {isWanted ? "This request is closed" : "This listing is sold"}
                </Button>
              ) : (
                <MessageSellerButton
                  listingId={listing.id}
                  isAuthenticated={Boolean(user)}
                  label={isWanted ? "I have this — message" : "Message seller"}
                />
              )}

              {!isWanted && matchingRequestCount > 0 ? (
                <Link
                  href={`/browse?kind=wanted&category=${listing.category.slug}&campus=${listing.universityId}`}
                  className="flex items-center gap-3 rounded-2xl border border-coral/40 bg-coral-soft px-4 py-3 text-sm text-coral-soft-foreground transition-colors hover:bg-coral-soft/70"
                >
                  <Hand className="size-5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">
                      {matchingRequestCount} student{matchingRequestCount === 1 ? "" : "s"}
                    </span>{" "}
                    at {listing.university.name} {matchingRequestCount === 1 ? "is" : "are"} looking
                    for {listing.category.name} — see their requests →
                  </span>
                </Link>
              ) : null}

              <SellerCard seller={listing.seller} />

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  {listing.university.name}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Posted {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
                </p>
              </div>

              <div>
                <h2 className="font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {listing.description}
                </p>
              </div>

              {!isOwner ? (
                <ReportButton listingId={listing.id} isAuthenticated={Boolean(user)} />
              ) : null}
            </div>
          </div>

          {similarListings.length > 0 ? (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold">
                {isWanted ? "Similar requests" : "Similar listings"}
              </h2>
              <div className="mt-6">
                <ListingGrid
                  listings={similarListings}
                  favoritedIds={new Set()}
                  wanted={isWanted}
                />
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
