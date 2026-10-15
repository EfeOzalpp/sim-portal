import "dotenv/config";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const [mode, planFile] = process.argv.slice(2);
assert(["rehearse", "apply", "rollback"].includes(mode), "Use rehearse/apply/rollback followed by a plan.json path.");
assert(planFile, "A reviewed plan is required.");
const url = new URL(process.env.DATABASE_URL);
assert(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && url.pathname === "/sim", "Restricted to the local development sim database.");
const plan = JSON.parse(await readFile(planFile, "utf8"));
assert.equal(plan.database, "localhost/sim");
if (mode !== "rehearse") assert.equal(plan.unresolved.length, 0, "Resolve the flagged date before applying the plan.");
assert.equal(new Set(plan.entries.map((entry) => entry.id)).size, plan.entries.length, "Duplicate IDs in plan.");
await readFile(plan.backupPath);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const quote = (name) => `"${name.replaceAll('"', '""')}"`;
async function fingerprint() {
	const { rows: tables } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
	const result = {};
	for (const { table_name: name } of tables) {
		const expression = name === "Thursday" ? "to_jsonb(t) - 'date'" : "to_jsonb(t)";
		const { rows } = await client.query(`SELECT ${expression} AS row FROM ${quote(name)} t ORDER BY (${expression})::text`);
		result[name] = { count: rows.length, hash: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
	}
	return result;
}

try {
	await client.connect();
	await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");
	await client.query("SET LOCAL lock_timeout = '5s'");
	await client.query("SET LOCAL statement_timeout = '30s'");
	await client.query('LOCK TABLE "Thursday" IN EXCLUSIVE MODE');
	const before = await fingerprint();
	const { rows } = await client.query('SELECT id,date AT TIME ZONE \'UTC\' AS date,semester_id FROM "Thursday"');
	const stored = new Map(rows.map((row) => [row.id, row]));
	const changes = [];
	for (const entry of plan.entries) {
		const row = stored.get(entry.id);
		assert(row, `Missing Thursday ${entry.id}`);
		assert.equal(row.semester_id, entry.semesterId, `Changed semester for ${entry.id}`);
		const target = new Date(entry.newDate);
		assert.equal(target.getUTCDay(), 4, `Target is not Thursday: ${entry.id}`);
		assert.equal(target.toISOString().slice(11), "00:00:00.000Z", `Target is not UTC midnight: ${entry.id}`);
		const expected = mode === "rollback" ? entry.newDate : entry.oldDate;
		const next = mode === "rollback" ? entry.oldDate : entry.newDate;
		const current = row.date.toISOString();
		if (current === next) continue;
		assert.equal(current, expected, `Date changed since planning: ${entry.id}`);
		changes.push({ id: entry.id, oldDate: current, newDate: next });
		row.date = new Date(next);
	}
	const dates = new Set();
	for (const row of stored.values()) {
		const key = `${row.semester_id}:${row.date.toISOString().slice(0, 10)}`;
		assert(!dates.has(key), `Duplicate semester date: ${key}`);
		dates.add(key);
	}
	for (const change of changes) {
		const result = await client.query('UPDATE "Thursday" SET date=$1::timestamp WHERE id=$2 AND date=$3::timestamp', [change.newDate, change.id, change.oldDate]);
		assert.equal(result.rowCount, 1, `Stale Thursday ${change.id}`);
	}
	assert.deepEqual(await fingerprint(), before, "Non-date data changed; rolling back.");
	for (const change of changes) {
		const { rows: [row] } = await client.query('SELECT date AT TIME ZONE \'UTC\' AS date FROM "Thursday" WHERE id=$1', [change.id]);
		assert.equal(row.date.toISOString(), change.newDate);
	}
	const logPath = path.join(path.dirname(planFile), `${mode}-${Date.now()}.json`);
	await writeFile(logPath, JSON.stringify({ mode, plannedChanges: changes, unchangedData: before }, null, 2));
	await client.query(mode === "rehearse" ? "ROLLBACK" : "COMMIT");
	console.log(JSON.stringify({ mode, changed: changes.length, committed: mode !== "rehearse", unresolved: plan.unresolved.length, logPath, nonDateDataPreserved: true }, null, 2));
} catch (error) {
	await client.query("ROLLBACK").catch(() => {});
	throw error;
} finally {
	await client.end();
}
