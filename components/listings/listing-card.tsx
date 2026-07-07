import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Listing, University } from "@prisma/client";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export type ListingCardData = Listing & { university: University };

export function ListingCard({
  listing,
  isFavorited,
  showFavorite = true,
}: {
  listing: ListingCardData;
  isFavorited: boolean;
  showFavorite?: boolean;
}) {
  const image = listing.images[0];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-10"
        aria-label={listing.title}
      />
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo yet
          </div>
        )}
        {listing.status === "SOLD" ? (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white">
            Sold
          </span>
        ) : null}
        {showFavorite ? (
          <div className="absolute right-3 top-3 z-20">
            <FavoriteButton
              listingId={listing.id}
              initialFavorited={isFavorited}
              className="bg-card/90 backdrop-blur-sm"
            />
          </div>
        ) : null}
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-lg font-bold">
            {formatPrice(listing.price, listing.currency)}
          </p>
          <Badge variant="secondary" className="shrink-0">
            {listing.type === "PRODUCT" ? "Product" : "Service"}
          </Badge>
        </div>
        <h3 className="line-clamp-1 font-medium">{listing.title}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden="true" />
          {listing.university.name}
        </p>
      </div>
    </div>
  );
}
