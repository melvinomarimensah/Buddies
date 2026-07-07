import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridSkeleton } from "@/components/listings/listing-grid-skeleton";

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="mb-6 space-y-4">
        <Skeleton className="h-11 w-full rounded-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <ListingGridSkeleton />
    </div>
  );
}
