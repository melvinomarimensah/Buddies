"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LISTING_CONDITIONS } from "@/lib/constants";

export function ListingFilters({
  categories,
  myCampusName,
}: {
  categories: Category[];
  myCampusName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const type = searchParams.get("type") ?? "";
  const category = searchParams.get("category") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const campus = searchParams.get("campus") ?? (myCampusName ? "mine" : "all");
  const sort = searchParams.get("sort") ?? "newest";

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ q: query || null });
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search listings…"
            className="h-11 rounded-full pl-10"
            aria-label="Search listings"
          />
        </div>
        <Button type="submit" className="h-11 rounded-full px-5">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-full border border-border">
          {[
            ...(myCampusName ? [{ value: "mine", label: "My campus" }] : []),
            { value: "all", label: "All campuses" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParams({ campus: option.value })}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                campus === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground/80 hover:bg-secondary"
              )}
              aria-pressed={campus === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          value={type}
          onChange={(event) => updateParams({ type: event.target.value || null })}
          className="h-10 rounded-full border border-border bg-card px-4 text-sm"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="PRODUCT">Products</option>
          <option value="SERVICE">Services</option>
        </select>

        <select
          value={category}
          onChange={(event) => updateParams({ category: event.target.value || null })}
          className="h-10 rounded-full border border-border bg-card px-4 text-sm"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={condition}
          onChange={(event) => updateParams({ condition: event.target.value || null })}
          className="h-10 rounded-full border border-border bg-card px-4 text-sm"
          aria-label="Filter by condition"
        >
          <option value="">Any condition</option>
          {LISTING_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateParams({
              minPrice: (formData.get("minPrice") as string) || null,
              maxPrice: (formData.get("maxPrice") as string) || null,
            });
          }}
          className="flex items-center gap-2"
        >
          <Input
            type="number"
            name="minPrice"
            min={0}
            defaultValue={searchParams.get("minPrice") ?? ""}
            placeholder="Min $"
            className="h-10 w-24 rounded-full"
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            placeholder="Max $"
            className="h-10 w-24 rounded-full"
            aria-label="Maximum price"
          />
          <Button type="submit" variant="outline" size="sm" className="rounded-full">
            Go
          </Button>
        </form>

        <select
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="ml-auto h-10 rounded-full border border-border bg-card px-4 text-sm"
          aria-label="Sort listings"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
    </div>
  );
}
