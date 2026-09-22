"use client";

import { Alert } from "@/components/alert";
import { useURLFilter } from "@/hooks/useURLFilter";
import { THURSDAY_SCOPE_FILTER_KEY } from "@/components/domain/filters/semester-filter";

interface ScopePillProps {
	currentSemesterId: string;
}

// Only rendered while the Semester Scope popover is set to "All" (see
// individual/page.tsx) - "Current" is the aligned/default state, so it
// doesn't need a pill calling it out. tone="neutral" (not a select tag,
// which reads as a selection chip rather than a status indicator) -
// items-center/py-2 override Alert's own items-start/py-2 the same way
// toast/styles.ts already does for its own single-line case.
export default function ScopePill({ currentSemesterId }: ScopePillProps) {
	const { handleChange } = useURLFilter(THURSDAY_SCOPE_FILTER_KEY, 200);

	return (
		<Alert
			tone="neutral"
			closable
			description="Showing: Full History"
			onClose={() => handleChange(currentSemesterId)}
			className="w-fit items-center! py-2!"
		/>
	);
}
