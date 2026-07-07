import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary";

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>Previous</span>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>Next</span>
      )}
    </nav>
  );
}
