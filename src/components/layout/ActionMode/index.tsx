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

// Finds whichever element under this screen position actually scrolls.
// ActionModeSurface's own wrapper is display: contents (no box of its own),
// so the backdrop and the real page content end up as siblings, not
// ancestor/descendant - walking up from the backdrop itself can never reach
// the real scroll container. elementsFromPoint instead finds whatever's
// really there visually (ignoring the backdrop's own pointer-events), then
// walks up from that.
function findScrollableAncestor(x: number, y: number): HTMLElement | null {
	const stack = document.elementsFromPoint(x, y);
	let node = stack.find((el) => !el.hasAttribute("data-action-mode-backdrop")) as HTMLElement | null;
	while (node) {
		if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) {
			return node;
		}
		node = node.parentElement;
	}
	return null;
}

interface ActionModeSurfaceProps {
	children: ReactNode;
}

export function ActionModeSurface({ children }: ActionModeSurfaceProps) {
	const [activeMode, setActiveMode] = useState<ActionMode | null>(null);
	const contextValue = useMemo(() => ({ activeMode, setActiveMode }), [activeMode]);
	const touchStartY = useRef<number | null>(null);

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
						// pointer-events: auto makes this hit-tested over the real scroll container, so every way of
						// scrolling needs forwarding by hand - wheel (mouse/trackpad) and touch both find whichever
						// element is really at that screen position and scroll that.
						onWheel={(event) => {
							findScrollableAncestor(event.clientX, event.clientY)?.scrollBy(0, event.deltaY);
						}}
						onTouchStart={(event) => {
							touchStartY.current = event.touches[0]?.clientY ?? null;
						}}
						onTouchMove={(event) => {
							const startY = touchStartY.current;
							const touch = event.touches[0];
							if (startY === null || !touch) return;

							const target = findScrollableAncestor(touch.clientX, touch.clientY);
							if (target) {
								target.scrollBy(0, startY - touch.clientY);
								event.preventDefault();
							}
							touchStartY.current = touch.clientY;
						}}
					/>
				)}
				{children}
			</div>
		</ActionModeContext.Provider>
	);
}

// Narrowed to the native (non-anchor) branch of ButtonProps - every call site is type="button", never an href link.
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

	// While active, this button must clear ActionMode's backdrop, but its ancestor [data-content-nav] needs a lower z-index - portaling a position-synced clone to document.body sidesteps that.
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
			tone={tone ?? (isDelete ? "danger" : "default")}
			className={clsx(
				className,
				styles.actionButton,
				// Actually in delete mode (not just hovered) - keep the bg/border tint on, not just the text.
				isActive && isDelete && "border-[var(--action-delete-border)]! bg-[var(--action-delete-bg)]!",
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
				// Hidden, not removed, while portaled out - keeps its layout space in the manage bar for re-measuring.
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
