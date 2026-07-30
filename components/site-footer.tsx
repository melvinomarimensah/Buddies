import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse listings", href: "/browse" },
      { label: "Sell something", href: "/sell/new" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/auth/sign-in" },
      { label: "Create account", href: "/auth/sign-up" },
      { label: "My account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShoppingBag className="size-4" aria-hidden="true" />
              </span>
              Buddies
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Trade with your people. The peer-to-peer marketplace built for college students.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Buddies. Built for students, by students.</p>
          <p>Buddies never processes payments — always meet on campus and pay on delivery.</p>
        </div>
      </div>
    </footer>
  );
}
