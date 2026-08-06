"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type School = { id: string; name: string; city: string };

export function SchoolsList({ schools }: { schools: School[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? schools.filter(
        (s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
      )
    : schools;

  return (
    <div>
      <div className="relative mx-auto max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search schools…"
          className="h-11 rounded-full pl-11"
          aria-label="Search schools"
        />
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "school" : "schools"}
        {q ? ` matching “${query.trim()}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No schools match “{query.trim()}”. Don&apos;t see yours? It may still be coming.
        </p>
      ) : (
        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => (
            <li key={school.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">{school.name}</p>
              <p className="text-xs text-muted-foreground">{school.city}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
