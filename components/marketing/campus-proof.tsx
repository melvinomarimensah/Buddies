import { FadeIn } from "@/components/motion/fade-in";
import type { University } from "@prisma/client";

export function CampusProof({ universities }: { universities: University[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <FadeIn>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Live on campuses like yours</h2>
          <p className="mt-3 text-muted-foreground">
            Pick your school when you sign up and start trading with people nearby.
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {universities.map((university) => (
            <span
              key={university.id}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              {university.name}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
