import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

/**
 * Create a dedicated admin account in Supabase Auth AND the database.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Reads credentials from env (falls back to sensible defaults):
 *   ADMIN_EMAIL      (default: admin@buddies.app)
 *   ADMIN_PASSWORD   (default: a strong random password, printed once)
 *   ADMIN_USERNAME   (default: admin)
 *   ADMIN_FULL_NAME  (default: Buddies Admin)
 *
 * This is intentionally separate from `prisma db seed` so an admin is never
 * auto-created on a normal reseed. It needs the service-role key.
 */
const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Add your Supabase values to .env first.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const email = (process.env.ADMIN_EMAIL ?? "admin@buddies.app").trim().toLowerCase();
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const fullName = process.env.ADMIN_FULL_NAME ?? "Buddies Admin";
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD ?? `Bud-${randomBytes(9).toString("base64url")}`;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Reuse an existing auth user with this email if present, otherwise create one.
  let authUserId: string | null = null;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (created?.user) {
    authUserId = created.user.id;
  } else if (createError && /already/i.test(createError.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    authUserId = list.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (authUserId && !generated) {
      await admin.auth.admin.updateUserById(authUserId, { password });
    }
  } else if (createError) {
    console.error(`Couldn't create the auth user: ${createError.message}`);
    process.exit(1);
  }

  if (!authUserId) {
    console.error("Couldn't resolve the admin auth user id.");
    process.exit(1);
  }

  await prisma.user.upsert({
    where: { id: authUserId },
    update: { role: "ADMIN", isVerified: true, email, username, fullName },
    create: { id: authUserId, email, username, fullName, role: "ADMIN", isVerified: true },
  });

  console.log("✅ Admin account ready.");
  console.log(`   Email:    ${email}`);
  if (generated) {
    console.log(`   Password: ${password}   (generated — save this now, it won't be shown again)`);
  } else {
    console.log("   Password: (from ADMIN_PASSWORD in your .env)");
  }
  console.log("   Sign in at /admin/login");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
