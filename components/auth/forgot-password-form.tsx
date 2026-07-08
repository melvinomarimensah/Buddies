"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FieldError } from "@/components/auth/field-error";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center lg:text-left">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success lg:mx-0">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/auth/sign-in" className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to get back in.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@university.edu"
          />
          <FieldError messages={state?.fieldErrors?.email} />
        </div>
        <SubmitButton pendingLabel="Sending link…">Send reset link</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
