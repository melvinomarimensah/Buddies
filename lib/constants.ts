export const PROHIBITED_CONTENT_PATTERNS: RegExp[] = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /https?:\/\/\S+/i,
  /www\.\S+/i,
  /\b(venmo|cash ?app|paypal|zelle)\b/i,
];

export function containsProhibitedContent(value: string): boolean {
  return PROHIBITED_CONTENT_PATTERNS.some((pattern) => pattern.test(value));
}

export const LISTING_CONDITIONS = ["New", "Like new", "Good", "Fair", "Used"];

export const LISTING_IMAGES_BUCKET = "listing-images";

export const MAX_LISTING_IMAGES = 6;

export const AVATARS_BUCKET = "avatars";
