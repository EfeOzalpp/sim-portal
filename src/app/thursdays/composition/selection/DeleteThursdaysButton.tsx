"use client";

import { Button } from "@/components/button";
import { useActionMode } from "@/components/layout/ActionMode";
import { ACTION_MODES } from "@/constants/action-modes";

export default function DeleteThursdaysButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.deleteThursdays;

	return (
		<Button
			surface="page"
			type="button"
			variant="tool"
			tone="danger"
			icon="delete/delete.svg"
			className={isActive ? "relative z-[260]" : undefined}
			aria-label="Delete thursdays"
			title="Delete thursdays"
			aria-pressed={isActive}
			data-action-mode-button={ACTION_MODES.deleteThursdays}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.deleteThursdays)}
		/>
	);
}
