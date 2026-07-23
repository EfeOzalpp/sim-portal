import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const VIDEO_DATABASE_NAME = "sim_video";
const USER_COUNT = 75;

function assertVideoDatabase() {
  if (process.env.ALLOW_VIDEO_SEED !== "true") {
    throw new Error(
      "Video seed blocked: set ALLOW_VIDEO_SEED=true in .env.video to confirm.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Video seed blocked: DATABASE_URL is missing.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
  } catch {
    throw new Error("Video seed blocked: DATABASE_URL is invalid.");
  }

  if (databaseName !== VIDEO_DATABASE_NAME) {
    throw new Error(
      `Video seed blocked: expected database \"${VIDEO_DATABASE_NAME}\", received \"${databaseName}\".`,
    );
  }
}

assertVideoDatabase();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = [
  "Ari",
  "Bela",
  "Cato",
  "Della",
  "Elio",
  "Fara",
  "Gio",
  "Havi",
  "Iona",
  "Jori",
  "Kiva",
  "Luma",
  "Miro",
  "Nela",
  "Orin",
];

const lastNames = ["Alder", "Brindle", "Cinder", "Dovell", "Evern"];

const pronouns = ["they/them", "she/her", "he/him", "she/they", "he/they"];

const bios = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo vel sapien fermentum consequat.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum, donec ullamcorper nulla non metus auctor.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur. Aenean lacinia bibendum nulla sed consectetur.",
];

const semesterDefinitions = [
  { name: "SP22", start: "2022-01-18", end: "2022-05-15" },
  { name: "FA22", start: "2022-09-01", end: "2022-12-20" },
  { name: "SP23", start: "2023-01-17", end: "2023-05-14" },
  { name: "FA23", start: "2023-09-01", end: "2023-12-20" },
  { name: "SP24", start: "2024-01-16", end: "2024-05-15" },
  { name: "FA24", start: "2024-09-01", end: "2024-12-20" },
  { name: "SP25", start: "2025-01-15", end: "2025-05-15" },
  { name: "FA25", start: "2025-09-01", end: "2025-12-20" },
  { name: "SP26", start: "2026-01-15", end: "2026-05-15" },
  { name: "FA26", start: "2026-09-01", end: "2026-12-20" },
] as const;

const studentSemesterPatterns = [
  ["FA22", "SP23", "FA23", "SP24", "FA24"],
  ["SP23", "FA23", "SP24", "FA24", "SP25"],
  ["FA23", "SP24", "FA24", "SP25", "FA25"],
  ["SP24", "FA24", "SP25", "FA25", "SP26"],
  ["FA24", "SP25", "FA25", "SP26", "FA26"],
  ["SP25", "FA25", "SP26", "FA26"],
  ["FA22", "FA23", "FA24", "FA25"],
  ["SP23", "FA24", "SP25", "FA26"],
  ["FA24", "FA25", "FA26"],
  ["SP22", "FA22", "SP23", "FA23", "SP24", "FA24"],
] as const;

const adminSemesterPatterns = [
  semesterDefinitions.map(({ name }) => name),
  ["FA23", "SP24", "FA24", "SP25", "FA25", "SP26", "FA26"],
  ["FA22", "FA23", "FA24", "FA25", "FA26"],
] as const;

const staffSemesterPatterns = [
  semesterDefinitions.map(({ name }) => name),
  ["FA22", "SP23", "FA23", "SP24", "FA24"],
  ["SP24", "FA24", "SP25", "FA25", "SP26", "FA26"],
  ["FA23", "FA24", "FA25", "FA26"],
  ["SP22", "FA22", "SP24", "FA25", "SP26"],
] as const;

function getRole(index: number): Role {
  if (index <= 2) return Role.ADMIN;
  if (index <= 7) return Role.STAFF;
  return Role.STUDENT;
}

function getSemesterCodes(index: number): readonly string[] {
  const role = getRole(index);

  if (role === Role.ADMIN) return adminSemesterPatterns[index];
  if (role === Role.STAFF) return staffSemesterPatterns[index - 3];

  return studentSemesterPatterns[(index - 8) % studentSemesterPatterns.length];
}

function getMockUsers() {
  const users = firstNames.flatMap((firstName) =>
    lastNames.map((lastName) => ({ firstName, lastName })),
  );

  if (users.length !== USER_COUNT) {
    throw new Error(`Expected ${USER_COUNT} generated users, received ${users.length}.`);
  }

  return users.map(({ firstName, lastName }, index) => {
    const number = String(index + 1).padStart(2, "0");
    const slug = `${firstName}.${lastName}`.toLowerCase();
    const isAdmin = index === 0;

    return {
      name: `${firstName} ${lastName}`,
      email: isAdmin
        ? process.env.VIDEO_ADMIN_EMAIL || `${slug}@example.test`
        : `${slug}@example.test`,
      image: `/mock-avatars/avatar-${String((index % 12) + 1).padStart(2, "0")}.svg`,
      about: bios[index % bios.length],
      pronouns: pronouns[index % pronouns.length],
      link: JSON.stringify([
        `https://example.com/portfolio/${number}`,
        `https://example.com/projects/${number}`,
      ]),
      role: getRole(index),
    };
  });
}

function generateThursdays(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    if (current.getDay() === 4) dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates.map((date, index) => ({
    date,
    name: index % 2 === 0 ? "Big Production" : "Small Production",
    ...(index % 2 === 0
      ? {
          productions: {
            create: [{ name: "Big Production", location: "Pozen Center" }],
          },
        }
      : {}),
  }));
}

async function clearVideoDatabase() {
  await prisma.$transaction([
    prisma.semesterGrade.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.presentation.deleteMany(),
    prisma.production.deleteMany(),
    prisma.thursday.deleteMany(),
    prisma.semester.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  await clearVideoDatabase();

  const semesters = [];
  for (const definition of semesterDefinitions) {
    semesters.push(
      await prisma.semester.create({
        data: {
          name: definition.name,
          thursdays: {
            create: generateThursdays(
              new Date(`${definition.start}T12:00:00Z`),
              new Date(`${definition.end}T12:00:00Z`),
            ),
          },
        },
      }),
    );
  }

  const semesterIds = new Map(
    semesters.map((semester) => [semester.name, semester.id]),
  );

  const users = getMockUsers();
  for (const [index, user] of users.entries()) {
    const connectedSemesters = getSemesterCodes(index).map((name) => {
      const id = semesterIds.get(name);
      if (!id) throw new Error(`Missing generated semester ${name}.`);
      return { id };
    });

    await prisma.user.create({
      data: {
        ...user,
        semesters: {
          connect: connectedSemesters,
        },
      },
    });
  }

  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  const memberships = await prisma.user.findMany({
    select: { semesters: { select: { id: true } } },
  });
  const membershipCounts = memberships.map(({ semesters }) => semesters.length);
  const minimumMemberships = Math.min(...membershipCounts);
  const maximumMemberships = Math.max(...membershipCounts);

  if (minimumMemberships < 2 || maximumMemberships === minimumMemberships) {
    throw new Error("Generated semester memberships are not sufficiently varied.");
  }

  console.log(`Video seed complete: ${users.length} people in ${VIDEO_DATABASE_NAME}.`);
  for (const count of counts) {
    console.log(`${count.role}: ${count._count._all}`);
  }
  console.log(
    `SEMESTERS: ${semesters.length} (${minimumMemberships}-${maximumMemberships} per person)`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
