"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import type { ListingStatus } from "@prisma/client";
import {
  adminSetListingStatusAction,
  adminBulkRemoveListingsAction,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Row = {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: ListingStatus;
  type: string;
  sellerUsername: string;
  categoryName: string;
};

const STATUSES: ListingStatus[] = ["ACTIVE", "PENDING", "SOLD", "REMOVED"];

export function AdminListingsTable({ listings }: { listings: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === listings.length ? new Set() : new Set(listings.map((l) => l.id))
    );
  }

  function changeStatus(id: string, status: ListingStatus) {
    startTransition(async () => {
      const result = await adminSetListingStatusAction(id, status);
      if (result?.error) toast.error(result.error);
      else toast.success(`Listing set to ${status.toLowerCase()}.`);
    });
  }

  function bulkRemove() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await adminBulkRemoveListingsAction(ids);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(`Removed ${result.count} listing${result.count === 1 ? "" : "s"}.`);
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={bulkRemove}
            disabled={isPending}
          >
            Remove selected
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={selected.size === listings.length && listings.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No listings match.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(listing.id)}
                      onCheckedChange={() => toggle(listing.id)}
                      aria-label={`Select ${listing.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.type === "PRODUCT" ? "Product" : "Service"} · {listing.categoryName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">@{listing.sellerUsername}</td>
                  <td className="px-4 py-3">{formatPrice(listing.price, listing.currency)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={listing.status}
                      onChange={(event) =>
                        changeStatus(listing.id, event.target.value as ListingStatus)
                      }
                      disabled={isPending}
                      aria-label={`Status for ${listing.title}`}
                      className="h-8 rounded-full border border-border bg-card px-3 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="icon" className="size-8">
                      <Link href={`/listings/${listing.id}`} target="_blank" aria-label="View listing">
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
