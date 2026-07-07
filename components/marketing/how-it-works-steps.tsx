import { ListChecks, MessageCircle, Handshake } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

const steps = [
  {
    icon: ListChecks,
    title: "List",
    description: "Snap a few photos, set a price, and publish in minutes. Products or services, your call.",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    description: "Message buyers or sellers right in Buddies. Every conversation is tied to the listing.",
  },
  {
    icon: Handshake,
    title: "Meet",
    description: "Meet on campus, hand off the goods, and pay on delivery. No fees, no middleman.",
  },
];

export function HowItWorksSteps() {
  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How Buddies works</h2>
            <p className="mt-3 text-muted-foreground">Three steps, zero hassle.</p>
          </div>
        </FadeIn>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <FadeIn key={step.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
