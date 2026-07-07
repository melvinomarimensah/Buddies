import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-primary",
        className
      )}
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      Verified student
    </span>
  );
}
