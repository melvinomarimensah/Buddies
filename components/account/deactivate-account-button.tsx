"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { UserX } from "lucide-react";
import { deactivateAccountAction } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
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

export function DeactivateAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDeactivate() {
    startTransition(async () => {
      const result = await deactivateAccountAction();
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <h2 className="font-semibold">Deactivate account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hide your profile and listings and sign out. Your data is kept, and an admin can restore
        your account if you want to come back.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full text-destructive hover:text-destructive"
          >
            <UserX className="size-4" aria-hidden="true" />
            Deactivate my account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile, listings, and requests will be hidden from Buddies, and you&apos;ll be
              signed out. You won&apos;t be able to sign back in until an admin restores your
              account — your data stays safe in the meantime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Never mind</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} disabled={isPending}>
              {isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
