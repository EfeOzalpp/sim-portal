"use client";

import { FilterSelect } from "@/components/primitives/Filters";
import {
	ALL_SEMESTERS_VALUE,
	SEMESTER_FILTER_KEY,
	SemesterFilterOption,
	formatSemesterName,
} from "@/components/domain/filters/semester-filter";
import { SingleSelectProps } from "@/components/select";
import Button from "@/components/button";
import { useIsMobile } from "@/components/layout/breakpoints";
import { usePageChrome } from "@/components/layout/PageChrome";
import { useSearchParams } from "next/navigation";

interface SemesterFilterSelectProps extends Omit<SingleSelectProps, "value" | "onChange" | "options" | "loading" | "mode"> {
	semesters: SemesterFilterOption[];
	defaultValue?: string | null;
	// Individual Performance renders a second one alongside the default people-filter, so the URL param needs to be overridable.
	filterKey?: string;
}

// variant="title"'s closed-trigger text - "Fall 2026 Semester" - the dropdown list underneath still shows the short code.
function formatTitleSelectedLabel(option: { value: string; label: string }) {
	if (option.value === ALL_SEMESTERS_VALUE) return option.label;

	return `${formatSemesterName(option.label)} Semester`;
}

export default function SemesterFilterSelect({
	semesters,
	defaultValue,
	placeholder = "Select semester",
	filterKey = SEMESTER_FILTER_KEY,
	variant,
	trigger,
	dropdownWidth,
	...props
}: SemesterFilterSelectProps) {
	const isMobile = useIsMobile();
	const { isCollapsed } = usePageChrome();
	const searchParams = useSearchParams();
	const iconTrigger = isMobile && variant === "title";
	const selectedValue = searchParams.get(filterKey) ?? defaultValue ?? semesters[0]?.id;
	const selectedSemester = semesters.find((semester) => semester.id === selectedValue);
	const selectedLabel = selectedValue === ALL_SEMESTERS_VALUE
		? "All Semesters"
		: selectedSemester ? formatTitleSelectedLabel({ value: selectedSemester.id, label: selectedSemester.name }) : placeholder;
	return (
		<div className={iconTrigger ? "inline-flex min-w-0 items-center gap-1" : "contents"}>
			{iconTrigger && !isCollapsed && (
				<span className="ui-small max-w-[calc(100vw-13rem)] truncate text-[var(--app-text)]" title={selectedLabel}>
					{selectedLabel}
				</span>
			)}
		<FilterSelect
			{...props}
			variant={variant}
			trigger={iconTrigger ? (
				<Button surface="page" variant="tool" type="button" icon="filter/filter.svg" aria-label="Filter by semester" title="Filter by semester" />
			) : trigger}
			dropdownWidth={iconTrigger ? "min(11rem, calc(100vw - 1rem))" : dropdownWidth}
			formatSelectedLabel={variant === "title" ? formatTitleSelectedLabel : undefined}
			filter={filterKey}
			options={semesters}
			defaultValue={defaultValue || semesters[0]?.id || null}
			valueKey="id"
			labelKey="name"
			placeholder={placeholder}
			allLabel="All Semesters"
			allValue={ALL_SEMESTERS_VALUE}
		/>
		</div>
	);
}
