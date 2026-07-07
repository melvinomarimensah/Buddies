import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, "Type a message.").max(2000, "That message is too long."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
