"use client";

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
			className={isActive ? "relative z-[260]" : undefined}
			aria-label="Delete users"
			title="Delete users"
			aria-pressed={isActive}
			data-action-mode-button={ACTION_MODES.deleteUsers}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.deleteUsers)}
		/>
	);
}
