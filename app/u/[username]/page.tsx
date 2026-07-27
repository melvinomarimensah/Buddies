import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, MapPin, PackageSearch } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingGrid } from "@/components/listings/listing-grid";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} — Buddies` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const profile = await prisma.user.findUnique({
    where: { username },
    include: { university: true },
  });

  if (!profile || profile.deactivatedAt) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listings, favorites] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: profile.id, status: "ACTIVE" },
      include: { university: true },
      orderBy: { createdAt: "desc" },
    }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { listingId: true } })
      : Promise.resolve([]),
  ]);

  const favoritedIds = new Set(favorites.map((f) => f.listingId));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <Avatar className="size-24">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="text-2xl">{initials(profile.fullName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl font-bold">{profile.fullName}</h1>
                {profile.isVerified ? <VerifiedBadge /> : null}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.bio ? <p className="max-w-md text-sm">{profile.bio}</p> : null}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                {profile.university ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {profile.university.name}
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Joined {format(profile.createdAt, "MMMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold">
              {listings.length > 0 ? `${profile.fullName.split(" ")[0]}'s listings` : "Listings"}
            </h2>
            <div className="mt-6">
              {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PackageSearch className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">Nothing listed yet</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Check back later — {profile.fullName.split(" ")[0]} hasn&apos;t posted any
                    active listings.
                  </p>
                </div>
              ) : (
                <ListingGrid listings={listings} favoritedIds={favoritedIds} />
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
