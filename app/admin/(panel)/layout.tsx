import { notFound } from "next/navigation";
import { getAdminProfile } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

// Every route in this group is gated: non-admins (including signed-out visitors)
// get a 404, so the panel never reveals that it exists.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminProfile();
  if (!admin) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav adminName={admin.fullName} />
      <main className="flex-1 overflow-x-hidden bg-background">{children}</main>
    </div>
  );
}
