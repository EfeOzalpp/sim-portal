"use client";

import clsx from "clsx";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Button, ButtonProps } from "@/components/primitives/AntD/Button";
import styles from "@/components/layout/ActionMode/ActionMode.module.css";

interface ActionModeContextValue {
	activeMode: string | null;
	setActiveMode: (mode: string | null) => void;
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

interface ActionModeSurfaceProps {
	children: ReactNode;
}

export function ActionModeSurface({ children }: ActionModeSurfaceProps) {
	const [activeMode, setActiveMode] = useState<string | null>(null);
	const contextValue = useMemo(() => ({ activeMode, setActiveMode }), [activeMode]);

	return (
		<ActionModeContext.Provider value={contextValue}>
			<div
				className={styles.surface}
				data-page-content
				data-action-mode={activeMode || undefined}
				data-action-mode-active={activeMode ? "true" : undefined}
				onClickCapture={(event) => {
					if (!activeMode || !(event.target instanceof Element)) {
						return;
					}

					if (event.target.closest("[data-modal-popup]")) {
						return;
					}

					const clickedActiveButton = event.target.closest(`[data-action-mode-button="${activeMode}"]`);
					const clickedModeTarget =
						((activeMode === "edit-users" || activeMode === "delete-users") &&
							event.target.closest('[data-action-mode-target="user-card"]')) ||
						((activeMode === "edit-thursdays" || activeMode === "delete-thursdays") &&
							event.target.closest('[data-action-mode-target="thursday-card"]')) ||
						((activeMode === "edit-semesters" || activeMode === "delete-semesters") &&
							event.target.closest('[data-action-mode-target="semester-card"]')) ||
						(activeMode === "edit-grades" &&
							event.target.closest('[data-action-mode-target="grade-cell"]'));

					if (clickedModeTarget) {
						event.preventDefault();
						return;
					}

					if (!clickedActiveButton) {
						setActiveMode(null);
						event.preventDefault();
						event.stopPropagation();
					}
				}}
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
		</ActionModeContext.Provider>
	);
}

interface ActionModeButtonProps extends Omit<ButtonProps, "onClick"> {
	mode: string;
	onClick?: ButtonProps["onClick"];
}

export function ActionModeButton({
	mode,
	children,
	className,
	onClick,
	...props
}: ActionModeButtonProps) {
	const { activeMode, setActiveMode } = useActionModeContext();
	const isActive = activeMode === mode;

	return (
		<span
			className={styles.actionButtonShell}
			data-action-mode-button={mode}
			data-action-mode-active={isActive ? "true" : undefined}
		>
			<Button
				{...props}
				className={clsx(className, styles.actionButton)}
				aria-pressed={isActive}
				onClick={(event) => {
					onClick?.(event);

					if (!event.defaultPrevented) {
						setActiveMode(isActive ? null : mode);
					}
				}}
			>
					<span className={styles.actionButtonContent}>
						<span
							className={clsx(
								styles.actionButtonIcon,
								mode === "delete-users" || mode === "delete-thursdays" || mode === "delete-semesters" ? styles.deleteIcon : styles.editIcon,
							)}
							aria-hidden="true"
						/>
						<span className={styles.actionButtonText}>{children}</span>
					</span>
			</Button>
		</span>
	);
}
