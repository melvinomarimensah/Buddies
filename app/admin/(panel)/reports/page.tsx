import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReportActions } from "@/components/admin/report-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Reports — Buddies Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      reporter: { select: { username: true } },
      listing: { select: { id: true, title: true, status: true } },
    },
  });

  const open = reports.filter((r) => r.status === "OPEN");
  const resolved = reports.filter((r) => r.status !== "OPEN");

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description={`${open.length} open · ${resolved.length} resolved`}
      />
      <div className="space-y-8 p-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Open
          </h2>
          {open.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="All clear"
              description="No open reports right now. Nice and quiet."
            />
          ) : (
            <ul className="space-y-3">
              {open.map((report) => (
                <li
                  key={report.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/listings/${report.listing.id}`}
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Reported by @{report.reporter.username} ·{" "}
                        {formatDistanceToNow(report.createdAt, { addSuffix: true })}
                        {report.listing.status === "REMOVED" ? " · listing already removed" : ""}
                      </p>
                      <p className="mt-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                        {report.reason}
                      </p>
                    </div>
                    <ReportActions reportId={report.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {resolved.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resolved
            </h2>
            <ul className="space-y-2">
              {resolved.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/listings/${report.listing.id}`}
                      target="_blank"
                      className="truncate font-medium hover:underline"
                    >
                      {report.listing.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{report.reason}</p>
                  </div>
                  <Badge variant="outline">{report.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
