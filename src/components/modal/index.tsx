"use client";

import { ReactNode, createContext, useContext, useCallback, useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";
import { createPortal } from "react-dom";
import closeIcon from "@/theme/assets/close/close.svg";
import { ModalCloseGuardProvider, type ModalCloseGuardState } from "@/components/modal/CloseGuard";
import {
	modalBackdropClassName,
	modalBodyClassName,
	modalCloseButtonClassName,
	modalCloseGuardActionsClassName,
	modalCloseGuardOverlayClassName,
	modalCloseIconClassName,
	modalDialogClassName,
	modalDialogDefaultWidthClassName,
	modalHeaderClassName,
	modalHeaderMinimalClassName,
	modalTitleClassName,
} from "@/components/modal/styles";

const ModalNestingContext = createContext(false);

interface ModalPopupProps {
	triggerLabel?: ReactNode;
	title: ReactNode;
	children: ReactNode;
	triggerClassName?: string;
	dialogClassName?: string;
	minimalHeader?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function ModalPopup({
	triggerLabel,
	title,
	children,
	triggerClassName,
	dialogClassName,
	minimalHeader = false,
	open,
	defaultOpen = false,
	onOpenChange,
}: ModalPopupProps) {
	const isNested = useContext(ModalNestingContext);
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const [isMounted, setIsMounted] = useState(false);
	const [guardState, setGuardState] = useState<ModalCloseGuardState | null>(null);
	const [showCloseGuard, setShowCloseGuard] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);
	const titleId = useId();
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;
	const setIsOpen = useCallback(
		(nextOpen: boolean) => {
			if (!isControlled) {
				setInternalOpen(nextOpen);
			}

			onOpenChange?.(nextOpen);
		},
		[isControlled, onOpenChange],
	);

	// A backdrop click goes through here - the header's own "x" always closes
	// directly, no guard, since that's a deliberate "I'm done" click rather
	// than an easy-to-fat-finger click just outside the dialog.
	function requestClose() {
		if (guardState?.isDirty) {
			setShowCloseGuard(true);
			return;
		}

		setIsOpen(false);
	}

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			setShowCloseGuard(false);
			setHasScrolled(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const html = document.documentElement;
		const body = document.body;
		const previousHtmlOverflow = html.style.overflow;
		const previousBodyOverflow = body.style.overflow;

		html.style.overflow = "hidden";
		body.style.overflow = "hidden";

		return () => {
			html.style.overflow = previousHtmlOverflow;
			body.style.overflow = previousBodyOverflow;
		};
	}, [isOpen]);

	const modal = (
		<div
			className={modalBackdropClassName}
			data-modal-popup
			role="presentation"
			onWheel={(event) => event.stopPropagation()}
			onTouchMove={(event) => event.stopPropagation()}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					requestClose();
				}
			}}
		>
			<section
				className={clsx(modalDialogClassName, dialogClassName ?? modalDialogDefaultWidthClassName)}
				data-nested={isNested || undefined}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<div className={minimalHeader ? modalHeaderMinimalClassName : modalHeaderClassName} data-scrolled={hasScrolled}>
					<h3 id={titleId} className={minimalHeader ? "sr-only" : modalTitleClassName}>
						{title}
					</h3>
					<button
						type="button"
						className={modalCloseButtonClassName}
						onClick={() => setIsOpen(false)}
						aria-label="Close modal"
					>
						<span
							className={modalCloseIconClassName}
							style={{
								maskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
								WebkitMaskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
							}}
							aria-hidden="true"
						/>
					</button>
				</div>
				<div
					className={modalBodyClassName}
					onScroll={(event) => {
						if (event.target === event.currentTarget) {
							setHasScrolled(event.currentTarget.scrollTop > 0);
						}
					}}
				>
					<ModalCloseGuardProvider value={setGuardState}>
						{children}
					</ModalCloseGuardProvider>
				</div>
				{showCloseGuard && (
					<div
						className={modalCloseGuardOverlayClassName}
						onClick={(event) => {
							if (event.target === event.currentTarget) {
								setShowCloseGuard(false);
							}
						}}
					>
						<div className={modalCloseGuardActionsClassName}>
							<Button surface="modal" type="button" tone="neutral" onClick={() => setShowCloseGuard(false)}>
								Keep Editing
							</Button>
							{guardState?.canSave && (
								<Button
									surface="modal"
									type="button"
									tone="cta"
									onClick={() => {
										setShowCloseGuard(false);
										guardState.onSave();
									}}
								>
									Save changes
								</Button>
							)}
							<Button
								surface="modal"
								type="button"
								tone="danger"
								onClick={() => setIsOpen(false)}
							>
								Exit View
							</Button>
						</div>
					</div>
				)}
			</section>
		</div>
	);

	return (
		<>
			{triggerLabel !== undefined && (
				<Button surface="page" type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
					{triggerLabel}
				</Button>
			)}
			{isOpen && isMounted ? createPortal(
				<ModalNestingContext.Provider value={true}>{modal}</ModalNestingContext.Provider>,
				document.body,
			) : null}
		</>
	);
}
