function utcCalendarDate(value: string | Date): Date | null {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	date.setUTCHours(0, 0, 0, 0);
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && date.toISOString().slice(0, 10) !== value) return null;
	return date;
}

export function getThursdayDateStatus(dateKey: string, todayKey: string): "today" | "next" | null {
	const date = utcCalendarDate(dateKey);
	const today = utcCalendarDate(todayKey);
	if (!date || !today || date.getUTCDay() !== 4) return null;
	if (dateKey === todayKey) return "today";
	// A Thursday never marks itself as upcoming; the next one is seven days away.
	today.setUTCDate(today.getUTCDate() + ((4 - today.getUTCDay() + 7) % 7 || 7));
	return dateKey === today.toISOString().slice(0, 10) ? "next" : null;
}

// Calendar days are stored at UTC midnight, independent of server timezone/DST.
export function generateThursdayDates(dateRange: readonly (string | Date)[]): Date[] {
	if (dateRange.length !== 2) return [];
	const first = utcCalendarDate(dateRange[0]);
	const last = utcCalendarDate(dateRange[1]);
	if (!first || !last || first > last) return [];

	first.setUTCDate(first.getUTCDate() + ((4 - first.getUTCDay() + 7) % 7));
	const dates: Date[] = [];
	while (first <= last) {
		dates.push(new Date(first));
		first.setUTCDate(first.getUTCDate() + 7);
	}
	return dates;
}
