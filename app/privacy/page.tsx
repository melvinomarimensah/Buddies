import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Buddies",
};

const LAST_UPDATED = "July 29, 2026";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> this is a starting
            template, not legal advice. Have it reviewed by a qualified attorney and tailored to your
            jurisdiction (and any applicable laws such as GDPR, CCPA, or FERPA) before launch.
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. What we collect</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong className="text-foreground">Account info</strong> — your name, username,
                  email address, university, and any bio or avatar you add.
                </li>
                <li>
                  <strong className="text-foreground">Content you create</strong> — listings,
                  requests, favorites, reports, and messages you send to other students.
                </li>
                <li>
                  <strong className="text-foreground">Technical data</strong> — basic log and device
                  information needed to operate and secure the service.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. How we use it</h2>
              <p>
                We use your information to run the marketplace: to show your listings to students on
                your campus, enable messaging, keep the service safe, prevent abuse, and respond to
                support requests. We do{" "}
                <strong className="text-foreground">not</strong> sell your personal information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. What others can see</h2>
              <p>
                Your username, avatar, university, and active listings/requests are visible to other
                signed-in students. Your messages are visible only to you and the student you&apos;re
                talking with. Your email address is not shown publicly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Where your data lives</h2>
              <p>
                Buddies is built on Supabase (authentication, database, and file storage). Your data
                is stored there on our behalf. Access is restricted, connections are encrypted in
                transit, and the database is locked down so it can&apos;t be read through public
                APIs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">5. Cookies</h2>
              <p>
                We use strictly-necessary cookies to keep you signed in. We don&apos;t use
                advertising or third-party tracking cookies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">6. Your choices &amp; rights</h2>
              <p>
                You can view and edit your profile any time in your{" "}
                <Link href="/account" className="text-primary underline-offset-4 hover:underline">
                  account settings
                </Link>
                . You can <strong className="text-foreground">deactivate</strong> your account to
                hide your data (retained, restorable by an admin), or{" "}
                <strong className="text-foreground">permanently delete</strong> it to erase your
                profile, listings, requests, messages, and saved items. Depending on where you live,
                you may have additional rights to access, correct, or export your data — contact us
                to exercise them.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">7. Data retention</h2>
              <p>
                We keep your information for as long as your account is active. When you permanently
                delete your account, we erase your associated data. We may retain limited records
                where required for legal, safety, or fraud-prevention reasons.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">8. Children</h2>
              <p>
                Buddies is intended for college students and is not directed to children under 18.
                We don&apos;t knowingly collect data from them.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
              <p>
                Questions or privacy requests? Reach us at{" "}
                <span className="text-foreground">privacy@buddies.app</span>.
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            See also our{" "}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
