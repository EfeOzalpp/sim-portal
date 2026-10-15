import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.pathname !== "/sim") {
	throw new Error("This drill is restricted to the local development sim database.");
}
const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, "database/backups/thursday-date-drill", new Date().toISOString().replace(/[:.]/g, "-"));
await mkdir(directory, { recursive: true });
const backupPath = path.join(directory, "before.dump");
const pgEnvironment = {
	...process.env,
	PGHOST: url.hostname,
	PGPORT: url.port || "5432",
	PGUSER: decodeURIComponent(url.username),
	PGPASSWORD: decodeURIComponent(url.password),
	PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
};
const backup = spawnSync("pg_dump", ["--format=custom", "--file", backupPath], { env: pgEnvironment, encoding: "utf8" });
if (backup.error || backup.status !== 0) throw new Error(backup.error?.message || backup.stderr);
const archive = spawnSync("pg_restore", ["--list", backupPath], { encoding: "utf8" });
if (archive.error || archive.status !== 0) throw new Error("Could not read the backup archive.");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
	await client.connect();
	await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
	const { rows } = await client.query('SELECT t.id,t.date AT TIME ZONE \'UTC\' AS date,t.name,t.semester_id,s.name AS semester FROM "Thursday" t LEFT JOIN "Semester" s ON s.id=t.semester_id ORDER BY t.date,t.id');
	const entries = [];
	const unresolved = [];
	for (const row of rows) {
		const target = new Date(row.date);
		target.setUTCHours(0, 0, 0, 0);
		const weekday = target.getUTCDay();
		if (weekday !== 3 && weekday !== 4 && weekday !== 5) {
			unresolved.push({ ...row, date: row.date.toISOString() });
			continue;
		}
		if (weekday === 3) target.setUTCDate(target.getUTCDate() + 1);
		if (weekday === 5) target.setUTCDate(target.getUTCDate() - 1);
		entries.push({
			id: row.id,
			semesterId: row.semester_id,
			semester: row.semester,
			name: row.name,
			oldDate: row.date.toISOString(),
			newDate: target.toISOString(),
			reason: weekday === 3 ? "Wednesday to next Thursday" : weekday === 5 ? "Friday to previous Thursday" : "UTC-midnight normalization; calendar day unchanged",
		});
	}
	await client.query("ROLLBACK");
	const planPath = path.join(directory, "plan.json");
	await writeFile(planPath, JSON.stringify({ database: "localhost/sim", backupPath, entries, unresolved }, null, 2));
	console.log(JSON.stringify({ backupPath, planPath, planned: entries.length, dateShifts: entries.filter((entry) => entry.oldDate.slice(0, 10) !== entry.newDate.slice(0, 10)).length, unresolved }, null, 2));
} finally {
	await client.end();
}
