import { z } from "zod";
import { containsProhibitedContent, MAX_LISTING_IMAGES } from "@/lib/constants";

function noProhibitedContent(value: string) {
  return !containsProhibitedContent(value);
}

const PROHIBITED_MESSAGE =
  "Remove phone numbers, links, or payment app handles — arrange payment when you meet up.";

export const createListingSchema = z
  .object({
    type: z.enum(["PRODUCT", "SERVICE"]),
    title: z
      .string()
      .trim()
      .min(4, "Give it a short, clear title.")
      .max(80, "Keep it under 80 characters.")
      .refine(noProhibitedContent, { message: PROHIBITED_MESSAGE }),
    description: z
      .string()
      .trim()
      .min(20, "Add a few more details so buyers know what they're getting.")
      .max(2000, "Keep it under 2000 characters.")
      .refine(noProhibitedContent, { message: PROHIBITED_MESSAGE }),
    categoryId: z.string().min(1, "Choose a category."),
    price: z
      .number()
      .min(0, "Price can't be negative.")
      .max(1_000_000, "That price looks too high."),
    condition: z.string().optional(),
    availability: z.string().optional(),
    images: z
      .array(z.string().url())
      .min(1, "Add at least one photo.")
      .max(MAX_LISTING_IMAGES, `Up to ${MAX_LISTING_IMAGES} photos.`),
  })
  .refine((data) => data.type !== "PRODUCT" || Boolean(data.condition), {
    message: "Select a condition for this product.",
    path: ["condition"],
  })
  .refine((data) => data.type !== "SERVICE" || Boolean(data.availability?.trim()), {
    message: "Let buyers know your availability.",
    path: ["availability"],
  });

export type CreateListingInput = z.infer<typeof createListingSchema>;
