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
			type="button"
			variant="action"
			className="relative z-[260]"
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editGrades)}
		>
			<MaskIcon icon="edit/edit.svg" className={actionButtonIconClassName} />
			Edit grades
		</Button>
	);
}
