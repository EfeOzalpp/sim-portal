"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LoadingOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Input } from "@/components/input";
import {
	selectChevronClassName,
	selectClearButtonClassName,
	selectClearIconClassName,
	selectContentClassName,
	selectEmptyClassName,
	selectIndicatorsClassName,
	selectItemVariants,
	selectOptionBadgeVariants,
	selectPlaceholderClassName,
	selectSearchWrapperClassName,
	selectSpinnerClassName,
	selectTagClassName,
	selectTagRemoveClassName,
	selectTriggerVariants,
	selectValueClassName,
	selectViewportClassName,
} from "@/components/select/styles";

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SharedSelectProps {
	options: SelectOption[];
	placeholder?: string;
	/** Shows a search box that filters options client-side (antd's showSearch). */
	searchable?: boolean;
	searchPlaceholder?: string;
	disabled?: boolean;
	loading?: boolean;
	status?: "error" | "";
	className?: string;
}

export interface SingleSelectProps extends SharedSelectProps {
	mode?: "single";
	value?: string | null;
	onChange?: (value: string | undefined) => void;
	allowClear?: boolean;
}

export interface MultiSelectProps extends SharedSelectProps {
	mode: "multiple";
	value?: string[];
	onChange?: (value: string[]) => void;
	/** Tags beyond this count collapse into a "+N" pill. */
	maxTagCount?: number;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

function filterOptions(options: SelectOption[], search: string) {
	if (!search) return options;
	const query = search.toLowerCase();
	return options.filter((option) => option.label.toLowerCase().includes(query));
}

// Keeps typing in the search box from also triggering Radix's own
// type-ahead / roving-focus handling on the surrounding list, while still
// letting Escape/Arrow/Enter bubble up to it.
function stopTypingPropagation(event: KeyboardEvent) {
	if (event.key !== "Escape" && event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
		event.stopPropagation();
	}
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (next: string) => void; placeholder?: string }) {
	return (
		<div className={selectSearchWrapperClassName}>
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={stopTypingPropagation}
				placeholder={placeholder ?? "Search..."}
				allowClear
				autoFocus
			/>
		</div>
	);
}

function SingleSelectImpl({
	options,
	value,
	onChange,
	placeholder,
	searchable,
	searchPlaceholder,
	allowClear,
	disabled,
	loading,
	status,
	className,
}: SingleSelectProps) {
	const [search, setSearch] = useState("");
	const [open, setOpen] = useState(false);
	const error = status === "error";
	const filtered = useMemo(() => filterOptions(options, search), [options, search]);
	const selectedOption = options.find((option) => option.value === value);
	const viewportRef = useRef<HTMLDivElement>(null);

	function select(optionValue: string) {
		onChange?.(optionValue);
		setOpen(false);
	}

	return (
		<Popover.Root
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					setSearch("");
					return;
				}

				// Same reasoning as the multi-select viewport: a long option list
				// should open scrolled to the current value, not the top.
				requestAnimationFrame(() => {
					viewportRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
				});
			}}
		>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={clsx(selectTriggerVariants({ error }), "group", className)}
				>
					<span className={selectedOption ? selectValueClassName : selectPlaceholderClassName}>
						{selectedOption ? selectedOption.label : (placeholder ?? "Select...")}
					</span>
					<span className={selectIndicatorsClassName}>
						{loading ? (
							<span className={selectSpinnerClassName}>
								<LoadingOutlined spin />
							</span>
						) : (
							<>
								{allowClear && value && (
									<span
										role="button"
										tabIndex={-1}
										className={selectClearButtonClassName}
										aria-label="Clear"
										onClick={(event) => {
											event.stopPropagation();
											onChange?.(undefined);
										}}
									>
										<span className={selectClearIconClassName} aria-hidden="true" />
									</span>
								)}
								<span className={selectChevronClassName} aria-hidden="true" />
							</>
						)}
					</span>
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className={selectContentClassName}
					sideOffset={4}
					align="start"
					style={{ width: "var(--radix-popover-trigger-width)" }}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					{searchable && <SearchBox value={search} onChange={setSearch} placeholder={searchPlaceholder} />}
					<div ref={viewportRef} className={selectViewportClassName} role="listbox">
						{filtered.length === 0 ? (
							<div className={selectEmptyClassName}>No results</div>
						) : (
							filtered.map((option) => {
								const isSelected = option.value === value;
								return (
									<div
										key={option.value}
										role="option"
										aria-selected={isSelected}
										aria-disabled={option.disabled}
										data-selected={isSelected ? "true" : undefined}
										tabIndex={option.disabled ? -1 : 0}
										className={selectItemVariants({ selected: isSelected, disabled: option.disabled })}
										onClick={() => !option.disabled && select(option.value)}
										onKeyDown={(event) => {
											if ((event.key === "Enter" || event.key === " ") && !option.disabled) {
												event.preventDefault();
												select(option.value);
											}
										}}
									>
										{option.label}
									</div>
								);
							})
						)}
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}

