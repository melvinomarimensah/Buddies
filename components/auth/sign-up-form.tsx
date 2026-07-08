"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { University } from "@prisma/client";
import { signUpAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FieldError } from "@/components/auth/field-error";

export function SignUpForm({ universities }: { universities: University[] }) {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Tell us your name and school to get started.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
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
          />
          <FieldError messages={state?.fieldErrors?.username} />
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
        <div className="grid gap-2">
          <Label htmlFor="universityId">School</Label>
          <select
            id="universityId"
            name="universityId"
            required
            defaultValue=""
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Select your school
            </option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
          <FieldError messages={state?.fieldErrors?.universityId} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          <FieldError messages={state?.fieldErrors?.password} />
        </div>
        {state?.error ? (
          <p role="alert" className="text-sm text-destructive">
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
