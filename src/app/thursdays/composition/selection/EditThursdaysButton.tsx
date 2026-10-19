"use client";

import { Button } from "@/components/button";
import { useActionMode } from "@/components/layout/ActionMode";
import { ACTION_MODES } from "@/constants/action-modes";

export default function EditThursdaysButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.editThursdays;

	return (
		<Button
			surface="page"
			type="button"
			variant="tool"
			icon="edit/edit.svg"
			className={isActive ? "relative z-[260]" : undefined}
			aria-label="Edit thursdays"
			title="Edit thursdays"
			aria-pressed={isActive}
			data-action-mode-button={ACTION_MODES.editThursdays}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editThursdays)}
		/>
	);
}
