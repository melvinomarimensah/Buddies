"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initialFavorited,
  className,
}: {
  listingId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);
      if (result?.error) {
        setFavorited(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from saved listings" : "Save this listing"}
      className={cn("rounded-full", className)}
    >
      <Heart
        className={cn("size-4", favorited && "fill-coral text-coral")}
        aria-hidden="true"
      />
    </Button>
  );
}
