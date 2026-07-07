import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/**
 * Promote an existing user to ADMIN by email.
 *
 * Usage:
 *   npm run make-admin -- you@example.com
 *
 * The user must have already signed up through the normal flow.
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No account found for ${email}. Have them sign up first, then re-run this.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`${email} is already an admin.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", isVerified: true },
  });

  console.log(`✅ ${email} (@${user.username}) is now an ADMIN.`);
  console.log("They can sign in at /admin/login with their existing credentials.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
