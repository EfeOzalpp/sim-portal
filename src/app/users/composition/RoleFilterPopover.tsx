"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { inputFilterTriggerClassName } from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import { ROLES } from "@/constants/roles";
import { ROLE_FILTER_KEY } from "@/constants/filters";

const roleOptions = [
	{ value: ROLES.student, label: "Student" },
	{ value: ROLES.staff, label: "Staff" },
	{ value: ROLES.admin, label: "Admin" },
];

// selectItemVariants was built for Select's own <div> option rows, which never
// carry a browser default border - a real <button> does, so it needs an
// explicit reset here on top of it. Its own hover (--nav-button-bg-hover) is
// tuned for Select's white dropdown surface - this popover sits on the same
// gray surface a modal does, so its hover needs that token instead.
const optionButtonClassName = "flex w-full items-center justify-between gap-3 border-0 bg-transparent text-left hover:bg-[var(--modal-button-bg-hover)]!";

// Muted at rest, matches the label's own --select-active-text once selected -
// same token Select's own selected-option row uses, on both sides here
// instead of the count staying gray while the label changes weight.
function optionCountClassName(selected: boolean) {
	return selected ? "text-[var(--select-active-text)]" : "text-[var(--content-muted)]";
}

interface RoleFilterPopoverProps {
	/** { all, STUDENT, STAFF, ADMIN } - respects the current search+semester filters, but never the role filter itself. */
	counts?: Record<string, number>;
}

export default function RoleFilterPopover({ counts }: RoleFilterPopoverProps) {
	const [open, setOpen] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const [, startTransition] = useTransition();
	const selectedRoles = searchParams.getAll(ROLE_FILTER_KEY);
	const isAllSelected = selectedRoles.length === 0;

	function applyRoles(nextRoles: string[]) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete(ROLE_FILTER_KEY);
		nextRoles.forEach((role) => params.append(ROLE_FILTER_KEY, role));

		startTransition(() => {
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		});
	}

	// Closes on every pick, by design - picking more than one role means
	// reopening between clicks, not staying open for a multi-pick session.
	function selectAll() {
		applyRoles([]);
		setOpen(false);
	}

	// Single-select, not a toggle - picking a role always replaces whatever
	// was selected before, it never accumulates into a multi-role filter.
	function selectRole(value: string) {
		applyRoles([value]);
		setOpen(false);
	}

	return (
		<Popover
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<button type="button" className={inputFilterTriggerClassName} aria-label="Filter by role">
					<MaskIcon icon="filter/filter.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<div className="flex min-w-[9rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pt-0.5 pb-1">Filter by role</span>
				<div className="flex flex-col gap-0.5" role="listbox">
					<button
						type="button"
						role="option"
						aria-selected={isAllSelected}
						onClick={selectAll}
						className={clsx(selectItemVariants({ selected: isAllSelected }), optionButtonClassName)}
					>
						<span className={isAllSelected ? "text-[var(--select-active-text)]" : undefined}>All</span>
						{counts && <span className={optionCountClassName(isAllSelected)}>{counts.all}</span>}
					</button>
					{roleOptions.map((option) => {
						const isSelected = selectedRoles.includes(option.value);
						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => selectRole(option.value)}
								className={clsx(selectItemVariants({ selected: isSelected }), optionButtonClassName)}
							>
								<span className={isSelected ? "text-[var(--select-active-text)]" : undefined}>{option.label}</span>
								{counts && <span className={optionCountClassName(isSelected)}>{counts[option.value]}</span>}
							</button>
						);
					})}
				</div>
			</div>
		</Popover>
	);
}
