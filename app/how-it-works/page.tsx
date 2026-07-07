import type { Metadata } from "next";
import Link from "next/link";
import {
  ListChecks,
  MessageCircle,
  Handshake,
  MapPin,
  Sun,
  Users,
  ShieldCheck,
  Flag,
  MessageSquareWarning,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works — Buddies",
  description:
    "How listing, chatting, and meeting up works on Buddies, plus safety tips for meeting in public and what to do if something goes wrong.",
};

const steps = [
  {
    icon: ListChecks,
    title: "List what you've got",
    description:
      "Pick product or service, add a few photos, a fair price, and a short description. Publish in minutes — no fees to list or sell.",
  },
  {
    icon: MessageCircle,
    title: "Chat with your campus",
    description:
      "Buyers message you right inside Buddies. Every conversation is anchored to the listing, so context never gets lost.",
  },
  {
    icon: Handshake,
    title: "Meet and hand it off",
    description:
      "Agree on a public spot on campus, meet up, and exchange payment on delivery. Mark the listing as met once you're done.",
  },
];

const safetyTips = [
  {
    icon: MapPin,
    title: "Meet in public campus spots",
    description:
      "Student unions, libraries, and dining halls are always good calls. Avoid dorm rooms or off-campus addresses for a first meetup.",
  },
  {
    icon: Sun,
    title: "Stick to daylight hours",
    description: "Schedule meetups during the day when campus is busy and well-lit.",
  },
  {
    icon: Users,
    title: "Bring a friend if you can",
    description: "There's safety in numbers, especially for higher-value items.",
  },
  {
    icon: ShieldCheck,
    title: "Inspect before you pay",
    description:
      "Buddies doesn't process payments — always check the item matches the listing before handing over cash or a payment app transfer.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <FadeIn>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">How Buddies works</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple, student-first way to trade with people you can actually trust — because
              they go to your school too.
            </p>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-bold">
                    {index + 1}. {step.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl font-bold sm:text-4xl">
                  Staying safe when you meet up
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Buddies is built for students on your campus, but a little common sense still
                  goes a long way.
                </p>
              </div>
            </FadeIn>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {safetyTips.map((tip, index) => (
                <FadeIn key={tip.title} delay={index * 0.08}>
                  <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <tip.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{tip.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                If something goes wrong
              </h2>
              <p className="mt-3 text-muted-foreground">
                Buddies never touches your money, so there&apos;s no payment dispute process to
                wait on — but we&apos;re still here to help.
              </p>
            </div>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <FadeIn delay={0.05}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-warning/10 text-warning">
                  <MessageSquareWarning className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">Talk it out first</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Most mix-ups — a wrong meeting time, a mismatched description — are easiest to
                  resolve with a quick message to the other person.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Flag className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">Report a listing or user</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  If someone&apos;s misrepresenting an item or breaking the rules, use the Report
                  button on their listing or profile. Our team reviews every report.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-20 text-center sm:px-6">
          <FadeIn>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/browse">Start browsing</Link>
            </Button>
          </FadeIn>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
