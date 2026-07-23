import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const envPath = resolve(projectRoot, ".env.video");

function parseEnvFile(contents) {
  const values = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

let videoEnv;
try {
  videoEnv = parseEnvFile(readFileSync(envPath, "utf8"));
} catch {
  console.error("Missing .env.video. Copy .env.video.example to .env.video first.");
  process.exit(1);
}

const databaseUrl = videoEnv.DATABASE_URL;
let databaseName = "";
try {
  databaseName = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
} catch {
  console.error("Invalid DATABASE_URL in .env.video.");
  process.exit(1);
}

if (databaseName !== "sim_video") {
  console.error(
    `Video command blocked: .env.video points to "${databaseName}", not "sim_video".`,
  );
  process.exit(1);
}

const commands = {
  dev: [resolve(projectRoot, "node_modules/next/dist/bin/next"), "dev", "--turbopack"],
  push: [resolve(projectRoot, "node_modules/prisma/build/index.js"), "db", "push"],
  seed: [
    "-r",
    "ts-node/register",
    resolve(projectRoot, "database/seed-video.ts"),
  ],
};

const command = commands[process.argv[2]];
if (!command) {
  console.error("Usage: node scripts/run-video.mjs <dev|push|seed>");
  process.exit(1);
}

const result = spawnSync(process.execPath, command, {
  cwd: projectRoot,
  env: { ...process.env, ...videoEnv },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
