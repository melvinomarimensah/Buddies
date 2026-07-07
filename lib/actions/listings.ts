"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { createListingSchema, type CreateListingInput } from "@/lib/validations/listing";

export async function createListingAction(input: CreateListingInput) {
  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your listing details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to publish a listing." };
  }

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile?.universityId) {
    return { error: "Add your campus to your profile before publishing a listing." };
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      universityId: profile.universityId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      price: Math.round(parsed.data.price * 100),
      condition: parsed.data.type === "PRODUCT" ? parsed.data.condition : null,
      availability: parsed.data.type === "SERVICE" ? parsed.data.availability : null,
      images: parsed.data.images,
    },
  });

  revalidatePath("/browse");
  revalidatePath("/account");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(listingId: string, input: CreateListingInput) {
  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your listing details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.sellerId !== user.id) {
    return { error: "You can only edit your own listings." };
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      price: Math.round(parsed.data.price * 100),
      condition: parsed.data.type === "PRODUCT" ? parsed.data.condition : null,
      availability: parsed.data.type === "SERVICE" ? parsed.data.availability : null,
      images: parsed.data.images,
    },
  });

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/account");
  redirect(`/listings/${listingId}`);
}

export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.sellerId !== user.id) {
    return { error: "You can only remove your own listings." };
  }

  await prisma.listing.update({ where: { id: listingId }, data: { status: "REMOVED" } });

  revalidatePath("/browse");
  revalidatePath("/account");
  redirect("/account");
}

export async function markListingSoldAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.sellerId !== user.id) {
    return { error: "You can only update your own listings." };
  }

  await prisma.listing.update({ where: { id: listingId }, data: { status: "SOLD" } });

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/account");

  return { success: true };
}
