import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import type { University } from "@prisma/client";

// Recognizable schools to surface first — filtered to the ones actually seeded,
// then topped up from the full list so this always renders a full row.
const FEATURED = [
  "Stanford University",
  "University of California, Berkeley",
  "New York University",
  "University of Michigan",
  "University of California, Los Angeles",
  "University of Texas at Austin",
  "Boston University",
  "University of Florida",
  "University of Washington",
  "University of Southern California",
];

export function CampusProof({ universities }: { universities: University[] }) {
  const total = universities.length;
  const names = new Set(universities.map((u) => u.name));
  const featured = FEATURED.filter((name) => names.has(name));
  for (const u of universities) {
    if (featured.length >= 10) break;
    if (!featured.includes(u.name)) featured.push(u.name);
  }
  const remaining = Math.max(0, total - featured.length);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <FadeIn>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Live on campuses like yours</h2>
          <p className="mt-3 text-muted-foreground">
            From Stanford to your school — Buddies is live on {total} campuses across the US. Pick
            yours when you sign up and start trading with people nearby.
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {featured.map((name) => (
            <span
              key={name}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              {name}
            </span>
          ))}
          {remaining > 0 ? (
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              + {remaining} more campuses
            </span>
          ) : null}
        </div>
      </FadeIn>
      <FadeIn delay={0.15}>
        <div className="mt-8 text-center">
          <Link
            href="/schools"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            See all {total} schools
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
