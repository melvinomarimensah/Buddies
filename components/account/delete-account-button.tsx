"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccountButton({ username }: { username: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState("");
  const phrase = `delete ${username}`;
  const canDelete = confirm.trim().toLowerCase() === phrase.toLowerCase();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccountAction();
      // On success the action signs out and redirects; only errors return here.
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
      <h2 className="font-semibold text-destructive">Delete account permanently</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently erase your profile, listings, requests, messages, and saved items. This
        can&apos;t be undone and your data can&apos;t be recovered. If you just want a break, use
        Deactivate above instead.
      </p>
      <AlertDialog onOpenChange={() => setConfirm("")}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="mt-4 rounded-full">
            <Trash2 className="size-4" aria-hidden="true" />
            Delete my account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This erases everything tied to your account — listings, requests, conversations, and
              saved items — for good. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm">
              Type <span className="font-mono font-medium text-foreground">{phrase}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="off"
              placeholder={phrase}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!canDelete || isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Deleting…" : "Delete forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
