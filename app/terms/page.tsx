import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service — Buddies",
};

const LAST_UPDATED = "July 29, 2026";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> this is a starting
            template, not legal advice. Have it reviewed by a qualified attorney and tailored to
            your jurisdiction before launch.
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. Who we are</h2>
              <p>
                Buddies is a peer-to-peer marketplace where college students buy, sell, and request
                products and services within their campus community. By creating an account or using
                Buddies, you agree to these Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. Eligibility &amp; accounts</h2>
              <p>
                You must be at least 18 years old (or the age of majority where you live) and a
                current college student to use Buddies. You are responsible for the activity on your
                account and for keeping your login secure. Provide accurate information and keep it
                up to date.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. How trades work</h2>
              <p>
                Buddies is a venue that connects buyers and sellers. We do{" "}
                <strong className="text-foreground">not</strong> process payments, take a
                commission, hold funds in escrow, ship items, or take part in any transaction.
                Payment and hand-off happen directly between students — we recommend meeting in a
                public place on campus and paying on delivery.
              </p>
              <p>
                Because we are not a party to any transaction, we make no guarantees about listings,
                the condition or legality of items, the conduct of users, or that any trade will be
                completed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Listings &amp; conduct</h2>
              <p>You agree that you will not use Buddies to:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Post illegal items or services, weapons, drugs, alcohol, or counterfeit goods;</li>
                <li>Post academic work, exams, or anything that violates your school&apos;s honor code;</li>
                <li>Harass, threaten, impersonate, defraud, or endanger other people;</li>
                <li>Post content you don&apos;t have the rights to, or that is misleading or spam;</li>
                <li>Circumvent, scrape, overload, or attempt to breach the security of the service.</li>
              </ul>
              <p>
                You are solely responsible for your listings, messages, and trades. We may remove
                content and suspend or terminate accounts that violate these Terms, at our
                discretion.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">5. Your content</h2>
              <p>
                You keep ownership of what you post. You grant Buddies a non-exclusive license to
                host and display your content for the purpose of operating the service. You represent
                that you have the rights to what you post.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">6. Deactivation &amp; deletion</h2>
              <p>
                You can deactivate your account at any time from your{" "}
                <Link href="/account" className="text-primary underline-offset-4 hover:underline">
                  account settings
                </Link>{" "}
                (your data is retained and can be restored), or permanently delete it (your data is
                erased and cannot be recovered). We may suspend or terminate accounts that break
                these Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">7. Disclaimers &amp; liability</h2>
              <p>
                Buddies is provided &quot;as is&quot; without warranties of any kind. To the fullest
                extent permitted by law, Buddies is not liable for any indirect, incidental, or
                consequential damages, or for disputes, losses, or injuries arising from trades or
                interactions between users. Some jurisdictions don&apos;t allow certain limitations,
                so some of these may not apply to you.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">8. Changes</h2>
              <p>
                We may update these Terms from time to time. If we make material changes, we&apos;ll
                update the date above and, where appropriate, notify you. Continued use of Buddies
                means you accept the updated Terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
              <p>
                Questions about these Terms? Reach us at{" "}
                <span className="text-foreground">support@buddies.app</span>.
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            See also our{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
