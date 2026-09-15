"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LoadingOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Input } from "@/components/input";
import { inputIconClassName } from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import {
	selectChevronVariants,
	selectClearButtonClassName,
	selectClearIconClassName,
	selectContentClassName,
	selectContentInModalClassName,
	selectEmptyClassName,
	selectIndicatorsClassName,
	selectItemVariants,
	selectOptionCheckboxClassName,
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
	/** Set when this Select renders inside a ModalPopup, so its dropdown clears the modal's own z-index instead of sitting behind it. */
	inModal?: boolean;
	/** "title": large heading-styled text + the nav-area green, for the page-title bar's semester filter. Defaults to the plain boxed input look with the shared blue "selected" tone. */
	variant?: "default" | "title";
	/** On open, scroll this option into view instead of wherever the list happens to start - e.g. a generated 100-year option list opening at its first entry instead of near the current one. */
	scrollToValueOnOpen?: string;
}

export interface SingleSelectProps extends SharedSelectProps {
	mode?: "single";
	value?: string | null;
	onChange?: (value: string | undefined) => void;
	allowClear?: boolean;
	/** Formats the trigger's own closed-state text differently from the dropdown option list's (e.g. "Semester: Fall 2026" on the trigger, still "FA26" in the list) - the list itself always shows option.label as-is. */
	formatSelectedLabel?: (option: SelectOption) => string;
}

export interface MultiSelectProps extends SharedSelectProps {
	mode: "multiple";
	value?: string[];
	onChange?: (value: string[]) => void;
	/** Tags beyond this count collapse into a "+N" pill. */
	maxTagCount?: number;
	/** Rendered to the left of the search box inside the open dropdown - e.g. a role-filter popover narrowing which options show. */
	filterExtra?: ReactNode;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

function filterOptions(options: SelectOption[], search: string) {
	if (!search) return options;
	const query = search.toLowerCase();
	return options.filter((option) => option.label.toLowerCase().includes(query));
}

// Keeps typing in the search box from also triggering Radix's own type-ahead/roving-focus on the list, while letting Escape/Arrow/Enter bubble up.
function stopTypingPropagation(event: KeyboardEvent) {
	if (event.key !== "Escape" && event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
		event.stopPropagation();
	}
}

function SearchBox({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
}) {
	return (
		<div className={selectSearchWrapperClassName}>
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={stopTypingPropagation}
				placeholder={placeholder ?? "Search"}
				prefix={<MaskIcon icon="search/search.svg" className={inputIconClassName} />}
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
	inModal,
	variant = "default",
	formatSelectedLabel,
	scrollToValueOnOpen,
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

				// A long option list should open scrolled to the current value (or scrollToValueOnOpen, when given), not the top.
				requestAnimationFrame(() => {
					const selector = scrollToValueOnOpen ? `[data-value="${scrollToValueOnOpen}"]` : '[data-selected="true"]';
					viewportRef.current?.querySelector(selector)?.scrollIntoView({ block: "center" });
				});
			}}
		>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={clsx(selectTriggerVariants({ error, variant }), "group", className)}
				>
					<span className={selectedOption ? selectValueClassName : selectPlaceholderClassName}>
						{selectedOption
							? (formatSelectedLabel ? formatSelectedLabel(selectedOption) : selectedOption.label)
							: (placeholder ?? "Select...")}
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
								<span className={selectChevronVariants({ variant })} aria-hidden="true" />
							</>
						)}
					</span>
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className={clsx(selectContentClassName, inModal && selectContentInModalClassName)}
					sideOffset={4}
					align="start"
					style={{ width: "var(--radix-popover-trigger-width)" }}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					{searchable && (
						<SearchBox value={search} onChange={setSearch} placeholder={searchPlaceholder} />
					)}
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
										data-value={option.value}
										tabIndex={option.disabled ? -1 : 0}
										className={selectItemVariants({ selected: isSelected, disabled: option.disabled, variant })}
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
	inModal,
	scrollToValueOnOpen,
	filterExtra,
}: MultiSelectProps) {
	const [search, setSearch] = useState("");
	const error = status === "error";
	const viewportRef = useRef<HTMLDivElement>(null);
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
				if (!open) {
					setSearch("");
					return;
				}

				if (scrollToValueOnOpen) {
					requestAnimationFrame(() => {
						viewportRef.current
							?.querySelector(`[data-value="${scrollToValueOnOpen}"]`)
							?.scrollIntoView({ block: "center" });
					});
				}
			}}
		>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					// py-1.5! over selectTriggerVariants' own py-2.5 - the h-8 tag chips are
					// already taller than a single-select's own text line, so the shared
					// py-2.5 on top of that made this trigger visibly taller than its
					// single-select siblings. pl-2! only kicks in once there's a chip to
					// account for (it carries its own left inset, unlike plain text) -
					// empty, it keeps the same px-3 a single-select's placeholder gets.
					className={clsx(
						selectTriggerVariants({ error }),
						"group min-h-12 flex-wrap py-1.5!",
						selectedOptions.length > 0 && "pl-2!",
						className,
					)}
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
							<span className={selectChevronVariants({ variant: "default" })} aria-hidden="true" />
						)}
					</span>
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className={clsx(selectContentClassName, inModal && selectContentInModalClassName)}
					sideOffset={4}
					align="start"
					style={{ width: "var(--radix-popover-trigger-width)" }}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					{(searchable || filterExtra) && (
						<div className="flex items-center">
							{filterExtra && <div className="py-[0.333rem] pl-[0.333rem]">{filterExtra}</div>}
							{searchable && (
								<div className="min-w-0 flex-1">
									<SearchBox value={search} onChange={setSearch} placeholder={searchPlaceholder} />
								</div>
							)}
						</div>
					)}
					<div ref={viewportRef} className={selectViewportClassName} role="listbox" aria-multiselectable="true">
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
										data-value={option.value}
										tabIndex={option.disabled ? -1 : 0}
										className={selectItemVariants({ selected: isSelected, disabled: option.disabled, highlightSelected: false })}
										onClick={() => !option.disabled && toggle(option.value)}
										onKeyDown={(event) => {
											if ((event.key === "Enter" || event.key === " ") && !option.disabled) {
												event.preventDefault();
												toggle(option.value);
											}
										}}
									>
										<input
											type="checkbox"
											checked={isSelected}
											disabled={option.disabled}
											readOnly
											tabIndex={-1}
											className={selectOptionCheckboxClassName}
										/>
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
