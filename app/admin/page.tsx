import { redirect } from "next/navigation";
import { getAdminProfile } from "@/lib/auth";

export default async function AdminIndexPage() {
  const admin = await getAdminProfile();
  redirect(admin ? "/admin/dashboard" : "/admin/login");
}
