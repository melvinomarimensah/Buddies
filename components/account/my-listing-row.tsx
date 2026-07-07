"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Pencil, CheckCircle2 } from "lucide-react";
import type { Listing } from "@prisma/client";
import { markListingSoldAction } from "@/lib/actions/listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<Listing["status"], string> = {
  ACTIVE: "Active",
  SOLD: "Sold",
  PENDING: "Pending",
  REMOVED: "Removed",
};

export function MyListingRow({ listing }: { listing: Listing }) {
  const [isPending, startTransition] = useTransition();

  function handleMarkSold() {
    startTransition(async () => {
      const result = await markListingSoldAction(listing.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Marked as sold.");
    });
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <Link
        href={`/listings/${listing.id}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {listing.images[0] ? (
          <Image src={listing.images[0]} alt="" fill sizes="64px" className="object-cover" />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/listings/${listing.id}`} className="truncate font-medium hover:underline">
            {listing.title}
          </Link>
          <Badge
            variant="secondary"
            className={listing.status === "SOLD" ? "bg-success text-success-foreground" : undefined}
          >
            {STATUS_LABEL[listing.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatPrice(listing.price, listing.currency)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {listing.status === "ACTIVE" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkSold}
            disabled={isPending}
            className="rounded-full"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Mark sold
          </Button>
        ) : null}
        {listing.status !== "REMOVED" ? (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/sell/${listing.id}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
