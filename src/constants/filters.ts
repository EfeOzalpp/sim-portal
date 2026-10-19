// Single source of truth for the "no semester filter" sentinel - the
// filter value and its display text must stay identical, or filtering breaks.
export const ALL_SEMESTERS_VALUE = "All Semesters";

export function isAllSemestersValue(value?: string | null) {
	return value === ALL_SEMESTERS_VALUE;
}

// URL param key for the /users role-filter popover (a multi-value ?role=...&role=... list, no "all" sentinel needed - an empty list already means unfiltered).
export const ROLE_FILTER_KEY = "role";

// URL param key for the /semester sort popover.
export const SEMESTER_SORT_KEY = "semesterSort";
export const SEMESTER_SORT_VALUES = ["recent", "oldest", "enrollmentHigh", "enrollmentLow"] as const;
export type SemesterSortValue = (typeof SEMESTER_SORT_VALUES)[number];
export const DEFAULT_SEMESTER_SORT: SemesterSortValue = "recent";
