import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { generateThursdayDates } from "../src/constants/semester-calendar";

// Initialize database connection for seeding
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Generate a list of all Thursdays between two dates
function generateSemesterThursdays(startDateStr: string, endDateStr: string) {
  return generateThursdayDates([startDateStr, endDateStr]);
}

// Alternate between Big and Small production days for each Thursday
function getSemesterThursdayName(index: number) {
  return index % 2 === 0 ? "Big Production" : "Small Production";
}

// Create default productions for specific types of production days
function getDefaultProductionsForThursday(name: string) {
  if (name === "Big Production" || name === "Big Production Day") {
    return { create: [{ name: "Big Production", location: "Pozen Center" }] };
  }
  return undefined;
}

// Main seeding logic
async function main() {
  // Clear existing data to ensure a clean state
  await prisma.user.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.thursday.deleteMany();
  await prisma.production.deleteMany();
  await prisma.presentation.deleteMany();

  // Create initial admin user from environment variables
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@example.com";
  const adminName = process.env.INITIAL_ADMIN_NAME || "Admin User";

  const user = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      role: "ADMIN",
    },
  });

  // Initialize the first semester with its associated Thursdays and productions
  const semesterName = process.env.INITIAL_SEMESTER_NAME || "SP25";
  const semesterStart = process.env.INITIAL_SEMESTER_START || "2025-01-01";
  const semesterEnd = process.env.INITIAL_SEMESTER_END || "2025-05-31";

  const thursdayDates = generateSemesterThursdays(semesterStart, semesterEnd);
  const thursdays = thursdayDates.map((date, index) => {
    const name = getSemesterThursdayName(index);
    const defaultProductions = getDefaultProductionsForThursday(name);
    return {
      name,
      date,
      ...(defaultProductions ? { productions: defaultProductions } : {}),
    };
  });

  await prisma.semester.create({
    data: {
      name: semesterName,
      users: {
        connect: { id: user.id },
      },
      thursdays: {
        create: thursdays,
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
