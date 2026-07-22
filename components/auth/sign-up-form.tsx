"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { University } from "@prisma/client";
import { signUpAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FieldError } from "@/components/auth/field-error";
import { SchoolCombobox } from "@/components/auth/school-combobox";
import { PasswordField } from "@/components/auth/password-field";

export function SignUpForm({ universities }: { universities: University[] }) {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1 text-xs font-medium text-coral-soft-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Free for students
        </span>
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join your campus marketplace in under a minute.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required autoComplete="name" placeholder="Ava Chen" />
            <FieldError messages={state?.fieldErrors?.fullName} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              required
              autoComplete="username"
              placeholder="ava_chen"
              pattern="[A-Za-z0-9_]+"
              minLength={3}
              maxLength={20}
            />
            <FieldError messages={state?.fieldErrors?.username} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
          />
          <FieldError messages={state?.fieldErrors?.email} />
        </div>

        <SchoolCombobox universities={universities} error={state?.fieldErrors?.universityId} />

        <PasswordField error={state?.fieldErrors?.password} />

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
          />
          <span>
            I&apos;ll meet buddies in public campus spots, and I understand Buddies doesn&apos;t
            process payments.{" "}
            <Link href="/how-it-works" className="font-medium text-primary hover:underline">
              Safety tips
            </Link>
          </span>
        </label>

        {state?.error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <SubmitButton pendingLabel="Creating your account…">Create account</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
