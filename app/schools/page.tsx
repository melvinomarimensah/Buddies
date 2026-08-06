import type { Metadata } from "next";
import { getUniversities } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SchoolsList } from "@/components/schools-list";

export const metadata: Metadata = {
  title: "Schools on Buddies",
};

export default async function SchoolsPage() {
  const universities = await getUniversities();
  const schools = universities.map((u) => ({ id: u.id, name: u.name, city: u.city }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Schools on Buddies</h1>
            <p className="mt-3 text-muted-foreground">
              Buddies is live on {schools.length} campuses across the US. Find yours — then sign up
              and start trading with students nearby.
            </p>
          </div>
          <div className="mt-10">
            <SchoolsList schools={schools} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
