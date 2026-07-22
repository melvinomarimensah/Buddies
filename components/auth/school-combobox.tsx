"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, GraduationCap, Search } from "lucide-react";
import type { University } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldError } from "@/components/auth/field-error";
import { cn } from "@/lib/utils";

export function SchoolCombobox({
  universities,
  error,
}: {
  universities: University[];
  error?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = universities.find((u) => u.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
    );
  }, [universities, query]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="school-trigger">School</Label>

      {/* Value submitted with the form */}
      <input type="hidden" name="universityId" value={selectedId} />

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setTimeout(() => searchRef.current?.focus(), 0);
          else setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            id="school-trigger"
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls="school-listbox"
            className={cn(
              "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              !selected && "text-muted-foreground"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <GraduationCap className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{selected ? selected.name : "Search for your school"}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type your school name…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search schools"
            />
          </div>
          <ul id="school-listbox" role="listbox" className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No schools match &ldquo;{query}&rdquo;.
              </li>
            ) : (
              filtered.map((university) => (
                <li key={university.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(university.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{university.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {university.city}, {university.country}
                      </span>
                    </span>
                    {selectedId === university.id ? (
                      <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {/* No-JS fallback: a plain native dropdown still lets users pick a school. */}
      <noscript>
        <select
          name="universityId"
          required
          defaultValue=""
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="" disabled>
            Select your school
          </option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.name}
            </option>
          ))}
        </select>
      </noscript>

      <FieldError messages={error} />
    </div>
  );
}
