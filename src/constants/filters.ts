// Single source of truth for the "no semester filter" sentinel - the
// filter value and its display text must stay identical, or filtering breaks.
export const ALL_SEMESTERS_VALUE = "All Semesters";

export function isAllSemestersValue(value?: string | null) {
	return value === ALL_SEMESTERS_VALUE;
}
