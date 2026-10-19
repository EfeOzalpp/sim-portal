"use client";

import { useEffect } from "react";
import { useActionMode } from "@/components/layout/ActionMode";
import { ACTION_MODES } from "@/constants/action-modes";

// Rendered as RouteModalPopup's child in page.tsx, outside the inner Suspense
// around EditUserFormContent - the modal's own backdrop/dim/chrome isn't
// gated behind that boundary, so this mounts the instant the modal appears
// (dim included), not whenever the form content behind it finishes loading.
export default function ExitEditModeOnMount() {
	const { activeMode, setActiveMode } = useActionMode();

	useEffect(() => {
		if (activeMode === ACTION_MODES.editUsers) {
			setActiveMode(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
