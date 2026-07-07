import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsManager } from "@/components/admin/settings-manager";

export const metadata: Metadata = {
  title: "Settings — Buddies Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const [universities, categories] = await Promise.all([
    prisma.university.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Manage supported universities and the category taxonomy."
      />
      <div className="p-6">
        <SettingsManager universities={universities} categories={categories} />
      </div>
    </div>
  );
}
