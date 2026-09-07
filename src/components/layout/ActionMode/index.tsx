"use client";

import clsx from "clsx";
import { createContext, ReactNode, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, NativeButtonProps } from "@/components/button";
import styles from "@/components/layout/ActionMode/ActionMode.module.css";
import { ACTION_MODES, DELETE_ACTION_MODES, type ActionMode } from "@/constants/action-modes";

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

interface ActionModeSurfaceProps {
	children: ReactNode;
}

export function ActionModeSurface({ children }: ActionModeSurfaceProps) {
	const [activeMode, setActiveMode] = useState<ActionMode | null>(null);
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
						// pointer-events: auto (see the CSS) means this fixed,
						// full-viewport div is what actually gets hit-tested under
						// the cursor, so wheel scrolling over it needs to be
						// forwarded by hand instead of relying on the browser to
						// chain it to the real scroll container on its own. Which
						// ancestor that is differs per page (usually <main>, but a
						// page can make its own content div scroll instead - see
						// [data-full-bleed-content] in app/layout.module.css), so
						// this walks up looking for one instead of hardcoding it.
						onWheel={(event) => {
							let node = event.currentTarget.parentElement;
							while (node) {
								if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) {
									node.scrollBy(0, event.deltaY);
									return;
								}
								node = node.parentElement;
							}
						}}
					/>
				)}
				{children}
			</div>
		</ActionModeContext.Provider>
	);
}

// Narrowed to the native (non-anchor) branch of ButtonProps: every current
// call site is a plain type="button", never an href link, and that union
// otherwise doesn't play well with spreading unknown rest props onto <Button>.
interface ActionModeButtonProps extends Omit<NativeButtonProps, "onClick"> {
	mode: ActionMode;
	onClick?: NativeButtonProps["onClick"];
}

export function ActionModeButton({
	mode,
	children,
	className,
	onClick,
	tone,
	...props
}: ActionModeButtonProps) {
	const { activeMode, setActiveMode } = useActionModeContext();
	const isActive = activeMode === mode;
	const isDelete = DELETE_ACTION_MODES.includes(mode);
	const shellRef = useRef<HTMLSpanElement>(null);
	const [portalRect, setPortalRect] = useState<DOMRect | null>(null);

	// While active, this button needs to visually clear ActionMode's backdrop
	// (z-[300]) - but it's nested inside [data-content-nav], which itself
	// needs a lower z-index than that to stay correctly dimmed by the
	// backdrop, and a descendant can never outrank where its own ancestor's
	// stacking context sits, no matter its own z-index. Portaling a
	// position-synced clone to document.body sidesteps that: the clone is a
	// true sibling of the backdrop there, free to sit above it.
	useLayoutEffect(() => {
		if (!isActive) {
			setPortalRect(null);
			return;
		}

		function updateRect() {
			if (shellRef.current) {
				setPortalRect(shellRef.current.getBoundingClientRect());
			}
		}

		updateRect();

		window.addEventListener("resize", updateRect);
		window.addEventListener("scroll", updateRect, true);
		const observer = new ResizeObserver(updateRect);
		if (shellRef.current) observer.observe(shellRef.current);

		return () => {
			window.removeEventListener("resize", updateRect);
			window.removeEventListener("scroll", updateRect, true);
			observer.disconnect();
		};
	}, [isActive]);

	const buttonContent = (
		<Button
			{...props}
			tone={tone ?? (isActive && isDelete ? "danger" : "default")}
			className={clsx(
				className,
				styles.actionButton,
				// Signals "this button is destructive" on the ring regardless of
				// whether delete-mode is currently toggled on - unlike `tone`
				// above, which only turns the rest of the button red once active.
				// Same value tone="danger" would already set once isActive is
				// true, so this is a no-op then, not a conflict - just makes the
				// warning visible on focus/press even before you've clicked in.
				isDelete && "focus-visible:outline-[var(--tone-danger-border)]! active:outline-[var(--tone-danger-border)]!",
			)}
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
					className={clsx(styles.actionButtonIcon, isDelete ? styles.deleteIcon : styles.editIcon)}
					aria-hidden="true"
				/>
				<span className={styles.actionButtonText}>{children}</span>
			</span>
		</Button>
	);

	return (
		<>
			<span
				ref={shellRef}
				className={styles.actionButtonShell}
				data-action-mode-button={mode}
				data-action-mode-active={isActive ? "true" : undefined}
				// Hidden rather than removed while portaled out, so it keeps its
				// layout space in the manage bar and stays there to be re-measured.
				style={portalRect ? { visibility: "hidden" } : undefined}
			>
				{buttonContent}
			</span>
			{portalRect &&
				createPortal(
					<span
						className={styles.actionButtonShell}
						data-action-mode-button={mode}
						data-action-mode-active="true"
						style={{
							position: "fixed",
							top: portalRect.top,
							left: portalRect.left,
							width: portalRect.width,
							height: portalRect.height,
						}}
					>
						{buttonContent}
					</span>,
					document.body,
				)}
		</>
	);
}
