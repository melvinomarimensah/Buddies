import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your full name.").max(80),
  username: z
    .string()
    .trim()
    .min(3, "Usernames need at least 3 characters.")
    .max(20, "Keep usernames under 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only."),
  email: z.string().trim().toLowerCase().email("That doesn't look like a valid email."),
  universityId: z.string().min(1, "Select your school."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[a-zA-Z]/, "Add at least one letter.")
    .regex(/[0-9]/, "Add at least one number."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like a valid email."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[a-zA-Z]/, "Add at least one letter.")
    .regex(/[0-9]/, "Add at least one number."),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
