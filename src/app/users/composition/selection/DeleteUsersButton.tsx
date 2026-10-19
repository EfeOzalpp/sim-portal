"use client";

import clsx from "clsx";
import { Button } from "@/components/button";
import { useActionMode } from "@/components/layout/ActionMode";
import { ACTION_MODES } from "@/constants/action-modes";

export default function DeleteUsersButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.deleteUsers;

	return (
		<Button
			surface="page"
			type="button"
			variant="tool"
			tone="danger"
			icon="delete/delete.svg"
			className={clsx(isActive && "relative z-[260] bg-[var(--action-delete-bg-hover)]!")}
			aria-label="Delete users"
			title="Delete users"
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.deleteUsers)}
		/>
	);
}
