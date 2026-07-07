import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const getCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getUniversities = unstable_cache(
  async () => prisma.university.findMany({ orderBy: { name: "asc" } }),
  ["universities"],
  { revalidate: 300, tags: ["universities"] }
);
