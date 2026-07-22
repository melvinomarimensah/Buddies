import { PrismaClient, ListingType } from "@prisma/client";
import { US_UNIVERSITIES } from "./universities";

const prisma = new PrismaClient();

const universities = US_UNIVERSITIES;

const productCategories = [
  { name: "Textbooks", slug: "textbooks", icon: "book-open" },
  { name: "Electronics", slug: "electronics", icon: "laptop" },
  { name: "Furniture", slug: "furniture", icon: "sofa" },
  { name: "Clothing & Accessories", slug: "clothing", icon: "shirt" },
  { name: "Dorm & Kitchen", slug: "dorm-kitchen", icon: "utensils" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", icon: "dumbbell" },
  { name: "Bikes & Scooters", slug: "bikes-scooters", icon: "bike" },
  { name: "Musical Instruments", slug: "musical-instruments", icon: "music" },
  { name: "Tickets", slug: "tickets", icon: "ticket" },
  { name: "Free Stuff & Misc", slug: "free-misc", icon: "gift" },
];

const serviceCategories = [
  { name: "Tutoring", slug: "tutoring", icon: "graduation-cap" },
  { name: "Moving & Hauling", slug: "moving-hauling", icon: "truck" },
  { name: "Tech Help", slug: "tech-help", icon: "wrench" },
  { name: "Photography", slug: "photography", icon: "camera" },
  { name: "Resume & Career", slug: "resume-career", icon: "file-text" },
  { name: "Rides", slug: "rides", icon: "car" },
  { name: "Pet Sitting", slug: "pet-sitting", icon: "paw-print" },
  { name: "Cleaning", slug: "cleaning", icon: "sparkles" },
  { name: "Event Help", slug: "event-help", icon: "calendar" },
];

const seedUsers = [
  { id: "seed-user-ava-chen", username: "ava_chen", fullName: "Ava Chen", domain: "stanford.edu", bio: "CS major, always upgrading my desk setup. DM me for quick meetups near the quad." },
  { id: "seed-user-marcus-reed", username: "marcus_reed", fullName: "Marcus Reed", domain: "berkeley.edu", bio: "Senior econ major clearing out my apartment before graduation." },
  { id: "seed-user-priya-nair", username: "priya_nair", fullName: "Priya Nair", domain: "nyu.edu", bio: "Design student offering tutoring and selling stuff I no longer need." },
  { id: "seed-user-leo-martinez", username: "leo_martinez", fullName: "Leo Martinez", domain: "umich.edu", bio: "Into bikes, guitars, and helping people move dorm rooms." },
];

function placeholderImages(seed: string, count: number) {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/600`);
}

async function main() {
  const createdUniversities = await Promise.all(
    universities.map((u) =>
      prisma.university.upsert({
        where: { emailDomain: u.emailDomain },
        update: {},
        create: u,
      })
    )
  );

  const universityByDomain = new Map(createdUniversities.map((u) => [u.emailDomain, u]));

  const createdProductCategories = await Promise.all(
    productCategories.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { ...c, type: ListingType.PRODUCT },
      })
    )
  );

  const createdServiceCategories = await Promise.all(
    serviceCategories.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { ...c, type: ListingType.SERVICE },
      })
    )
  );

  const categoryBySlug = new Map(
    [...createdProductCategories, ...createdServiceCategories].map((c) => [c.slug, c])
  );

  const createdUsers = await Promise.all(
    seedUsers.map((u) => {
      const university = universityByDomain.get(u.domain)!;
      return prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: `${u.username}@${u.domain}`,
          fullName: u.fullName,
          username: u.username,
          universityId: university.id,
          bio: u.bio,
          isVerified: true,
        },
      });
    })
  );

  const userByUsername = new Map(createdUsers.map((u) => [u.username, u]));

  const listings: Array<{
    sellerUsername: string;
    type: ListingType;
    title: string;
    description: string;
    price: number;
    categorySlug: string;
    condition?: string;
    availability?: string;
    imageSeed: string;
    imageCount: number;
  }> = [
    {
      sellerUsername: "ava_chen",
      type: ListingType.PRODUCT,
      title: "Intro to Algorithms, 4th Edition (CLRS)",
      description: "Lightly used copy from CS161. No highlighting, a few pencil notes in the margins.",
      price: 4500,
      categorySlug: "textbooks",
      condition: "Good",
      imageSeed: "clrs",
      imageCount: 2,
    },
    {
      sellerUsername: "ava_chen",
      type: ListingType.PRODUCT,
      title: "Mechanical Keyboard — Keychron K8",
      description: "Barely used, brown switches. Comes with the original box and a spare cable.",
      price: 6000,
      categorySlug: "electronics",
      condition: "Like new",
      imageSeed: "keychron",
      imageCount: 3,
    },
    {
      sellerUsername: "ava_chen",
      type: ListingType.SERVICE,
      title: "1-on-1 Python & Data Structures Tutoring",
      description: "TA for CS106B offering tutoring sessions. Flexible hours, can meet at the library.",
      price: 3000,
      categorySlug: "tutoring",
      availability: "Weekday evenings",
      imageSeed: "tutoring-ava",
      imageCount: 1,
    },
    {
      sellerUsername: "marcus_reed",
      type: ListingType.PRODUCT,
      title: "IKEA Desk + Chair Bundle",
      description: "Moving out at the end of the semester, need this gone. Pickup only.",
      price: 8000,
      categorySlug: "furniture",
      condition: "Good",
      imageSeed: "desk-chair",
      imageCount: 4,
    },
    {
      sellerUsername: "marcus_reed",
      type: ListingType.PRODUCT,
      title: "Mini Fridge — 3.2 cu ft",
      description: "Worked perfectly all year, just don't need it after graduation.",
      price: 5500,
      categorySlug: "dorm-kitchen",
      condition: "Good",
      imageSeed: "minifridge",
      imageCount: 2,
    },
    {
      sellerUsername: "marcus_reed",
      type: ListingType.PRODUCT,
      title: "Trek Hybrid Bike, Size M",
      description: "Great for campus commuting. New tires this spring, comes with a U-lock.",
      price: 15000,
      categorySlug: "bikes-scooters",
      condition: "Good",
      imageSeed: "trekbike",
      imageCount: 3,
    },
    {
      sellerUsername: "marcus_reed",
      type: ListingType.SERVICE,
      title: "Apartment Move-Out Hauling Help",
      description: "Have a truck, happy to help haul furniture or boxes across town.",
      price: 4000,
      categorySlug: "moving-hauling",
      availability: "Weekends",
      imageSeed: "hauling",
      imageCount: 1,
    },
    {
      sellerUsername: "priya_nair",
      type: ListingType.PRODUCT,
      title: "Wacom Drawing Tablet",
      description: "Used for one design studio class. Works great, includes stylus and case.",
      price: 7000,
      categorySlug: "electronics",
      condition: "Like new",
      imageSeed: "wacom",
      imageCount: 2,
    },
    {
      sellerUsername: "priya_nair",
      type: ListingType.PRODUCT,
      title: "Two Tickets — Spring Concert Series",
      description: "Can't make it anymore, selling at face value. General admission.",
      price: 2500,
      categorySlug: "tickets",
      condition: "New",
      imageSeed: "concert",
      imageCount: 1,
    },
    {
      sellerUsername: "priya_nair",
      type: ListingType.SERVICE,
      title: "Portfolio & Resume Design Help",
      description: "Design student offering resume layout and portfolio site feedback sessions.",
      price: 2000,
      categorySlug: "resume-career",
      availability: "By appointment",
      imageSeed: "resume-help",
      imageCount: 1,
    },
    {
      sellerUsername: "priya_nair",
      type: ListingType.PRODUCT,
      title: "Cozy Throw Blanket + Pillow Set",
      description: "Redecorated my room, this set barely got used. Smoke-free apartment.",
      price: 1800,
      categorySlug: "dorm-kitchen",
      condition: "Like new",
      imageSeed: "throwblanket",
      imageCount: 2,
    },
    {
      sellerUsername: "leo_martinez",
      type: ListingType.PRODUCT,
      title: "Acoustic Guitar — Yamaha FG800",
      description: "Great beginner-to-intermediate guitar. New strings, comes with a gig bag.",
      price: 12000,
      categorySlug: "musical-instruments",
      condition: "Good",
      imageSeed: "guitar",
      imageCount: 3,
    },
    {
      sellerUsername: "leo_martinez",
      type: ListingType.SERVICE,
      title: "Dorm Room Move-In/Move-Out Help",
      description: "Strong back, own dolly. Can help load, unload, and rearrange furniture.",
      price: 3500,
      categorySlug: "moving-hauling",
      availability: "Move-in and move-out weekends",
      imageSeed: "moving-leo",
      imageCount: 1,
    },
    {
      sellerUsername: "leo_martinez",
      type: ListingType.PRODUCT,
      title: "Free: Cardboard Moving Boxes (20+)",
      description: "Just finished unpacking, taking all these off my hands would be a huge favor.",
      price: 0,
      categorySlug: "free-misc",
      condition: "Used",
      imageSeed: "boxes",
      imageCount: 1,
    },
    {
      sellerUsername: "leo_martinez",
      type: ListingType.SERVICE,
      title: "Dog Walking & Pet Sitting",
      description: "Grew up with dogs, happy to walk or sit for your pet during finals week.",
      price: 1500,
      categorySlug: "pet-sitting",
      availability: "Flexible",
      imageSeed: "petsit",
      imageCount: 1,
    },
  ];

  for (const listing of listings) {
    const seller = userByUsername.get(listing.sellerUsername)!;
    const category = categoryBySlug.get(listing.categorySlug)!;

    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        type: listing.type,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        categoryId: category.id,
        condition: listing.condition,
        availability: listing.availability,
        images: placeholderImages(listing.imageSeed, listing.imageCount),
        universityId: seller.universityId!,
      },
    });
  }

  console.log(`Seeded ${createdUniversities.length} universities, ${categoryBySlug.size} categories, ${createdUsers.length} users, ${listings.length} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
