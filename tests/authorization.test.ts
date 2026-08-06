import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";

// ── Mock the runtime boundary (auth identity + Next internals) ───────────────
// mockState.userId controls "who is signed in" for the whole action under test.
const mockState = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.7"]]),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const e = new Error(`NEXT_REDIRECT:${url}`) as Error & { __redirect?: string };
    e.__redirect = url;
    throw e;
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: mockState.userId ? { id: mockState.userId } : null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
  }),
}));

// Imports below resolve to the REAL modules (Prisma → the test DB).
import { prisma } from "@/lib/db";
import {
  getConversationMessagesAction,
  sendMessageAction,
  markConversationReadAction,
  markMetAction,
  startConversationAction,
} from "@/lib/actions/messages";
import { adminSetUserSuspendedAction, adminSetUserListingsHiddenAction } from "@/lib/actions/admin";
import { deactivateAccountAction } from "@/lib/actions/account";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { notifyNewMessage, notifyRequestMatches } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

function signInAs(id: string | null) {
  mockState.userId = id;
}

async function catchRedirect(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (e) {
    const url = (e as { __redirect?: string }).__redirect;
    if (url) return url;
    throw e;
  }
}

async function truncate() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "Notification","Message","Conversation","Favorite","Report","AuditLog","RateLimit","Listing","User","Category","University" RESTART IDENTITY CASCADE;`
  );
}

// Seed a university, category, and a fresh set of users; return handy ids.
async function seedBase() {
  const uni = await prisma.university.create({
    data: { name: "Test U", country: "US", city: "Testville", emailDomain: `t${Date.now()}.edu` },
  });
  const cat = await prisma.category.create({
    data: { name: "Books", slug: `books-${Date.now()}`, icon: "book", type: "PRODUCT" },
  });
  const mkUser = (id: string, role: "STUDENT" | "ADMIN" = "STUDENT") =>
    prisma.user.create({
      data: { id, email: `${id}@t.test`, fullName: id, username: id, universityId: uni.id, role },
    });
  return { uni, cat, mkUser };
}

// A listing owned by `sellerId`, plus a conversation (buyer↔seller) with one message.
async function seedConversation(sellerId: string, buyerId: string, uniId: string, catId: string) {
  const listing = await prisma.listing.create({
    data: {
      sellerId,
      universityId: uniId,
      categoryId: catId,
      type: "PRODUCT",
      title: "Calculus textbook",
      description: "Barely used",
      price: 2500,
    },
  });
  const convo = await prisma.conversation.create({
    data: { listingId: listing.id, buyerId, sellerId },
  });
  await prisma.message.create({
    data: { conversationId: convo.id, senderId: buyerId, body: "Is this still available?" },
  });
  return { listing, convo };
}

// The exact seller filter Browse and listing pages use for public visibility.
function publicListingCount() {
  return prisma.listing.count({
    where: {
      status: "ACTIVE",
      seller: { deactivatedAt: null, listingsHidden: false, isSuspended: false },
    },
  });
}

beforeAll(() => {
  // Hard guardrail: never run this suite against anything but the test DB.
  const url = process.env.DATABASE_URL ?? "";
  if (!/buddies_test/.test(url)) {
    throw new Error(`Refusing to run: DATABASE_URL is not the test database (got: ${url}).`);
  }
});

beforeEach(async () => {
  signInAs(null);
  await truncate();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("conversation authorization", () => {
  it("an outsider cannot read a conversation's messages", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice"); // buyer
    await mkUser("bob"); // seller
    await mkUser("carol"); // outsider
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs("carol");
    const res = await getConversationMessagesAction(convo.id);
    expect(res.error).toBeTruthy();
    expect(res.messages).toBeUndefined();
  });

  it("a participant can read the conversation's messages", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs("alice");
    const res = await getConversationMessagesAction(convo.id);
    expect(res.error).toBeUndefined();
    expect(res.messages).toHaveLength(1);
  });

  it("a signed-out user cannot read messages", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs(null);
    const res = await getConversationMessagesAction(convo.id);
    expect(res.error).toBeTruthy();
  });

  it("an outsider cannot send a message (and none is written)", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    await mkUser("carol");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs("carol");
    const res = await sendMessageAction({ conversationId: convo.id, body: "sneaky message" });
    expect(res.error).toBeTruthy();
    expect(await prisma.message.count({ where: { conversationId: convo.id } })).toBe(1);
  });

  it("a participant can send a message", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs("bob");
    const res = await sendMessageAction({ conversationId: convo.id, body: "Yes, still here!" });
    expect(res.error).toBeUndefined();
    expect(await prisma.message.count({ where: { conversationId: convo.id } })).toBe(2);
  });

  it("an outsider cannot mark a conversation read or met", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    await mkUser("carol");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    signInAs("carol");
    expect((await markConversationReadAction(convo.id)).error).toBeTruthy();
    expect((await markMetAction(convo.id)).error).toBeTruthy();
  });

  it("you cannot start a conversation on your own listing", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("bob");
    const listing = await prisma.listing.create({
      data: {
        sellerId: "bob",
        universityId: uni.id,
        categoryId: cat.id,
        type: "PRODUCT",
        title: "Desk lamp",
        description: "Works great",
        price: 1000,
      },
    });

    signInAs("bob");
    const res = await startConversationAction(listing.id);
    expect(res.error).toBeTruthy();
    expect(res.conversationId).toBeUndefined();
  });
});

describe("admin authorization", () => {
  it("a non-admin cannot suspend a user", async () => {
    const { mkUser } = await seedBase();
    await mkUser("alice"); // plain student
    await mkUser("victim");

    signInAs("alice");
    await expect(adminSetUserSuspendedAction("victim", true)).rejects.toThrow();
    expect((await prisma.user.findUnique({ where: { id: "victim" } }))?.isSuspended).toBe(false);
  });

  it("a signed-out user cannot suspend a user", async () => {
    const { mkUser } = await seedBase();
    await mkUser("victim");
    signInAs(null);
    await expect(adminSetUserSuspendedAction("victim", true)).rejects.toThrow();
  });

  it("an admin can suspend a user", async () => {
    const { mkUser } = await seedBase();
    await mkUser("boss", "ADMIN");
    await mkUser("victim");

    signInAs("boss");
    const res = await adminSetUserSuspendedAction("victim", true);
    expect(res.success).toBe(true);
    expect((await prisma.user.findUnique({ where: { id: "victim" } }))?.isSuspended).toBe(true);
  });
});

describe("admin hide listings", () => {
  it("a non-admin cannot hide a user's listings", async () => {
    const { mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("victim");

    signInAs("alice");
    await expect(adminSetUserListingsHiddenAction("victim", true)).rejects.toThrow();
    expect((await prisma.user.findUnique({ where: { id: "victim" } }))?.listingsHidden).toBe(false);
  });

  it("hiding a user removes their listings from public browse; showing restores them", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("boss", "ADMIN");
    await mkUser("seller");
    await prisma.listing.create({
      data: {
        sellerId: "seller",
        universityId: uni.id,
        categoryId: cat.id,
        type: "PRODUCT",
        title: "Desk lamp",
        description: "x",
        price: 1000,
      },
    });

    expect(await publicListingCount()).toBe(1);

    signInAs("boss");
    await adminSetUserListingsHiddenAction("seller", true);
    expect(await publicListingCount()).toBe(0);
    // Hidden, not deleted — the seller still owns the listing.
    expect(await prisma.listing.count({ where: { sellerId: "seller" } })).toBe(1);

    await adminSetUserListingsHiddenAction("seller", false);
    expect(await publicListingCount()).toBe(1);
  });

  it("suspending a user also hides their listings from public browse", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("boss", "ADMIN");
    await mkUser("seller");
    await prisma.listing.create({
      data: {
        sellerId: "seller",
        universityId: uni.id,
        categoryId: cat.id,
        type: "PRODUCT",
        title: "Desk lamp",
        description: "x",
        price: 1000,
      },
    });

    expect(await publicListingCount()).toBe(1);

    signInAs("boss");
    await adminSetUserSuspendedAction("seller", true);
    expect(await publicListingCount()).toBe(0);
    // Reinstating brings them back — listings were never deleted.
    await adminSetUserSuspendedAction("seller", false);
    expect(await publicListingCount()).toBe(1);
  });
});

describe("account deactivation", () => {
  it("deactivating sets deactivatedAt and redirects", async () => {
    const { mkUser } = await seedBase();
    await mkUser("alice");

    signInAs("alice");
    const redirected = await catchRedirect(() => deactivateAccountAction());
    expect(redirected).toBe("/?deactivated=1");
    const alice = await prisma.user.findUnique({ where: { id: "alice" } });
    expect(alice?.deactivatedAt).not.toBeNull();
  });
});

describe("rate limiting", () => {
  it("allows up to the limit, then blocks", async () => {
    const key = `test:${Date.now()}`;
    const outcomes = [
      await rateLimit(key, 3, 60),
      await rateLimit(key, 3, 60),
      await rateLimit(key, 3, 60),
      await rateLimit(key, 3, 60),
    ];
    expect(outcomes).toEqual([true, true, true, false]);
  });
});

describe("notifications", () => {
  it("mark-all-read only affects the caller's notifications", async () => {
    const { mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    await prisma.notification.createMany({
      data: [
        { userId: "alice", type: "MESSAGE", title: "t", body: "b", linkUrl: "/messages" },
        { userId: "bob", type: "MESSAGE", title: "t", body: "b", linkUrl: "/messages" },
      ],
    });

    signInAs("alice");
    await markAllNotificationsReadAction();
    expect(await prisma.notification.count({ where: { userId: "alice", readAt: null } })).toBe(0);
    expect(await prisma.notification.count({ where: { userId: "bob", readAt: null } })).toBe(1);
  });

  it("a new message notifies the recipient, collapsed to one per conversation", async () => {
    const { uni, cat, mkUser } = await seedBase();
    await mkUser("alice");
    await mkUser("bob");
    const { convo } = await seedConversation("bob", "alice", uni.id, cat.id);

    await notifyNewMessage({ recipientId: "alice", senderName: "Bob", conversationId: convo.id, preview: "hi" });
    await notifyNewMessage({ recipientId: "alice", senderName: "Bob", conversationId: convo.id, preview: "you there?" });

    const notes = await prisma.notification.findMany({ where: { userId: "alice", type: "MESSAGE" } });
    expect(notes).toHaveLength(1);
    expect(notes[0].body).toBe("you there?");
  });

  it("a new listing notifies only same-campus requesters in the same category", async () => {
    const { uni, cat, mkUser } = await seedBase();
    const uni2 = await prisma.university.create({
      data: { name: "Other U", country: "US", city: "X", emailDomain: `o${Date.now()}.edu` },
    });
    const cat2 = await prisma.category.create({
      data: { name: "Bikes", slug: `bikes-${Date.now()}`, icon: "bike", type: "PRODUCT" },
    });
    await mkUser("seller");
    await mkUser("wantMatch"); // same campus + category -> notified
    await mkUser("wantOtherCat"); // same campus, other category -> not
    await mkUser("wantOtherUni"); // same category, other campus -> not

    const wanted = (sellerId: string, universityId: string, categoryId: string) =>
      prisma.listing.create({
        data: {
          sellerId,
          universityId,
          categoryId,
          kind: "WANTED",
          type: "PRODUCT",
          title: "want",
          description: "x",
          price: 0,
        },
      });
    await wanted("wantMatch", uni.id, cat.id);
    await wanted("wantOtherCat", uni.id, cat2.id);
    await wanted("wantOtherUni", uni2.id, cat.id);

    const offer = await prisma.listing.create({
      data: {
        sellerId: "seller",
        universityId: uni.id,
        categoryId: cat.id,
        type: "PRODUCT",
        title: "Nice thing",
        description: "x",
        price: 100,
      },
    });
    await notifyRequestMatches({
      listingId: offer.id,
      listingTitle: offer.title,
      categoryId: cat.id,
      universityId: uni.id,
      sellerId: "seller",
    });

    const count = (id: string) =>
      prisma.notification.count({ where: { userId: id, type: "REQUEST_MATCH" } });
    expect(await count("wantMatch")).toBe(1);
    expect(await count("wantOtherCat")).toBe(0);
    expect(await count("wantOtherUni")).toBe(0);
    expect(await count("seller")).toBe(0);
  });
});
