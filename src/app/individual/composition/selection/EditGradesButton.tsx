"use client";

import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { useActionMode } from "@/components/layout/ActionMode";
import { MaskIcon } from "@/theme/MaskIcon";
import { ACTION_MODES } from "@/constants/action-modes";

export default function EditGradesButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.editGrades;

	return (
		<Button
			surface="page"
			type="button"
			variant="action"
			tone="cta"
			aria-label="Edit grades"
			title="Edit grades"
			data-action-mode-button={ACTION_MODES.editGrades}
			className={isActive ? "relative z-[260]" : undefined}
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editGrades)}
		>
			<MaskIcon icon="edit/edit.svg" className={actionButtonIconClassName} />
			Edit grades
		</Button>
	);
}
