import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Tuned per action. `limit` requests are allowed per `windowSeconds` window.
 * Generous enough for real students; tight enough to stop scripted abuse.
 */
export const RATE_LIMITS = {
  signIn: { limit: 10, windowSeconds: 300 }, // brute-force protection, per IP
  signUp: { limit: 5, windowSeconds: 3600 }, // account spam, per IP
  createListing: { limit: 12, windowSeconds: 3600 }, // listing/request spam, per user
  sendMessage: { limit: 30, windowSeconds: 60 }, // message spam, per user
  startConversation: { limit: 15, windowSeconds: 3600 }, // mass-DM, per user
  createReport: { limit: 10, windowSeconds: 3600 }, // report abuse, per user
} as const;

/**
 * Atomic fixed-window rate limiter backed by the `RateLimit` table. A single
 * upsert both records the hit and returns the running count for the current
 * window, so it is safe under concurrent serverless invocations.
 *
 * Returns `true` if the request is allowed, `false` if the caller is over the
 * limit. Fails open — a limiter error never blocks a legitimate action.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowSeconds * 1000);
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, now())
      ON CONFLICT ("key") DO UPDATE
      SET "count" = CASE WHEN "RateLimit"."windowStart" < ${cutoff} THEN 1
                         ELSE "RateLimit"."count" + 1 END,
          "windowStart" = CASE WHEN "RateLimit"."windowStart" < ${cutoff} THEN now()
                               ELSE "RateLimit"."windowStart" END
      RETURNING "count";
    `;
    const count = Number(rows[0]?.count ?? 1);
    return count <= limit;
  } catch {
    // Never lock a real user out because the limiter itself errored.
    return true;
  }
}

/** Best-effort client IP for rate-limiting unauthenticated actions. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
