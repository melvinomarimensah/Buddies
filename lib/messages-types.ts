export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  listing: {
    id: string;
    title: string;
    image: string | null;
    price: number;
    currency: string;
    status: string;
  };
  otherParty: {
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  role: "buyer" | "seller";
  buyerCompleted: boolean;
  sellerCompleted: boolean;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
  lastMessageAt: string;
};
