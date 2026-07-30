"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    email: formData.get("email"),
    universityId: formData.get("universityId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const ip = await getClientIp();
  if (!(await rateLimit(`signup:${ip}`, RATE_LIMITS.signUp.limit, RATE_LIMITS.signUp.windowSeconds))) {
    return { error: "Too many sign-up attempts. Please wait a little while and try again." };
  }

  const { fullName, username, email, universityId, password } = parsed.data;

  const university = await prisma.university.findUnique({
    where: { id: universityId },
  });

  if (!university) {
    return { fieldErrors: { universityId: ["Pick a school from the list."] } };
  }

  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingUsername) {
    return { fieldErrors: { username: ["That username is already taken."] } };
  }
  if (existingEmail) {
    return { error: "An account with that email already exists. Try signing in instead." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "We couldn't create your account. Please try again." };
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      email,
      fullName,
      username,
      universityId: university.id,
      isVerified: false,
    },
  });

  if (data.session) {
    redirect("/account");
  }

  redirect("/auth/verify-email");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const ip = await getClientIp();
  if (!(await rateLimit(`signin:${ip}`, RATE_LIMITS.signIn.limit, RATE_LIMITS.signIn.windowSeconds))) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const redirectTo = formData.get("redirectTo");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Please confirm your email first — check your inbox for the link we sent when you signed up.",
      };
    }
    return { error: "That email and password don't match. Give it another try." };
  }

  const profile = data.user
    ? await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { deactivatedAt: true },
      })
    : null;
  if (profile?.deactivatedAt) {
    await supabase.auth.signOut();
    return {
      error: "This account is deactivated. Contact support to have it restored.",
    };
  }

  redirect(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/account");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/update-password`,
  });

  return { success: true };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "We couldn't update your password. Try requesting a new reset link." };
  }

  redirect("/account");
}
