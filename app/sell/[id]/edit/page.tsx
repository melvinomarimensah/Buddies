import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SellWizard } from "@/components/listings/sell-wizard";
import { DeleteListingButton } from "@/components/listings/delete-listing-button";

export const metadata: Metadata = {
  title: "Edit listing — Buddies",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?redirectTo=/sell/${id}/edit`);
  }

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    getCategories(),
  ]);

  if (!listing || listing.status === "REMOVED" || listing.sellerId !== user.id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6">
        <SellWizard
          categories={categories}
          mode="edit"
          listingId={listing.id}
          defaultValues={{
            type: listing.type,
            title: listing.title,
            description: listing.description,
            categoryId: listing.categoryId,
            price: listing.price / 100,
            condition: listing.condition ?? "",
            availability: listing.availability ?? "",
            images: listing.images,
          }}
        />
        <div className="mx-auto mt-10 max-w-2xl border-t border-border pt-6">
          <DeleteListingButton listingId={listing.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