function MultiSelectImpl({
	options,
	value = [],
	onChange,
	placeholder,
	searchable,
	searchPlaceholder,
	disabled,
	loading,
	status,
	className,
	maxTagCount,
}: MultiSelectProps) {
	const [search, setSearch] = useState("");
	const error = status === "error";
	const filtered = useMemo(() => filterOptions(options, search), [options, search]);
	const selectedOptions = useMemo(() => options.filter((option) => value.includes(option.value)), [options, value]);
	const visibleTags = maxTagCount ? selectedOptions.slice(0, maxTagCount) : selectedOptions;
	const overflowCount = selectedOptions.length - visibleTags.length;

	function toggle(optionValue: string) {
		onChange?.(
			value.includes(optionValue)
				? value.filter((current) => current !== optionValue)
				: [...value, optionValue],
		);
	}

	return (
		<Popover.Root
			onOpenChange={(open) => {
				if (!open) setSearch("");
			}}
		>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={clsx(selectTriggerVariants({ error }), "group flex-wrap", className)}
				>
					{selectedOptions.length === 0 ? (
						<span className={selectPlaceholderClassName}>{placeholder ?? "Select..."}</span>
					) : (
						<span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
							{visibleTags.map((option) => (
								<span key={option.value} className={selectTagClassName}>
									<span className="min-w-0 truncate">{option.label}</span>
									<span
										role="button"
										tabIndex={-1}
										className={selectTagRemoveClassName}
										aria-label={`Remove ${option.label}`}
										onClick={(event) => {
											event.stopPropagation();
											toggle(option.value);
										}}
									>
										<span className={selectClearIconClassName} aria-hidden="true" />
									</span>
								</span>
							))}
							{overflowCount > 0 && <span className={selectTagClassName}>+{overflowCount} more</span>}
						</span>
					)}
					<span className={selectIndicatorsClassName}>
						{loading ? (
							<span className={selectSpinnerClassName}>
								<LoadingOutlined spin />
							</span>
						) : (
							<span className={selectChevronClassName} aria-hidden="true" />
						)}
					</span>
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className={selectContentClassName}
					sideOffset={4}
					align="start"
					style={{ width: "var(--radix-popover-trigger-width)" }}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					{searchable && <SearchBox value={search} onChange={setSearch} placeholder={searchPlaceholder} />}
					<div className={selectViewportClassName} role="listbox" aria-multiselectable="true">
						{filtered.length === 0 ? (
							<div className={selectEmptyClassName}>No results</div>
						) : (
							filtered.map((option) => {
								const isSelected = value.includes(option.value);
								return (
									<div
										key={option.value}
										role="option"
										aria-selected={isSelected}
										aria-disabled={option.disabled}
										tabIndex={option.disabled ? -1 : 0}
										className={selectItemVariants({ selected: isSelected, disabled: option.disabled })}
										onClick={() => !option.disabled && toggle(option.value)}
										onKeyDown={(event) => {
											if ((event.key === "Enter" || event.key === " ") && !option.disabled) {
												event.preventDefault();
												toggle(option.value);
											}
										}}
									>
										<span className={selectOptionBadgeVariants({ selected: isSelected })}>
											{isSelected ? "Selected" : "Unselected"}
										</span>
										<span className="min-w-0 flex-1 truncate font-semibold">{option.label}</span>
									</div>
								);
							})
						)}
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}

export function Select(props: SelectProps) {
	if (props.mode === "multiple") {
		return <MultiSelectImpl {...props} />;
	}

	return <SingleSelectImpl {...props} />;
}

export default Select;
