"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import {
  adminSetUserVerifiedAction,
  adminSetUserSuspendedAction,
  adminSetUserRoleAction,
  adminReactivateUserAction,
} from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  isVerified: boolean;
  isSuspended: boolean;
  isDeactivated: boolean;
  universityName: string | null;
  listingCount: number;
};

export function AdminUsersTable({ users, currentAdminId }: { users: Row[]; currentAdminId: string }) {
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string }>, success: string) {
    startTransition(async () => {
      const result = await fn();
      if (result?.error) toast.error(result.error);
      else toast.success(success);
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Campus</th>
            <th className="px-4 py-3 font-medium">Listings</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                No users match.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentAdminId;
              return (
                <tr key={user.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">
                          {user.fullName}{" "}
                          <span className="text-muted-foreground">@{user.username}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Button asChild variant="ghost" size="icon" className="size-7">
                        <Link href={`/u/${user.username}`} target="_blank" aria-label="View profile">
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.universityName ?? "—"}
                  </td>
                  <td className="px-4 py-3">{user.listingCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-primary text-primary-foreground">Admin</Badge>
                      ) : null}
                      {user.isVerified ? (
                        <Badge className="bg-success text-success-foreground">Verified</Badge>
                      ) : null}
                      {user.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : null}
                      {user.isDeactivated ? (
                        <Badge variant="destructive">Deactivated</Badge>
                      ) : null}
                      {!user.isVerified &&
                      !user.isSuspended &&
                      !user.isDeactivated &&
                      user.role !== "ADMIN" ? (
                        <Badge variant="outline">Student</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {user.isDeactivated ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          disabled={isPending}
                          onClick={() =>
                            run(() => adminReactivateUserAction(user.id), "Account reactivated.")
                          }
                        >
                          Reactivate
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={isPending}
                        onClick={() =>
                          run(
                            () => adminSetUserVerifiedAction(user.id, !user.isVerified),
                            user.isVerified ? "Verification removed." : "User verified."
                          )
                        }
                      >
                        {user.isVerified ? "Unverify" : "Verify"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={isPending || isSelf}
                        onClick={() =>
                          run(
                            () => adminSetUserSuspendedAction(user.id, !user.isSuspended),
                            user.isSuspended ? "User reinstated." : "User suspended."
                          )
                        }
                      >
                        {user.isSuspended ? "Reinstate" : "Suspend"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={isPending || isSelf}
                        onClick={() =>
                          run(
                            () =>
                              adminSetUserRoleAction(
                                user.id,
                                user.role === "ADMIN" ? "STUDENT" : "ADMIN"
                              ),
                            user.role === "ADMIN" ? "Admin access removed." : "Promoted to admin."
                          )
                        }
                      >
                        {user.role === "ADMIN" ? "Demote" : "Make admin"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
