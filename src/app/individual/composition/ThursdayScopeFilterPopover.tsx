"use client";

import { useState } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { inputFilterTriggerClassName } from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import { useURLFilter } from "@/hooks/useURLFilter";
import { ALL_SEMESTERS_VALUE, THURSDAY_SCOPE_FILTER_KEY, isAllSemestersValue } from "@/components/domain/filters/semester-filter";

interface ThursdayScopeFilterPopoverProps {
	currentSemesterId: string;
}

// selectItemVariants was built for a single-line option row (see
// RoleFilterPopover) - each option here also carries a description line
// underneath, so items-center/py need overriding to a top-aligned column.
const optionButtonClassName =
	"flex w-full flex-col items-start! gap-px border-0 bg-transparent py-2! text-left hover:bg-[var(--modal-button-bg-hover)]!";

const scopeOptions = [
	{
		value: ALL_SEMESTERS_VALUE,
		label: "All",
		description: "Shows all semesters' presentations, productions, and grades of current semester students.",
	},
	{
		value: "current",
		label: "Current",
		description: "Filters presentations, productions, and grades by the current selected semester.",
	},
];

// "Current" vs "All" - which semester's grades/productions/presentations show for the roster (see THURSDAY_SCOPE_FILTER_KEY).
export default function ThursdayScopeFilterPopover({ currentSemesterId }: ThursdayScopeFilterPopoverProps) {
	const [open, setOpen] = useState(false);
	const { value, handleChange } = useURLFilter(THURSDAY_SCOPE_FILTER_KEY, 200);
	const isAll = value === null || isAllSemestersValue(value);

	function select(optionValue: string) {
		handleChange(optionValue === "current" ? currentSemesterId : optionValue);
		setOpen(false);
	}

	return (
		<Popover
			side="right"
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<button type="button" className={inputFilterTriggerClassName} aria-label="Filter by semester scope">
					<MaskIcon icon="filter/filter.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<div className="flex max-w-[16rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pt-0.5 pb-1">Semester Scope</span>
				<div className="flex flex-col gap-0.5" role="listbox">
					{scopeOptions.map((option) => {
						const isSelected = option.value === ALL_SEMESTERS_VALUE ? isAll : !isAll;
						const textClassName = isSelected ? "text-[var(--select-active-text)]" : undefined;

						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => select(option.value)}
								className={clsx(selectItemVariants({ selected: isSelected }), optionButtonClassName)}
							>
								<span className={textClassName}>{option.label}</span>
								<span className={clsx("ui-note", textClassName || "text-[var(--subtle-text)]")}>{option.description}</span>
							</button>
						);
					})}
				</div>
			</div>
		</Popover>
	);
}
