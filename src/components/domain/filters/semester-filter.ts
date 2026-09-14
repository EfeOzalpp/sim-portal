import { ALL_SEMESTERS_VALUE, isAllSemestersValue } from "@/constants/filters";

export { ALL_SEMESTERS_VALUE, isAllSemestersValue };

export const SEMESTER_FILTER_KEY = "semesterId";
export const LEGACY_SEMESTER_FILTER_KEY = "semester";

// Individual Performance's semester filter: which semester's productions/presentations/grades show for the unfiltered people list. No legacy key - this one's new.
export const THURSDAY_SCOPE_FILTER_KEY = "thursdayScopeId";

export type SemesterFilterOption = {
	id: string;
	name: string;
};

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsLike = Record<string, SearchParamValue>;

export function getSearchParamValue(value: SearchParamValue) {
	return Array.isArray(value) ? value[0] : value;
}

export function getSemesterFilterValue(searchParams: SearchParamsLike, key: string = SEMESTER_FILTER_KEY) {
	return (
		getSearchParamValue(searchParams[key]) ||
		(key === SEMESTER_FILTER_KEY ? getSearchParamValue(searchParams[LEGACY_SEMESTER_FILTER_KEY]) : null) ||
		null
	);
}

// The semester code "right now" defaults to, purely from today's date - Jan-Jul is Spring, Aug-Dec is Fall of the current year.
export function getCurrentSemesterCode(now: Date = new Date()) {
	const year = now.getFullYear() % 100;
	const season = now.getMonth() < 7 ? "SP" : "FA";
	return `${season}${String(year).padStart(2, "0")}`;
}

// Whichever semester matches "now", falling back to the most recent one (index 0) when that doesn't exist yet - e.g. the Thursday Scope toggle's "Current" side.
export function getCurrentSemester(semesters: SemesterFilterOption[]) {
	const currentCode = getCurrentSemesterCode();
	const currentSemester = semesters.find(
		(semester) => normalizeSemesterCode(semester.name) === currentCode,
	);
	return currentSemester || semesters[0] || null;
}

export function getSelectedSemesterId(
	searchParams: SearchParamsLike,
	semesters: SemesterFilterOption[],
	key: string = SEMESTER_FILTER_KEY,
) {
	const filterValue = getSemesterFilterValue(searchParams, key);

	if (isAllSemestersValue(filterValue)) {
		return ALL_SEMESTERS_VALUE;
	}

	if (!filterValue) {
		return getCurrentSemester(semesters)?.id || null;
	}

	const selectedSemester = semesters.find((semester) =>
		semester.id === filterValue || semester.name === filterValue
	);

	return selectedSemester?.id || semesters[0]?.id || null;
}

export function getSelectedSemester(
	searchParams: SearchParamsLike,
	semesters: SemesterFilterOption[],
	key: string = SEMESTER_FILTER_KEY,
) {
	const selectedSemesterId = getSelectedSemesterId(searchParams, semesters, key);

	if (isAllSemestersValue(selectedSemesterId)) {
		return null;
	}

	return semesters.find((semester) => semester.id === selectedSemesterId) || null;
}

// Single source of truth for what a semester code looks like, and how a longer name ("Spring 2026") collapses into one.
function tryParseSemesterCode(name: string) {
	const code = name.match(/^(SP|FA)\d{2}$/i);
	if (code) return name.toUpperCase();

	const namedSemester = name.match(/^(Spring|Fall)\s+(\d{4})$/i);
	if (namedSemester) {
		const term = namedSemester[1].toLowerCase() === "spring" ? "SP" : "FA";
		return `${term}${namedSemester[2].slice(-2)}`;
	}

	return null;
}

// Display: falls back to the original name when it's not a recognized format.
export function formatSemesterCode(name?: string | null) {
	if (!name) return "";

	return tryParseSemesterCode(name) ?? name;
}

// The other direction from formatSemesterCode above: "SP26" -> "Spring 2026" - only the page-title bar's Select (variant="title") reads this long form.
export function formatSemesterName(name?: string | null) {
	if (!name) return "";

	const code = tryParseSemesterCode(name);
	if (!code) return name;

	const season = code.startsWith("SP") ? "Spring" : "Fall";
	const year = 2000 + Number(code.slice(2));
	return `${season} ${year}`;
}

// Matching: falls back to null so unrecognized values don't pass as codes.
export function normalizeSemesterCode(value?: string | null) {
	if (!value) return null;

	return tryParseSemesterCode(value);
}

// SP before FA within the same year, matching getCurrentSemesterCode's own season order above.
export function semesterOrdinal(code: string) {
	const season = code.slice(0, 2);
	const year = Number(code.slice(2));
	return year * 2 + (season === "FA" ? 1 : 0);
}

// The reverse of semesterOrdinal above.
function ordinalToSemesterCode(ordinal: number) {
	const season = ordinal % 2 === 0 ? "SP" : "FA";
	const year = Math.floor(ordinal / 2);
	return `${season}${String(year).padStart(2, "0")}`;
}

// Collapses a list of enrolled semesters into consecutive ranges, with a
// "Break (...)" line inserted between two ranges that aren't adjacent, naming
// the semester(s) actually skipped - e.g. ["FA23", "SP24", "FA24", "SP26"] ->
// ["FA23 to FA24", "Break (SP25 to FA25)", "SP26"].
export function groupSemesterRanges(semesterNames: (string | null | undefined)[]) {
	const ordinals = new Map<number, string>();

	for (const name of semesterNames) {
		const code = normalizeSemesterCode(name);
		if (!code) continue;
		ordinals.set(semesterOrdinal(code), code);
	}

	const sorted = [...ordinals.entries()].sort(([a], [b]) => a - b);
	if (sorted.length === 0) return [];

	const lines: string[] = [];
	let runStartCode = sorted[0][1];
	let [runEndOrdinal, runEndCode] = sorted[0];

	function pushRun() {
		lines.push(runStartCode === runEndCode ? runStartCode : `${runStartCode} to ${runEndCode}`);
	}

	for (let i = 1; i < sorted.length; i++) {
		const [ordinal, code] = sorted[i];

		if (ordinal === runEndOrdinal + 1) {
			[runEndOrdinal, runEndCode] = [ordinal, code];
			continue;
		}

		pushRun();

		const breakStartCode = ordinalToSemesterCode(runEndOrdinal + 1);
		const breakEndCode = ordinalToSemesterCode(ordinal - 1);
		const breakSpan = breakStartCode === breakEndCode ? breakStartCode : `${breakStartCode} to ${breakEndCode}`;
		lines.push(`Break: ${breakSpan}`);

		runStartCode = code;
		[runEndOrdinal, runEndCode] = [ordinal, code];
	}

	pushRun();

	return lines;
}
