"use client";

import { useURLFilter } from "@/hooks/useURLFilter";
import { Input, InputProps } from "@/components/input";
import { Select, SingleSelectProps } from "@/components/select";
import { inputIconClassName } from "@/components/input/styles";
import { MaskIcon } from "@/components/theme/MaskIcon";
import { LoadingOutlined } from "@ant-design/icons";

interface FilterInputProps extends Omit<InputProps, "value" | "onChange"> {
	query?: string;
}

export function FilterInput({ query = "search", placeholder = "Search", className, ...props }: FilterInputProps) {
	const { value, isPending, handleChange } = useURLFilter(query, 500);

	return (
		<Input
			{...props}
			className={className}
			value={value || ""}
			placeholder={placeholder}
			onChange={(e) => handleChange(e.target.value)}
			allowClear
			prefix={<MaskIcon icon="search/search.svg" className={inputIconClassName} />}
			suffix={isPending ? <LoadingOutlined spin /> : null}
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
