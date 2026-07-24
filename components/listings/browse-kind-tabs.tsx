"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "offer", label: "For sale", icon: ShoppingBag },
  { value: "wanted", label: "Wanted", icon: Hand },
] as const;

export function BrowseKindTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("kind") === "wanted" ? "wanted" : "offer";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "offer") params.delete("kind");
    else params.set("kind", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      {TABS.map((tab) => {
        const active = current === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => select(tab.value)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
