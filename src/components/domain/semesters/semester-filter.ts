import { ALL_SEMESTERS_VALUE, isAllSemestersValue } from "@/constants/filters";

export { ALL_SEMESTERS_VALUE, isAllSemestersValue };

export const SEMESTER_FILTER_KEY = "semesterId";
export const LEGACY_SEMESTER_FILTER_KEY = "semester";

export type SemesterFilterOption = {
	id: string;
	name: string;
};

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsLike = Record<string, SearchParamValue>;

export function getSearchParamValue(value: SearchParamValue) {
	return Array.isArray(value) ? value[0] : value;
}

export function getSemesterFilterValue(searchParams: SearchParamsLike) {
	return (
		getSearchParamValue(searchParams[SEMESTER_FILTER_KEY]) ||
		getSearchParamValue(searchParams[LEGACY_SEMESTER_FILTER_KEY]) ||
		null
	);
}

export function getSelectedSemesterId(
	searchParams: SearchParamsLike,
	semesters: SemesterFilterOption[],
) {
	const filterValue = getSemesterFilterValue(searchParams);

	if (isAllSemestersValue(filterValue)) {
		return ALL_SEMESTERS_VALUE;
	}

	if (!filterValue) {
		return semesters[0]?.id || null;
	}

	const selectedSemester = semesters.find((semester) =>
		semester.id === filterValue || semester.name === filterValue
	);

	return selectedSemester?.id || semesters[0]?.id || null;
}

export function getSelectedSemester(
	searchParams: SearchParamsLike,
	semesters: SemesterFilterOption[],
) {
	const selectedSemesterId = getSelectedSemesterId(searchParams, semesters);

	if (isAllSemestersValue(selectedSemesterId)) {
		return null;
	}

	return semesters.find((semester) => semester.id === selectedSemesterId) || null;
}

// Single source of truth for what a semester code ("SP26", "FA25", ...) looks
// like and how a longer name ("Spring 2026") collapses into one.
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

// Matching: falls back to null so unrecognized values don't pass as codes.
export function normalizeSemesterCode(value?: string | null) {
	if (!value) return null;

	return tryParseSemesterCode(value);
}
