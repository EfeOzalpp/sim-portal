"use client";

import { useState } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
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
	"flex w-full flex-col items-start! gap-px border-0 bg-transparent py-2! text-left hover:bg-[var(--contrast-surface-hovered-item-bg)]!";

const scopeOptions = [
	{
		value: ALL_SEMESTERS_VALUE,
		label: "Full history",
		description: <>Shows <span className="underline underline-offset-2">all</span> semesters' presentations, productions, and grades of current semester students.</>,
	},
	{
		value: "current",
		label: "This semester",
		description: "Filters presentations, productions, and grades by the current selected semester.",
	},
];

// "Current" vs "All" - which semester's grades/productions/presentations show for the roster (see THURSDAY_SCOPE_FILTER_KEY).
export default function ThursdayScopeFilterPopover({ currentSemesterId }: ThursdayScopeFilterPopoverProps) {
	const [open, setOpen] = useState(false);
	const { value, handleChange } = useURLFilter(THURSDAY_SCOPE_FILTER_KEY, 200);
	const isAll = value === null || isAllSemestersValue(value);
	const triggerLabel = isAll ? "Full history" : "This semester";

	function select(optionValue: string) {
		handleChange(optionValue === "current" ? currentSemesterId : optionValue);
		setOpen(false);
	}

	return (
		<Popover
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<Button surface="page" variant="action" type="button" className="group" aria-label={`History scope: ${triggerLabel}`}>
					{triggerLabel}
					<MaskIcon icon="arrow/up.svg" className={clsx(actionButtonIconClassName, "rotate-180 transition-transform duration-150 group-data-[state=open]:rotate-0")} />
				</Button>
			}
		>
			<div className="flex max-w-[16rem] flex-col gap-0.5">
				<span className="ui-label block px-4 pt-0.5 pb-1">History</span>
				<div className="flex flex-col gap-0.5" role="listbox">
					{scopeOptions.map((option) => {
						const isSelected = option.value === ALL_SEMESTERS_VALUE ? isAll : !isAll;

						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => select(option.value)}
								className={clsx(selectItemVariants({ selected: isSelected }), optionButtonClassName)}
							>
								<span>{option.label}</span>
								<span className="ui-note">{option.description}</span>
							</button>
						);
					})}
				</div>
			</div>
		</Popover>
	);
}
