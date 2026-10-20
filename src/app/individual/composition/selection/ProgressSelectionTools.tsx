"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import Popover from "@/components/popover";
import { selectItemVariants, selectOptionCheckboxClassName, selectOptionCheckboxWrapperClassName, selectOptionCheckmarkClassName } from "@/components/select/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import { copyText } from "@/helpers";
import { useSelectedUsers } from "./SelectedUsersProvider";
import { matchingProgressUserIds, PROGRESS_SELECTION_FILTERS, type ProgressSelectionFilter, type ProgressSelectionUser } from "./progress-selection";

const commandClassName = clsx(selectItemVariants({ highlightSelected: false }), "border-0 bg-transparent text-left disabled:cursor-not-allowed disabled:opacity-50");

export default function ProgressSelectionTools({ users }: { users: ProgressSelectionUser[] }) {
	const { selectedUserIds, setSelectedUserIds } = useSelectedUsers();
	const [filters, setFilters] = useState<ProgressSelectionFilter[]>([]);
	const [actionsOpen, setActionsOpen] = useState(false);
	const [copied, setCopied] = useState<"names" | "emails" | null>(null);
	const [copyError, setCopyError] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const matchingIds = useMemo(() => matchingProgressUserIds(users, filters), [users, filters]);
	const selectedUsers = users.filter((user) => selectedUserIds.has(user.id));
	const names = selectedUsers.map((user) => user.name?.trim()).filter((name): name is string => Boolean(name));
	const emails = selectedUsers.map((user) => user.email?.trim()).filter((email): email is string => Boolean(email));

	useEffect(() => {
		if (filters.length > 0 && (matchingIds.size !== selectedUserIds.size || [...matchingIds].some((id) => !selectedUserIds.has(id)))) {
			setFilters([]);
		}
	}, [filters, matchingIds, selectedUserIds]);

	useEffect(() => () => {
		if (resetTimer.current !== null) clearTimeout(resetTimer.current);
	}, []);

	function toggleFilter(value: ProgressSelectionFilter) {
		const next = filters.includes(value) ? filters.filter((filter) => filter !== value) : [...filters, value];
		setFilters(next);
		setSelectedUserIds(matchingProgressUserIds(users, next));
	}

	async function copySelected(kind: "names" | "emails") {
		setCopyError(false);
		try {
			await copyText((kind === "names" ? names : emails).join("\n"));
			if (resetTimer.current !== null) clearTimeout(resetTimer.current);
			setCopied(kind);
			resetTimer.current = setTimeout(() => setCopied(null), 2000);
		} catch {
			setCopyError(true);
		}
	}

	return (
		<>
			<Popover align="start" trigger={
				<Button surface="page" variant="tool" size="small" icon="filter_sort/filter_list.svg" aria-label="Select users by work" title="Select users by work" aria-pressed={filters.length > 0} />
			}>
				<div className="flex min-w-56 max-w-[calc(100vw-1rem)] flex-col gap-0.5">
					{PROGRESS_SELECTION_FILTERS.map((option) => {
						const checked = filters.includes(option.value);
						return (
							<label key={option.value} className={selectItemVariants({ selected: checked, highlightSelected: false })}>
								<span className={selectOptionCheckboxWrapperClassName}>
									<input type="checkbox" checked={checked} onChange={() => toggleFilter(option.value)} className={selectOptionCheckboxClassName} />
									{checked && <MaskIcon icon="check/check.svg" className={selectOptionCheckmarkClassName} />}
								</span>
								{option.label}
							</label>
						);
					})}
				</div>
			</Popover>
			<Popover align="start" open={actionsOpen} onOpenChange={(open) => { setActionsOpen(open); setCopyError(false); setCopied(null); }} trigger={
				<Button
					surface="page" variant="tool" size="small"
					icon={actionsOpen ? "star/star.svg" : selectedUsers.length > 0 ? "star/star_half.svg" : "star/star_border.svg"}
					aria-label="Selected user actions" title="Selected user actions"
					className={clsx("[--button-icon-text:var(--app-text)]", selectedUsers.length === 0 && !actionsOpen && "[--button-icon-text:var(--content-muted)]!")}
				/>
			}>
				<div className="flex min-w-60 max-w-[calc(100vw-1rem)] flex-col gap-0.5" role="menu" aria-label="Selected user actions">
					{(["names", "emails"] as const).map((kind) => (
						<button key={kind} type="button" role="menuitem" className={commandClassName} disabled={(kind === "names" ? names : emails).length === 0} onClick={() => copySelected(kind)}>
							<MaskIcon icon={copied === kind ? "check/check.svg" : "copy/content_copy.svg"} className={actionButtonIconClassName} />
							{kind === "names" ? "Copy names of selected" : "Copy emails of selected"}
						</button>
					))}
					<span className="sr-only" role="status">{copied ? `Selected ${copied} copied` : ""}</span>
					{copyError && <span className="ui-note px-4 text-[var(--tone-danger-text)]" role="alert">Could not copy selection.</span>}
				</div>
			</Popover>
		</>
	);
}
