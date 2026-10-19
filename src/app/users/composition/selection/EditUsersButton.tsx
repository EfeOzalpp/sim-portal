"use client";

import { Button } from "@/components/button";
import { useActionMode } from "@/components/layout/ActionMode";
import { ACTION_MODES } from "@/constants/action-modes";

export default function EditUsersButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.editUsers;

	return (
		<Button
			surface="page"
			type="button"
			variant="tool"
			icon="edit/edit.svg"
			className={isActive ? "relative z-[260]" : undefined}
			aria-label="Edit users"
			title="Edit users"
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editUsers)}
		/>
	);
}
