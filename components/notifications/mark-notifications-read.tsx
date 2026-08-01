"use client";

import { useEffect } from "react";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";

/** Marks the viewer's notifications read once, on open. */
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) {
      void markAllNotificationsReadAction();
    }
  }, [hasUnread]);
  return null;
}
