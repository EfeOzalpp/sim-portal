"use client";

import { FilterSelect } from "@/components/primitives/Filters";
import {
	ALL_SEMESTERS_VALUE,
	SEMESTER_FILTER_KEY,
	SemesterFilterOption,
} from "@/components/domain/semesters/semester-filter";
import { SelectProps } from "antd";

interface SemesterFilterSelectProps extends Omit<SelectProps, "value" | "onChange" | "options" | "loading"> {
	semesters: SemesterFilterOption[];
	defaultValue?: string | null;
}

export default function SemesterFilterSelect({
	semesters,
	defaultValue,
	placeholder = "Select semester",
	...props
}: SemesterFilterSelectProps) {
	return (
		<FilterSelect
			{...props}
			filter={SEMESTER_FILTER_KEY}
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
