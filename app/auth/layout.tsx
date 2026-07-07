import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-display font-bold">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="size-4" aria-hidden="true" />
          </span>
          Buddies
        </Link>
        <div className="mx-auto w-full max-w-sm py-12">{children}</div>
        <p className="text-center text-sm text-muted-foreground lg:text-left">
          Buddies is built exclusively for college students.
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--color-coral) 55%, transparent), transparent 45%), radial-gradient(circle at 80% 70%, color-mix(in oklab, white 25%, transparent), transparent 40%), var(--color-primary)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-16 text-primary-foreground">
          <div />
          <div className="max-w-md space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight">
              Trade with your people.
            </h1>
            <p className="text-lg text-white/80">
              Buy, sell, and swap with students on your own campus — textbooks, tech, rides,
              tutoring, and everything in between.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {["Student marketplace", "No fees", "Real campuses"].map((label) => (
              <span
                key={label}
                className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
