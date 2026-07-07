import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminProfile } from "@/lib/auth";
import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";

export const metadata: Metadata = {
  title: "Admin sign in — Buddies",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getAdminProfile();
  if (admin) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <AdminSignInForm />
    </div>
  );
}
