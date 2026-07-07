import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your full name.").max(80),
  username: z
    .string()
    .trim()
    .min(3, "Usernames need at least 3 characters.")
    .max(20, "Keep usernames under 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only."),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters.").optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
