import { PackageSearch } from "lucide-react";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/shared/empty-state";

export function ListingGrid({
  listings,
  favoritedIds,
}: {
  listings: ListingCardData[];
  favoritedIds: Set<string>;
}) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No listings match yet"
        description="Try widening your search, clearing a filter, or checking back soon — new listings go up every day."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorited={favoritedIds.has(listing.id)}
        />
      ))}
    </div>
  );
}
