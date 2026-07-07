import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridSkeleton } from "@/components/listings/listing-grid-skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="mt-12">
        <Skeleton className="mb-6 h-8 w-40" />
        <ListingGridSkeleton count={8} />
      </div>
    </div>
  );
}
