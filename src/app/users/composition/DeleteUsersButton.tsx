"use client";

import clsx from "clsx";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { useActionMode } from "@/components/layout/ActionMode";
import { MaskIcon } from "@/theme/MaskIcon";
import { ACTION_MODES } from "@/constants/action-modes";

export default function DeleteUsersButton() {
	const { activeMode, setActiveMode } = useActionMode();
	const isActive = activeMode === ACTION_MODES.deleteUsers;

	return (
		<Button
			type="button"
			variant="action"
			tone="danger"
			className={clsx(isActive && "relative z-[260] border-[var(--action-delete-border)]! bg-[var(--action-delete-bg-hover)]!")}
			aria-pressed={isActive}
			onClick={() => setActiveMode(isActive ? null : ACTION_MODES.deleteUsers)}
		>
			<MaskIcon icon="delete/delete.svg" className={actionButtonIconClassName} />
			Delete users
		</Button>
	);
}
