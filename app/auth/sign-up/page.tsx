import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getUniversities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Create your account — Buddies",
};

export default async function SignUpPage() {
  const universities = await getUniversities();

  return <SignUpForm universities={universities} />;
}
