"use client";

import { FilterSelect } from "@/components/primitives/Filters";
import {
	ALL_SEMESTERS_VALUE,
	SEMESTER_FILTER_KEY,
	SemesterFilterOption,
} from "@/components/domain/filters/semester-filter";
import { SingleSelectProps } from "@/components/select";

interface SemesterFilterSelectProps extends Omit<SingleSelectProps, "value" | "onChange" | "options" | "loading" | "mode"> {
	semesters: SemesterFilterOption[];
	defaultValue?: string | null;
	// Individual Performance renders a second one of these (WORK_SEMESTER_FILTER_KEY)
	// alongside the default people-filter, so the URL param it reads/writes
	// needs to be overridable rather than always SEMESTER_FILTER_KEY.
	filterKey?: string;
}

export default function SemesterFilterSelect({
	semesters,
	defaultValue,
	placeholder = "Select semester",
	filterKey = SEMESTER_FILTER_KEY,
	...props
}: SemesterFilterSelectProps) {
	return (
		<FilterSelect
			{...props}
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
