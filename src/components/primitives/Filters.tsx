"use client";

import { useURLFilter } from "@/hooks/useURLFilter";
import { Input, InputProps, type InputMode } from "@/components/input";
import { Select, SingleSelectProps } from "@/components/select";
import { inputIconClassName } from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";

interface FilterInputProps extends Omit<InputProps, "value" | "onChange" | "loading" | "mode"> {
	query?: string;
	/** Defaults to "clearable" (an "x" once there's a value, or a spinner while the URL filter is pending). Pass "none" for a plain field with no right-hand behavior at all. */
	mode?: InputMode | "none";
}

export function FilterInput({ query = "search", placeholder = "Search", className, mode = "clearable", filterTrigger, ...props }: FilterInputProps) {
	const { value, isPending, handleChange } = useURLFilter(query, 500);
	const resolvedMode = mode === "none" ? undefined : mode;

	return (
		<Input
			{...props}
			className={className}
			value={value || ""}
			placeholder={placeholder}
			onChange={(e) => handleChange(e.target.value)}
			mode={resolvedMode}
			loading={resolvedMode === "clearable" ? isPending : undefined}
			filterTrigger={resolvedMode === "filter" ? filterTrigger : undefined}
			prefix={<MaskIcon icon="search/search.svg" className={inputIconClassName} />}
		/>
	);
}

const ALL_SENTINEL = "All";

interface FilterSelectProps extends Omit<SingleSelectProps, "value" | "onChange" | "options" | "loading" | "mode"> {
	filter: string;
	options?: Array<Record<string, any>>;
	defaultValue?: string | number | null;
	valueKey?: string;
	labelKey?: string;
	allLabel?: string;
	allValue?: string;
}

export function FilterSelect({
	filter,
	options = [],
	defaultValue,
	valueKey = "id",
	labelKey = "name",
	placeholder,
	allLabel,
	allValue = ALL_SENTINEL,
	className,
	...props
}: FilterSelectProps) {
	const { value, isPending, handleChange } = useURLFilter(filter, 300);

	const allOption = allLabel ? [{ value: allValue, label: allLabel }] : [];

	return (
		<Select
			{...props}
			className={className}
			searchable
			placeholder={placeholder}
			value={value !== null ? value : defaultValue != null ? String(defaultValue) : undefined}
			onChange={(val) => handleChange(val ?? null)}
			loading={isPending}
			options={[
				...allOption,
				...options.map((option) => ({
					value: option[valueKey],
					label: option[labelKey],
				})),
			]}
		/>
	);
}
