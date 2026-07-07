import Link from "next/link";
import { getCategoryIcon } from "@/lib/icon-map";
import { FadeIn } from "@/components/motion/fade-in";
import type { Category } from "@prisma/client";

export function CategoryMosaic({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <FadeIn>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Find what your campus needs</h2>
          <p className="mt-3 text-muted-foreground">
            From textbooks to tutoring, browse the categories students trade most.
          </p>
        </div>
      </FadeIn>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <FadeIn key={category.id} delay={Math.min(index * 0.04, 0.3)}>
              <Link
                href={`/browse?category=${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
