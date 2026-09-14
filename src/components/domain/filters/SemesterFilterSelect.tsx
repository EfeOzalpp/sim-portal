"use client";

import { FilterSelect } from "@/components/primitives/Filters";
import {
	ALL_SEMESTERS_VALUE,
	SEMESTER_FILTER_KEY,
	SemesterFilterOption,
	formatSemesterName,
} from "@/components/domain/filters/semester-filter";
import { SingleSelectProps } from "@/components/select";

interface SemesterFilterSelectProps extends Omit<SingleSelectProps, "value" | "onChange" | "options" | "loading" | "mode"> {
	semesters: SemesterFilterOption[];
	defaultValue?: string | null;
	// Individual Performance renders a second one alongside the default people-filter, so the URL param needs to be overridable.
	filterKey?: string;
}

// variant="title"'s closed-trigger text - "Semester: Fall 2026" - the dropdown list underneath still shows the short code.
function formatTitleSelectedLabel(option: { label: string }) {
	return `Semester: ${formatSemesterName(option.label)}`;
}

export default function SemesterFilterSelect({
	semesters,
	defaultValue,
	placeholder = "Select semester",
	filterKey = SEMESTER_FILTER_KEY,
	variant,
	...props
}: SemesterFilterSelectProps) {
	return (
		<FilterSelect
			{...props}
			variant={variant}
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
	);
}
