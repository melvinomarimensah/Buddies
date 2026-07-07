"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AVATARS_BUCKET,
  LISTING_IMAGES_BUCKET,
} from "@/lib/constants";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

type UploadResult = { url?: string; error?: string };

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/")[1];
  return fromType ?? "jpg";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function uploadListingImageAction(formData: FormData): Promise<UploadResult> {
  const user = await requireUser();
  if (!user) return { error: "You need to be signed in to upload photos." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (!file.type.startsWith("image/")) return { error: "Please upload an image file." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Images must be under 5MB." };

  const admin = createAdminClient();
  const path = `${user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await admin.storage.from(LISTING_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: `Couldn't upload that photo. ${error.message}` };

  const { data } = admin.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadAvatarAction(formData: FormData): Promise<UploadResult> {
  const user = await requireUser();
  if (!user) return { error: "You need to be signed in." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (!file.type.startsWith("image/")) return { error: "Please upload an image file." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Images must be under 5MB." };

  const admin = createAdminClient();
  const path = `${user.id}/avatar.${extensionFor(file)}`;

  const { error } = await admin.storage.from(AVATARS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error) return { error: `Couldn't upload your photo. ${error.message}` };

  const { data } = admin.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return { url: `${data.publicUrl}?t=${Date.now()}` };
}
