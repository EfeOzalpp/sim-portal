"use client";

import { useURLFilter } from "@/hooks/useURLFilter";
import { Input } from "@/components/primitives/AntD/Input";
import { Select } from "@/components/primitives/AntD/Select";
import { LoadingOutlined } from "@ant-design/icons";
import { InputProps, SelectProps } from "antd";
import clsx from "clsx";

interface FilterInputProps extends Omit<InputProps, "value" | "onChange"> {
	query?: string;
}

export function FilterInput({ query = "search", placeholder = "Search", className, ...props }: FilterInputProps) {
	const { value, isPending, handleChange } = useURLFilter(query, 500);

	return (
		<Input
			{...props}
			className={clsx("input-search-field", className)}
			value={value || ""}
			placeholder={placeholder}
			onChange={(e) => handleChange(e.target.value)}
			allowClear
			prefix={<span className="input-theme-icon input-search-icon" aria-hidden="true" />}
			suffix={isPending ? <LoadingOutlined spin /> : null}
		/>
	);
}

const ALL_SENTINEL = "All";

interface FilterSelectProps extends Omit<SelectProps, "value" | "onChange" | "options" | "loading"> {
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
	suffixIcon,
	...props
}: FilterSelectProps) {
	const { value, isPending, handleChange } = useURLFilter(filter, 300);

	const allOption = allLabel ? [{ value: allValue, label: allLabel }] : [];

	return (
		<Select
			{...props}
			className={clsx("input-select-field", className)}
			size="large"
			showSearch
			placeholder={placeholder}
			value={value !== null ? value : defaultValue}
			onChange={(val) => handleChange(val as string)}
			loading={isPending}
			suffixIcon={suffixIcon ?? (
				<span className="input-select-arrow" aria-hidden="true">
					<span className="input-theme-icon input-select-arrow-down" />
					<span className="input-theme-icon input-select-arrow-up" />
				</span>
			)}
			options={[
				...allOption,
				...options.map((option) => ({
					value: option[valueKey],
					label: option[labelKey],
				})),
			]}
			style={{ ...props.style }}
		/>
	);
}
