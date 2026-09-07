import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";
import crypto from "crypto";
import { Pool } from "pg";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

// Main setup function to initialize environment and database
async function setup() {
  console.log(
    "Welcome to the SIM app!\nLet's set up your developer environment and the database.",
  );

  const envPath = path.join(process.cwd(), ".env");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  // Create .env file from template if it doesn't exist
  if (!fs.existsSync(envPath)) {
    console.log("Creating .env from .env.example...");
    fs.copyFileSync(envExamplePath, envPath);
  }

  let envContent = fs.readFileSync(envPath, "utf-8");

  // Helper to update or append environment variables
  const updateEnv = (key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
    process.env[key] = value;
  };

  // Helper to retrieve environment variable values
  const getEnvValue = (key: string) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
    if (!match) return "";
    return match[1]
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
  };

  // Sync existing .env values with process.env
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const k = key.trim();
      if (k && !k.startsWith("#")) {
        const v = valueParts
          .join("=")
          .trim()
          .replace(/^"(.*)"$/, "$1")
          .replace(/^'(.*)'$/, "$1");
        process.env[k] = v;
      }
    }
  });

  // Admin user configuration for initial database seeding
  let adminEmail = getEnvValue("INITIAL_ADMIN_EMAIL");
  let adminName = getEnvValue("INITIAL_ADMIN_NAME");

  if (!adminEmail || !adminName) {
    console.log(
      "\nAn initial admin user is required to seed the database. Let's set that up.",
    );
    if (!adminEmail) {
      adminEmail = await question("Enter initial admin email: ");
      updateEnv("INITIAL_ADMIN_EMAIL", adminEmail);
    }
    if (!adminName) {
      adminName = await question("Enter initial admin name: ");
      updateEnv("INITIAL_ADMIN_NAME", adminName);
    }
  }

  // Initial semester data setup
  let semesterName = getEnvValue("INITIAL_SEMESTER_NAME");
  let semesterStart = getEnvValue("INITIAL_SEMESTER_START");
  let semesterEnd = getEnvValue("INITIAL_SEMESTER_END");

  if (!semesterName || !semesterStart || !semesterEnd) {
    console.log(
      "\nAn initial semester is required to seed the database. Let's set that up.",
    );
    if (!semesterName) {
      semesterName = await question("Enter semester name (e.g., Fall 2025): ");
      updateEnv("INITIAL_SEMESTER_NAME", semesterName);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!semesterStart) {
      while (!semesterStart || !dateRegex.test(semesterStart)) {
        semesterStart = await question(
          "Enter semester start date (YYYY-MM-DD): ",
        );
        if (!dateRegex.test(semesterStart))
          console.log("⚠️ Invalid date format. Please use YYYY-MM-DD.");
      }
      updateEnv("INITIAL_SEMESTER_START", semesterStart);
    }

    if (!semesterEnd) {
      while (!semesterEnd || !dateRegex.test(semesterEnd)) {
        semesterEnd = await question("Enter semester end date (YYYY-MM-DD): ");
        if (!dateRegex.test(semesterEnd))
          console.log("⚠️ Invalid date format. Please use YYYY-MM-DD.");
      }
      updateEnv("INITIAL_SEMESTER_END", semesterEnd);
    }
  }

  // Generate a secret for NextAuth if one isn't provided
  let nextAuthSecret = getEnvValue("NEXTAUTH_SECRET");
  if (!nextAuthSecret) {
    console.log("\nGenerating NEXTAUTH_SECRET...");
    nextAuthSecret = crypto.randomBytes(32).toString("base64");
    updateEnv("NEXTAUTH_SECRET", nextAuthSecret);
  }

  // Collect Google OAuth credentials for authentication
  let googleId = getEnvValue("AUTH_GOOGLE_ID");
  let googleSecret = getEnvValue("AUTH_GOOGLE_SECRET");

  if (!googleId || !googleSecret) {
    console.log(
      "\nGoogle OAuth credentials are required for the application to start.",
    );
    while (!googleId) {
      googleId = await question("Enter AUTH_GOOGLE_ID: ");
      if (!googleId) console.log("AUTH_GOOGLE_ID is required.");
    }
    updateEnv("AUTH_GOOGLE_ID", googleId);

    while (!googleSecret) {
      googleSecret = await question("Enter AUTH_GOOGLE_SECRET: ");
      if (!googleSecret) console.log("AUTH_GOOGLE_SECRET is required.");
    }
    updateEnv("AUTH_GOOGLE_SECRET", googleSecret);
  }

  // Configure and verify database connection
  let dbUrl = getEnvValue("DATABASE_URL");
  let isConnected = false;

  while (!isConnected) {
    console.log(`\nDatabase URL: ${dbUrl || "Not set"}`);

    if (dbUrl) {
      console.log("Checking database connection...");
      const pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 5000,
      });
      try {
        await pool.query("SELECT 1");
        console.log("✅ Database connection successful!");
        isConnected = true;
        await pool.end();
      } catch (error: any) {
        console.error("❌ Database connection failed:", error.message);
      }
    }

    if (!isConnected) {
      const changeDb = await question(
        "Would you like to (re)enter the DATABASE_URL? (y/n): ",
      );
      if (changeDb.toLowerCase() === "y") {
        const newDbUrl = await question("Enter DATABASE_URL: ");
        if (newDbUrl) {
          dbUrl = newDbUrl;
          updateEnv("DATABASE_URL", dbUrl);
        }
      } else if (dbUrl) {
        const proceedAnyway = await question(
          "Proceed with setup anyway? (y/n): ",
        );
        if (proceedAnyway.toLowerCase() === "y") break;
      } else {
        console.log("DATABASE_URL is required to proceed.");
      }
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n.env file updated.");

  // Run Prisma commands to sync schema and seed data
  console.log("\nSetting up the database...");
  try {
    console.log(
      `\n⚠️  --force-reset PERMANENTLY DELETES ALL DATA in:\n    ${dbUrl}\n`,
    );
    if (!/localhost|127\.0\.0\.1/.test(dbUrl)) {
      console.log(
        "⚠️  This does not look like a local database URL. If this is a shared, staging, or production database, do NOT proceed.\n",
      );
    }
    const confirmReset = await question(
      'Type "reset" to permanently erase this database and continue, or anything else to abort: ',
    );
    rl.close();

    if (confirmReset.trim().toLowerCase() !== "reset") {
      console.log("Aborted - database was not touched.");
      process.exit(1);
    }

    console.log("Synchronizing database schema...");
    execSync("npx prisma db push --force-reset", { stdio: "inherit" });

    console.log("Seeding database...");
    execSync("npx prisma db seed", { stdio: "inherit" });

    console.log(
      "\nSetup complete! You can now run the app with 'npm run dev'.",
    );
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  }
}

setup();
