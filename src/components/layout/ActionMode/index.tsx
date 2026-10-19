"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import styles from "@/components/layout/ActionMode/ActionMode.module.css";
import { ACTION_MODES, type ActionMode } from "@/constants/action-modes";

interface ActionModeContextValue {
	activeMode: ActionMode | null;
	setActiveMode: (mode: ActionMode | null) => void;
}

const ActionModeContext = createContext<ActionModeContextValue | null>(null);

function useActionModeContext() {
	const context = useContext(ActionModeContext);

	if (!context) {
		throw new Error("ActionMode components must be rendered inside ActionModeSurface.");
	}

	return context;
}

export function useActionMode() {
	return useActionModeContext();
}

export function useOptionalActionMode() {
	return useContext(ActionModeContext) ?? {
		activeMode: null,
		setActiveMode: () => {},
	};
}

interface ActionModeSurfaceProps {
	children: ReactNode;
}

export function ActionModeProvider({ children }: ActionModeSurfaceProps) {
	const [activeMode, setActiveMode] = useState<ActionMode | null>(null);
	const contextValue = useMemo(() => ({ activeMode, setActiveMode }), [activeMode]);

	return (
		<ActionModeContext.Provider value={contextValue}>
			{children}
		</ActionModeContext.Provider>
	);
}

export function ActionModePageContent({ children }: ActionModeSurfaceProps) {
	const { activeMode, setActiveMode } = useActionMode();

	useEffect(() => {
		if (!activeMode) return;

		let pointerStart: { x: number; y: number } | null = null;
		let dragged = false;
		const onPointerDown = (event: PointerEvent) => {
			pointerStart = { x: event.clientX, y: event.clientY };
			dragged = false;
		};
		const onPointerMove = (event: PointerEvent) => {
			if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) {
				dragged = true;
			}
		};
		const markDragged = () => {
			dragged = true;
		};
		const onClick = (event: MouseEvent) => {
			// Modals own dismissal and may portal their dropdowns outside the dialog.
			if (!(event.target instanceof Element) || document.querySelector("[data-modal-popup]")) return;
			// A swipe or scrollbar drag must neither dismiss action mode nor activate an item.
			if (dragged && event.detail > 0) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}

			const clickedActiveButton = event.target.closest(`[data-action-mode-button="${activeMode}"]`);
			const clickedModeTarget =
				((activeMode === ACTION_MODES.editUsers || activeMode === ACTION_MODES.deleteUsers) &&
					event.target.closest('[data-action-mode-target="user-card"]')) ||
				((activeMode === ACTION_MODES.editThursdays || activeMode === ACTION_MODES.deleteThursdays) &&
					event.target.closest('[data-action-mode-target="thursday-card"]')) ||
				((activeMode === ACTION_MODES.editSemesters || activeMode === ACTION_MODES.deleteSemesters) &&
					event.target.closest('[data-action-mode-target="semester-card"]')) ||
				(activeMode === ACTION_MODES.editGrades &&
					event.target.closest('[data-action-mode-target="grade-cell"]'));

			if (clickedModeTarget) {
				event.preventDefault();
			} else if (!clickedActiveButton) {
				setActiveMode(null);
				event.preventDefault();
				event.stopPropagation();
			}
		};

		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("pointermove", onPointerMove, true);
		document.addEventListener("pointercancel", markDragged, true);
		document.addEventListener("scroll", markDragged, true);
		document.addEventListener("click", onClick, true);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("pointermove", onPointerMove, true);
			document.removeEventListener("pointercancel", markDragged, true);
			document.removeEventListener("scroll", markDragged, true);
			document.removeEventListener("click", onClick, true);
		};
	}, [activeMode, setActiveMode]);

	return (
		<div
			className={styles.surface}
			data-page-content
			data-action-mode={activeMode || undefined}
			data-action-mode-active={activeMode ? "true" : undefined}
		>
			{activeMode && (
				<div
					className={styles.backdrop}
					data-action-mode-backdrop
					aria-hidden="true"
				/>
			)}
			{children}
		</div>
	);
}

export function ActionModeSurface({ children }: ActionModeSurfaceProps) {
	return (
		<ActionModeProvider>
			<ActionModePageContent>
				{children}
			</ActionModePageContent>
		</ActionModeProvider>
	);
}
