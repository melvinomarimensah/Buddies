import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { CategoryMosaic } from "@/components/marketing/category-mosaic";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { CampusProof } from "@/components/marketing/campus-proof";
import { getCategories, getUniversities } from "@/lib/data";

export default async function Home() {
  const [categories, universities] = await Promise.all([getCategories(), getUniversities()]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero campusCount={universities.length} />
        <CategoryMosaic categories={categories.slice(0, 10)} />
        <HowItWorksSteps />
        <CampusProof universities={universities} />
      </main>
      <SiteFooter />
    </div>
  );
}
