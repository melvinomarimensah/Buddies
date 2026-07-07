import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify your email — Buddies",
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-4 text-center lg:text-left">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary lg:mx-0">
        <MailCheck className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
      <p className="text-sm text-muted-foreground">
        We sent a confirmation link to your school email. Click it to activate your account, then
        come back and sign in.
      </p>
      <Link href="/auth/sign-in" className="text-sm font-medium text-primary hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
