import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SellWizard } from "@/components/listings/sell-wizard";

export const metadata: Metadata = {
  title: "Sell something — Buddies",
};

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/sell/new");
  }

  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6">
        <SellWizard categories={categories} />
      </main>
      <SiteFooter />
    </div>
  );
}
