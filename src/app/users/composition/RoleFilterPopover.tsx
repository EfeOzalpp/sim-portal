"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import { ROLES } from "@/constants/roles";
import { ROLE_FILTER_KEY } from "@/constants/filters";

const roleOptions = [
	{ value: ROLES.student, label: "Student" },
	{ value: ROLES.staff, label: "Staff" },
	{ value: ROLES.admin, label: "Admin" },
];

// Small square icon-only trigger, same convention as RepeatableInput's +/- buttons.
const triggerClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-[var(--action-item-bg)] p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";

// selectItemVariants was built for Select's own <div> option rows, which never
// carry a browser default border - a real <button> does, so it needs an
// explicit reset here on top of it. Its own hover (--nav-button-bg-hover) is
// tuned for Select's white dropdown surface - this popover sits on the same
// gray surface a modal does, so its hover needs that token instead.
const optionButtonClassName = "w-full border-0 bg-transparent text-left hover:bg-[var(--modal-button-bg-hover)]!";

export default function RoleFilterPopover() {
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

	function toggleRole(value: string) {
		const nextRoles = selectedRoles.includes(value)
			? selectedRoles.filter((role) => role !== value)
			: [...selectedRoles, value];
		applyRoles(nextRoles);
		setOpen(false);
	}

	return (
		<Popover
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<button type="button" className={triggerClassName} aria-label="Filter by role">
					<MaskIcon icon="filter/filter.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<div className="flex min-w-[9rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pb-1">Role Filter</span>
				<div className="flex flex-col gap-0.5" role="listbox" aria-multiselectable="true">
					<button
						type="button"
						role="option"
						aria-selected={isAllSelected}
						onClick={selectAll}
						className={clsx(selectItemVariants({ selected: isAllSelected }), optionButtonClassName)}
					>
						All
					</button>
					{roleOptions.map((option) => {
						const isSelected = selectedRoles.includes(option.value);
						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => toggleRole(option.value)}
								className={clsx(selectItemVariants({ selected: isSelected }), optionButtonClassName)}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</div>
		</Popover>
	);
}
