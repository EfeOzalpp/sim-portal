"use client";

import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { useActionMode } from "@/components/layout/ActionMode";
import { MaskIcon } from "@/theme/MaskIcon";
import { ACTION_MODES } from "@/constants/action-modes";

export default function EditUsersButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.editUsers;

	return (
		<Button
			type="button"
			variant="action"
			className={isActive ? "relative z-[260]" : undefined}
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.editUsers)}
		>
			<MaskIcon icon="edit/edit.svg" className={actionButtonIconClassName} />
			Edit users
		</Button>
	);
}
