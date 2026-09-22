"use client";

import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { useActionMode } from "@/components/layout/ActionMode";
import { MaskIcon } from "@/theme/MaskIcon";
import { ACTION_MODES } from "@/constants/action-modes";

export default function EditThursdaysButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.editThursdays;

	return (
		<Button
			type="button"
			variant="action"
			className={isActive ? "relative z-[260]" : undefined}
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editThursdays)}
		>
			<MaskIcon icon="edit/edit.svg" className={actionButtonIconClassName} />
			Edit thursdays
		</Button>
	);
}
