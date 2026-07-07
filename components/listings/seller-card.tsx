import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SellerCard({
  seller,
}: {
  seller: { username: string; fullName: string; avatarUrl: string | null; isVerified: boolean };
}) {
  return (
    <Link
      href={`/u/${seller.username}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
    >
      <Avatar className="size-12">
        <AvatarImage src={seller.avatarUrl ?? undefined} alt="" />
        <AvatarFallback>{initials(seller.fullName)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{seller.fullName}</p>
        {seller.isVerified ? (
          <VerifiedBadge />
        ) : (
          <p className="text-xs text-muted-foreground">@{seller.username}</p>
        )}
      </div>
    </Link>
  );
}
