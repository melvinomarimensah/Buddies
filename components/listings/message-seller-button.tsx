"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { startConversationAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";

export function MessageSellerButton({
  listingId,
  isAuthenticated,
  label = "Message seller",
}: {
  listingId: string;
  isAuthenticated: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/auth/sign-in?redirectTo=/listings/${listingId}`);
      return;
    }
    startTransition(async () => {
      const result = await startConversationAction(listingId);
      if (result.error || !result.conversationId) {
        toast.error(result.error ?? "Couldn't open a conversation.");
        return;
      }
      router.push(`/messages?c=${result.conversationId}`);
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} className="w-full rounded-full">
      <MessageCircle className="size-4" aria-hidden="true" />
      {isPending ? "Opening…" : label}
    </Button>
  );
}
