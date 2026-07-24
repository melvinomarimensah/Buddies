import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WantedForm } from "@/components/listings/wanted-form";

export const metadata: Metadata = {
  title: "Post a request — Buddies",
};

export default async function NewWantedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/wanted/new");
  }

  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6">
        <WantedForm categories={categories} />
      </main>
      <SiteFooter />
    </div>
  );
}
