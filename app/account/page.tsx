import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Heart, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProfileForm } from "@/components/account/profile-form";
import { MyListingRow } from "@/components/account/my-listing-row";
import { ListingGrid } from "@/components/listings/listing-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My account — Buddies",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/account");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { university: true },
  });

  if (!profile) {
    redirect("/auth/sign-in");
  }

  const [listings, favorites] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: { listing: { include: { university: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const favoriteListings = favorites
    .map((favorite) => favorite.listing)
    .filter((listing) => listing.status === "ACTIVE");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">My account</h1>
              <p className="mt-1 text-muted-foreground">
                {profile.fullName} · @{profile.username}
              </p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="rounded-full">
                Sign out
              </Button>
            </form>
          </div>

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">
                <UserIcon className="size-4" aria-hidden="true" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="listings">
                <Package className="size-4" aria-hidden="true" />
                My listings
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="size-4" aria-hidden="true" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileForm
                universityName={profile.university?.name ?? null}
                defaultValues={{
                  fullName: profile.fullName,
                  username: profile.username,
                  bio: profile.bio ?? "",
                  avatarUrl: profile.avatarUrl ?? "",
                }}
              />
            </TabsContent>

            <TabsContent value="listings" className="mt-6 space-y-3">
              {listings.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No listings yet"
                  description="Have something to sell or a service to offer? List it and your campus will see it in Browse."
                  action={
                    <Button asChild className="mt-2 rounded-full">
                      <Link href="/sell/new">Create a listing</Link>
                    </Button>
                  }
                />
              ) : (
                listings.map((listing) => <MyListingRow key={listing.id} listing={listing} />)
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              {favoriteListings.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Nothing saved yet"
                  description="Tap the heart on a listing to save it here for later."
                />
              ) : (
                <ListingGrid
                  listings={favoriteListings}
                  favoritedIds={new Set(favoriteListings.map((listing) => listing.id))}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
