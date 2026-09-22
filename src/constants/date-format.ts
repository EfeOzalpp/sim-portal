export const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"] as const;

export function formatShortMonthDay(date: Date | string | null | undefined) {
	if (!date) return undefined;

	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return undefined;

	return `${SHORT_MONTH_NAMES[parsed.getMonth()]} ${parsed.getDate()}`;
}

export function formatShortMonthDayYear(date: Date | string | null | undefined) {
	if (!date) return undefined;

	const parsed = new Date(date);
	const monthDay = formatShortMonthDay(parsed);
	if (!monthDay) return undefined;

	return `${monthDay}, ${parsed.getFullYear()}`;
}
