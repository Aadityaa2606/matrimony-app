import { PrismaClient, Gender, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample data for generating profiles
const maleFirstNames = [
  "Arjun",
  "Vikram",
  "Rahul",
  "Aditya",
  "Karthik",
  "Rohan",
  "Siddharth",
  "Varun",
  "Pranav",
  "Nikhil",
];

const femaleFirstNames = [
  "Priya",
  "Ananya",
  "Meera",
  "Shreya",
  "Kavya",
  "Pooja",
  "Divya",
  "Sneha",
  "Aishwarya",
  "Riya",
];

const lastNames = [
  "Sharma",
  "Patel",
  "Reddy",
  "Iyer",
  "Nair",
  "Mehta",
  "Gupta",
  "Singh",
  "Kumar",
  "Rao",
];

const locations = [
  "Chennai, Tamil Nadu",
  "Bangalore, Karnataka",
  "Mumbai, Maharashtra",
  "Hyderabad, Telangana",
  "Delhi, NCR",
  "Pune, Maharashtra",
  "Coimbatore, Tamil Nadu",
  "Kochi, Kerala",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
];

const communities = [
  "Brahmin",
  "Kshatriya",
  "Vaishya",
  "Kayastha",
  "Nair",
  "Reddy",
  "Naidu",
  "Iyer",
  "Iyengar",
  "Mudaliar",
];

const educationOptions = [
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree (MD, JD, etc.)",
  "MBA",
];

const professions = [
  "Software Engineer",
  "Doctor",
  "CA/Accountant",
  "Business Analyst",
  "Data Scientist",
  "Product Manager",
  "Lawyer",
  "Civil Engineer",
  "Architect",
  "Bank Manager",
  "Teacher/Professor",
  "Government Employee",
  "Entrepreneur",
];

const heights = [
  "5'4\"",
  "5'5\"",
  "5'6\"",
  "5'7\"",
  "5'8\"",
  "5'9\"",
  "5'10\"",
  "5'11\"",
  "6'0\"",
  "6'1\"",
];

const salaryRanges = [
  "5-10 LPA",
  "10-15 LPA",
  "15-25 LPA",
  "25-40 LPA",
  "40+ LPA",
  null, // Some won't disclose
];

// High-quality placeholder images from Unsplash (professional portraits)
const malePlaceholderPhotos = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1584999734482-0361aecad844?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?w=600&h=800&fit=crop&crop=face",
];

const femalePlaceholderPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&crop=face",
];

// Helper functions
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDateOfBirth(minAge: number, maxAge: number): Date {
  const now = new Date();
  const minYear = now.getFullYear() - maxAge;
  const maxYear = now.getFullYear() - minAge;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

function generatePhoneNumber(): string {
  const prefixes = ["98", "97", "96", "95", "94", "93", "90", "89", "88", "87"];
  const prefix = getRandomElement(prefixes);
  const rest = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return `+91${prefix}${rest}`;
}

async function demo() {
  console.log("🌱 Starting demo seed...\n");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Clearing existing data...");
  await prisma.dismissed.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleared existing data\n");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const defaultPassword = await bcrypt.hash("password123", 12);
  const createdUsers: { id: string; gender: Gender }[] = [];

  // Create 10 male profiles (GROOM)
  console.log("👤 Creating male profiles...");
  for (let i = 0; i < 10; i++) {
    const firstName = maleFirstNames[i];
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const phoneNumber = generatePhoneNumber();

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        passwordHash: defaultPassword,
        displayName: firstName,
        status: UserStatus.ACTIVE,
        approvedAt: now,
        expiresAt,
        payments: {
          create: {
            amountPaise: 50000,
            method: "MANUAL",
            status: "PAID",
            paidAt: now,
          },
        },
        profile: {
          create: {
            fullName,
            gender: Gender.GROOM,
            dateOfBirth: getRandomDateOfBirth(25, 35),
            height: getRandomElement(heights),
            education: getRandomElement(educationOptions),
            profession: getRandomElement(professions),
            salary: getRandomElement(salaryRanges),
            location: getRandomElement(locations),
            community: getRandomElement(communities),
            subCaste:
              Math.random() > 0.5
                ? `Sub-${getRandomElement(communities)}`
                : null,
            hasHoroscope: Math.random() > 0.3,
            parentContact: generatePhoneNumber(),
            profilePhoto: malePlaceholderPhotos[i],
            additionalPhotos: [
              malePlaceholderPhotos[(i + 1) % 10],
              malePlaceholderPhotos[(i + 2) % 10],
            ],
          },
        },
      },
    });

    createdUsers.push({ id: user.id, gender: Gender.GROOM });
    console.log(`  ✅ Created: ${fullName} (${phoneNumber})`);
  }

  // Create 10 female profiles (BRIDE)
  console.log("\n👤 Creating female profiles...");
  for (let i = 0; i < 10; i++) {
    const firstName = femaleFirstNames[i];
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const phoneNumber = generatePhoneNumber();

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        passwordHash: defaultPassword,
        displayName: firstName,
        status: UserStatus.ACTIVE,
        approvedAt: now,
        expiresAt,
        payments: {
          create: {
            amountPaise: 50000,
            method: "MANUAL",
            status: "PAID",
            paidAt: now,
          },
        },
        profile: {
          create: {
            fullName,
            gender: Gender.BRIDE,
            dateOfBirth: getRandomDateOfBirth(22, 32),
            height: heights.slice(0, 6)[Math.floor(Math.random() * 6)], // Generally shorter range
            education: getRandomElement(educationOptions),
            profession: getRandomElement(professions),
            salary: getRandomElement(salaryRanges),
            location: getRandomElement(locations),
            community: getRandomElement(communities),
            subCaste:
              Math.random() > 0.5
                ? `Sub-${getRandomElement(communities)}`
                : null,
            hasHoroscope: Math.random() > 0.3,
            parentContact: generatePhoneNumber(),
            profilePhoto: femalePlaceholderPhotos[i],
            additionalPhotos: [
              femalePlaceholderPhotos[(i + 1) % 10],
              femalePlaceholderPhotos[(i + 2) % 10],
            ],
          },
        },
      },
    });

    createdUsers.push({ id: user.id, gender: Gender.BRIDE });
    console.log(`  ✅ Created: ${fullName} (${phoneNumber})`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log(`   Created ${createdUsers.length} users with profiles`);
  console.log("\n📝 All users have password: password123");
  console.log(
    "   You can log in with any of the phone numbers displayed above.\n",
  );
}

async function superAdmin() {
  const { SUPERADMIN_USERNAME: username, SUPERADMIN_PASSWORD: password } = process.env;
  if (!username || !password) throw new Error("SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD are required");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.staff.upsert({
    where: { username },
    update: { passwordHash, role: "SUPER_ADMIN", active: true },
    create: { username, passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`Upserted SUPER_ADMIN staff: ${username}`);
}

async function main() {
  if (process.env.SEED_DEMO === "1") {
    const host = new URL(process.env.DATABASE_URL ?? "").hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      throw new Error(`SEED_DEMO=1 wipes data and is only allowed on localhost (DATABASE_URL host is "${host}")`);
    }
    await demo();
  }
  await superAdmin();
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
