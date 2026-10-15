"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
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
// explicit reset here on top of it. Its hover token is shared by Select
// dropdowns and page popovers.
const optionButtonClassName = "flex w-full items-center justify-between gap-3 border-0 bg-transparent text-left hover:bg-[var(--contrast-surface-hovered-item-bg)]!";

function optionCountClassName(selected: boolean) {
	return selected ? "text-[var(--select-active-text)]" : "text-inherit";
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
	const triggerLabel = isAllSelected ? "All roles" : (roleOptions.find((option) => option.value === selectedRoles[0])?.label ?? "All roles");

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
				<Button surface="page" variant="action" type="button" className="group" aria-label={`Filter by role: ${triggerLabel}`}>
					{triggerLabel}
					<MaskIcon icon="arrow/up.svg" className={clsx(actionButtonIconClassName, "rotate-180 transition-transform duration-150 group-data-[state=open]:rotate-0")} />
				</Button>
			}
		>
			<div className="flex min-w-[9rem] flex-col gap-0.5">
				<span className="ui-label block px-4 pt-0.5 pb-1">Filter by role</span>
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
