"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Pencil, CheckCircle2, Hand, Trash2 } from "lucide-react";
import type { Listing } from "@prisma/client";
import { markListingSoldAction, deleteListingAction } from "@/lib/actions/listings";
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
  const isWanted = listing.kind === "WANTED";

  function handleMarkSold() {
    startTransition(async () => {
      const result = await markListingSoldAction(listing.id);
      if (result?.error) toast.error(result.error);
      else toast.success(isWanted ? "Marked as fulfilled." : "Marked as sold.");
    });
  }

  function handleRemove() {
    if (!confirm("Take down this request?")) return;
    startTransition(async () => {
      const result = await deleteListingAction(listing.id);
      if (result?.error) toast.error(result.error);
    });
  }

  const statusLabel =
    isWanted && listing.status === "SOLD" ? "Fulfilled" : STATUS_LABEL[listing.status];
  const priceLabel = isWanted
    ? listing.price > 0
      ? `Budget ${formatPrice(listing.price, listing.currency)}`
      : "Open budget"
    : formatPrice(listing.price, listing.currency);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <Link
        href={`/listings/${listing.id}`}
        className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted"
      >
        {isWanted ? (
          <span className="flex size-full items-center justify-center bg-coral-soft text-coral-soft-foreground">
            <Hand className="size-6" aria-hidden="true" />
          </span>
        ) : listing.images[0] ? (
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
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{priceLabel}</p>
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
            {isWanted ? "Fulfilled" : "Mark sold"}
          </Button>
        ) : null}
        {isWanted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isPending}
            className="rounded-full text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </Button>
        ) : listing.status !== "REMOVED" ? (
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
