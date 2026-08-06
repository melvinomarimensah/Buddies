import { Search } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Hero({ campusCount }: { campusCount: number }) {
  const stats = [
    { label: "Built for students", value: "100%" },
    { label: "Platform fees", value: "$0" },
    { label: "Campuses live", value: `${campusCount}` },
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 40%), radial-gradient(circle at 85% 25%, color-mix(in oklab, var(--color-coral) 18%, transparent), transparent 40%)",
        }}
      />
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <FadeIn>
          <span className="inline-flex items-center rounded-full bg-coral-soft px-4 py-1.5 text-sm font-medium text-coral-soft-foreground">
            Built exclusively for college students
          </span>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="mt-6 text-balance font-display text-5xl font-bold leading-tight sm:text-6xl">
            Trade with your people.
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Buy, sell, and swap products and services with students on your own campus —
            textbooks, tech, rides, tutoring, and everything in between.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <form action="/browse" className="mx-auto mt-8 flex max-w-lg items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="text"
                name="q"
                placeholder="Search textbooks, bikes, tutoring…"
                className="h-12 rounded-full pl-11"
                aria-label="Search listings"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-full px-6">
              Search
            </Button>
          </form>
        </FadeIn>
        <FadeIn delay={0.2}>
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold text-primary">{stat.value}</dd>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>
    </section>
  );
}
