import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, MapPin, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingImageCarousel } from "@/components/listings/image-carousel";
import { SellerCard } from "@/components/listings/seller-card";
import { ListingGrid } from "@/components/listings/listing-grid";
import { MessageSellerButton } from "@/components/listings/message-seller-button";
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

  if (!listing || listing.status === "REMOVED") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === listing.sellerId;

  const [favorite, similarListings] = await Promise.all([
    user
      ? prisma.favorite.findUnique({
          where: { userId_listingId: { userId: user.id, listingId: listing.id } },
        })
      : Promise.resolve(null),
    prisma.listing.findMany({
      where: {
        categoryId: listing.categoryId,
        status: "ACTIVE",
        id: { not: listing.id },
      },
      include: { university: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to browse
          </Link>

          <div className="mt-4 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ListingImageCarousel images={listing.images} title={listing.title} />
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
                  {formatPrice(listing.price, listing.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {listing.type === "PRODUCT" ? "Product" : "Service"}
                  </Badge>
                  <Badge variant="outline">{listing.category.name}</Badge>
                  {listing.condition ? <Badge variant="outline">{listing.condition}</Badge> : null}
                  {listing.availability ? (
                    <Badge variant="outline">{listing.availability}</Badge>
                  ) : null}
                  {listing.status === "SOLD" ? (
                    <Badge className="bg-success text-success-foreground">Sold</Badge>
                  ) : null}
                </div>
              </div>

              {isOwner ? (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={`/sell/${listing.id}/edit`}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit your listing
                  </Link>
                </Button>
              ) : listing.status === "SOLD" ? (
                <Button disabled className="w-full rounded-full">
                  This listing is sold
                </Button>
              ) : (
                <MessageSellerButton listingId={listing.id} isAuthenticated={Boolean(user)} />
              )}

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
              <h2 className="font-display text-2xl font-bold">Similar listings</h2>
              <div className="mt-6">
                <ListingGrid listings={similarListings} favoritedIds={new Set()} />
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
