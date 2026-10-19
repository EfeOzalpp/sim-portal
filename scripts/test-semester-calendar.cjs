const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const ts = require("typescript");
const dayjs = require("dayjs");

const root = path.resolve(__dirname, "..");

function load(relativePath) {
	const filename = path.join(root, relativePath);
	const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
		fileName: filename,
		reportDiagnostics: true,
		compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
	});
	assert.equal(result.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0);
	const context = {
		exports: {},
		require: (name) => {
			if (name === "@/helpers") return { normalizeThursdayName: (value) => value };
			return require(name);
		},
	};
	vm.runInNewContext(result.outputText, context, { filename });
	return context.exports;
}

if (!process.argv.includes("--child")) {
	for (const timezone of ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]) {
		const result = spawnSync(process.execPath, [__filename, "--child"], {
			env: { ...process.env, TZ: timezone },
			encoding: "utf8",
		});
		assert.equal(result.status, 0, `${timezone}: ${result.stderr || result.stdout}`);
		console.log(`${timezone}: passed`);
	}
} else {
	const { generateThursdayDates } = load("src/constants/semester-calendar.ts");
	const { formatShortMonthDay, formatShortMonthDayYear } = load("src/constants/date-format.ts");
	const { getSemesterDateRange, transformSemesterPayload } = load("src/app/semester/composition/forms/semester.transformers.ts");
	const { transformThursdayFromAPI, transformThursdayPayload } = load("src/app/thursdays/composition/forms/thursday.transformers.ts");
	const keys = (range) => Array.from(generateThursdayDates(range), (date) => date.toISOString().slice(0, 10));

	assert.deepEqual(keys(["2026-11-01", "2026-11-30"]), ["2026-11-05", "2026-11-12", "2026-11-19", "2026-11-26"]);
	assert.deepEqual(keys(["2024-02-28", "2024-03-07"]), ["2024-02-29", "2024-03-07"]);
	assert.deepEqual(keys(["2026-03-01", "2026-03-19"]), ["2026-03-05", "2026-03-12", "2026-03-19"]);
	assert.deepEqual(keys(["2026-12-31", "2027-01-07"]), ["2026-12-31", "2027-01-07"]);
	assert.deepEqual(keys(["2026-11-05", "2026-11-05"]), ["2026-11-05"]);
	assert.deepEqual(keys(["2026-11-06", "2026-11-06"]), []);
	for (const range of [[], ["invalid", "2026-11-05"], ["2026-11-06", "2026-11-05"], ["2026-02-30", "2026-03-05"]]) {
		assert.deepEqual(keys(range), []);
	}

	const start = new Date("2026-11-01T04:00:00Z");
	const end = new Date("2026-11-30T05:00:00Z");
	assert.deepEqual(keys([start, end]), keys(["2026-11-01", "2026-11-30"]));
	assert.equal(start.toISOString(), "2026-11-01T04:00:00.000Z");

	// Compare every generated day against an independent UTC-day scan.
	for (let year = 2020; year <= 2040; year++) {
		const expected = [];
		for (let timestamp = Date.UTC(year, 0, 1); timestamp < Date.UTC(year + 1, 0, 1); timestamp += 86400000) {
			const date = new Date(timestamp);
			if (date.getUTCDay() === 4) expected.push(date.toISOString().slice(0, 10));
		}
		assert.deepEqual(keys([`${year}-01-01`, `${year}-12-31`]), expected);
	}

	assert.equal(formatShortMonthDay("2026-11-05T00:00:00Z"), "Nov 5");
	assert.equal(formatShortMonthDayYear("2026-12-31T00:00:00Z"), "Dec 31, 2026");
	assert.equal(formatShortMonthDay("invalid"), undefined);
	const range = getSemesterDateRange({ thursdays: [{ date: new Date("2026-11-05T00:00:00Z") }, { date: new Date("2026-11-26T00:00:00Z") }] });
	assert.deepEqual(Array.from(range, (date) => date.format("YYYY-MM-DD")), ["2026-11-05", "2026-11-26"]);
	assert.deepEqual(Array.from(transformSemesterPayload({ dates: [dayjs("2026-11-05"), dayjs("2026-11-26")] }).dates), ["2026-11-05", "2026-11-26"]);
	const draft = transformThursdayFromAPI({ name: "Example", date: "2026-11-05T00:00:00Z", productions: [] });
	assert.equal(draft.date.format("YYYY-MM-DD"), "2026-11-05");
	assert.equal(transformThursdayPayload(draft).date, "2026-11-05");
}
