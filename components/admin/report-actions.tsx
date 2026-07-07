"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { resolveReportAction } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();

  function act(resolution: "DISMISSED" | "RESOLVED", removeListing: boolean, message: string) {
    startTransition(async () => {
      const result = await resolveReportAction(reportId, resolution, removeListing);
      if (result?.error) toast.error(result.error);
      else toast.success(message);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={isPending}
        onClick={() => act("DISMISSED", false, "Report dismissed.")}
      >
        Dismiss
      </Button>
      <Button
        type="button"
        size="sm"
        className="rounded-full"
        disabled={isPending}
        onClick={() => act("RESOLVED", true, "Listing removed and report resolved.")}
      >
        Remove listing
      </Button>
    </div>
  );
}
