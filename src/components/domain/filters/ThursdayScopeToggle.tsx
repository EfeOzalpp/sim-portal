"use client";

import clsx from "clsx";
import { useURLFilter } from "@/hooks/useURLFilter";
import { MaskIcon } from "@/theme/MaskIcon";
import { ALL_SEMESTERS_VALUE, THURSDAY_SCOPE_FILTER_KEY, isAllSemestersValue } from "@/components/domain/filters/semester-filter";

interface ThursdayScopeToggleProps {
	currentSemesterId: string;
	filterKey?: string;
}

const segmentClassName =
	"flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 px-3 py-2 font-sans transition-colors";

const activeSegmentClassName = "bg-[var(--action-item-bg)] text-white font-semibold";
const inactiveSegmentClassName =
	"bg-[var(--app-card-bg-hover)] text-[var(--app-text)] hover:brightness-95 dark:bg-[var(--action-item-bg)] dark:opacity-60 dark:hover:opacity-80";
const checkIconClassName = "h-4 w-4 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// "Current" vs "All" - which semester's grades/productions/presentations show for the roster (see THURSDAY_SCOPE_FILTER_KEY). Simpler than the general SemesterFilterSelect since this filter only ever has two real states, not one per semester.
export default function ThursdayScopeToggle({ currentSemesterId, filterKey = THURSDAY_SCOPE_FILTER_KEY }: ThursdayScopeToggleProps) {
	const { value, handleChange } = useURLFilter(filterKey, 200);
	const isAll = value === null || isAllSemestersValue(value);

	return (
		<div className="flex w-full overflow-hidden rounded-full border border-solid border-[var(--button-border)]">
			<button
				type="button"
				aria-pressed={!isAll}
				className={clsx(segmentClassName, !isAll ? activeSegmentClassName : inactiveSegmentClassName)}
				onClick={() => handleChange(currentSemesterId)}
			>
				{!isAll && <MaskIcon icon="check/check.svg" className={checkIconClassName} />}
				Current
			</button>
			<button
				type="button"
				aria-pressed={isAll}
				className={clsx(segmentClassName, isAll ? activeSegmentClassName : inactiveSegmentClassName)}
				onClick={() => handleChange(ALL_SEMESTERS_VALUE)}
			>
				{isAll && <MaskIcon icon="check/check.svg" className={checkIconClassName} />}
				All
			</button>
		</div>
	);
}
